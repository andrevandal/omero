import { randomBytes } from "node:crypto";

import { scrypt } from "@noble/hashes/scrypt.js";
import { enums } from "@omero/schemas";
import { generateId } from "@omero/utils";
import { eq } from "drizzle-orm";

import {
  account,
  languages,
  medias,
  member,
  organization,
  posts,
  user,
  customFieldDefinitions,
  mediasTags,
  organizationLanguages,
  postsRevisions,
  postsTags,
  postsTranslations,
  tags,
} from ":schemas";

import { createDatabase } from "../index.js";

import {
  assignVisibility,
  createSEOCustomFields,
  generateRandomDate,
  generateSlug,
  loadJsonData,
} from "./utils.js";

const { db: database } = createDatabase({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

type FieldType = (typeof enums.CUSTOM_FIELD_TYPES)[number];
type VisibilityType = (typeof enums.VISIBILITY_TYPES)[number];

// Types
type UserData = {
  id: string;
  name: string;
  email: string;
  password: string;
  preferredLanguage: string;
};

type LanguageData = {
  code: string;
  name: string;
};

type CustomField = {
  type: string;
  required?: boolean;
  options?: string[];
  schema?: Record<string, unknown>;
  properties?: Record<string, unknown>;
};

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  owner: string;
  members: Array<{
    userId: string;
    role: "member" | "admin" | "owner";
  }>;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  languages: Array<{ code: string; isDefault: boolean }>;
  tags: Array<{
    key: string;
    customFields: Record<string, CustomField>;
  }>;
};

type PostData = {
  titles: { pt: string; en: string };
  content: { pt: string; en: string };
  visibility: VisibilityType;
};

type MediaData = {
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: number;
  title: string;
  altText: string;
  category: string;
};

// Helper function to hash passwords using scrypt (same as Better Auth)
const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const normalized = password.normalize("NFKC");
  const key = scrypt(normalized, salt, {
    N: 16_384,
    r: 16,
    p: 1,
    dkLen: 64,
  });
  return `${salt}:${Buffer.from(key).toString("hex")}`;
};

const resetDatabase = async () => {
  const schemas = [
    user,
    account,
    organization,
    member,
    languages,
    organizationLanguages,
    posts,
    postsTranslations,
    postsRevisions,
    tags,
    postsTags,
    medias,
    mediasTags,
    customFieldDefinitions,
  ];

  console.log("🗑️ Resetting database...");
  await Promise.all(schemas.map((schema) => database.delete(schema)));
};

const createLanguages = async () => {
  console.log("🌍 Creating languages...");
  const languagesData = loadJsonData<LanguageData[]>("languages.json");
  const languageMap = new Map<string, string>();

  for (const lang of languagesData) {
    const langId = generateId();
    languageMap.set(lang.code, langId);

    await database.insert(languages).values({
      id: langId,
      code: lang.code,
      name: lang.name,
    });
  }

  return { languageMap, languagesData };
};

const createUsers = async (languageMap: Map<string, string>) => {
  console.log("👥 Creating users...");
  const usersData = loadJsonData<UserData[]>("users.json");
  const userMap = new Map<string, { id: string; data: UserData }>();

  for (const userData of usersData) {
    const userId = generateId();
    userMap.set(userData.id, { id: userId, data: userData });

    const hashedPassword = await hashPassword(userData.password);

    await database.insert(user).values({
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: true,
      preferredLanguageId: languageMap.get(userData.preferredLanguage)!,
    });

    await database.insert(account).values({
      id: generateId(),
      userId: userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    });
  }

  return { userMap, usersData };
};

const createCustomFieldsForPosts = (orgId: string) => [
  {
    id: generateId(),
    organizationId: orgId,
    entityType: "post" as const,
    fieldKey: "meta_title",
    fieldType: "text" as FieldType,
    required: false,
    data: null,
  },
  {
    id: generateId(),
    organizationId: orgId,
    entityType: "post" as const,
    fieldKey: "meta_description",
    fieldType: "textarea" as FieldType,
    required: false,
    data: null,
  },
  {
    id: generateId(),
    organizationId: orgId,
    entityType: "post" as const,
    fieldKey: "og_tags",
    fieldType: "object" as FieldType,
    required: false,
    data: JSON.stringify({
      properties: {
        title: { type: "text" },
        description: { type: "textarea" },
        image: {
          type: "object",
          properties: {
            src: { type: "text" },
            width: { type: "text" },
            height: { type: "text" },
            alt: { type: "text" },
          },
        },
      },
    }),
  },
  {
    id: generateId(),
    organizationId: orgId,
    entityType: "post" as const,
    fieldKey: "schema_markup",
    fieldType: "object" as FieldType,
    required: false,
    data: null,
  },
];

const createCustomFieldsForTags = (
  orgData: OrganizationData,
  orgId: string
) => {
  const customFieldsForTags: Array<{
    id: string;
    organizationId: string;
    entityType: "tag";
    fieldKey: string;
    fieldType: FieldType;
    required: boolean;
    data: string | null;
  }> = [];

  const addedTagFields = new Set<string>();

  for (const tagConfig of orgData.tags) {
    for (const [fieldKey, fieldConfig] of Object.entries(
      tagConfig.customFields
    )) {
      const fieldIdentifier = `tag-${fieldKey}`;

      if (!addedTagFields.has(fieldIdentifier)) {
        addedTagFields.add(fieldIdentifier);

        const fieldType = fieldConfig.type as FieldType;
        const required = fieldConfig.required || false;
        const data =
          fieldConfig.schema || fieldConfig.properties || fieldConfig.options
            ? JSON.stringify(
                fieldConfig.schema ||
                  fieldConfig.properties || {
                    options: fieldConfig.options,
                  }
              )
            : null;

        customFieldsForTags.push({
          id: generateId(),
          organizationId: orgId,
          entityType: "tag" as const,
          fieldKey,
          fieldType,
          required,
          data,
        });
      }
    }
  }

  return customFieldsForTags;
};

const loadPostsData = (orgId: string): PostData[][] => {
  const orgPostsData: PostData[][] = [];

  if (orgId === "pedrohenri") {
    orgPostsData.push(
      loadJsonData<PostData[]>(
        "organizations/pedrohenri/posts-identidade-visual.json"
      ),
      loadJsonData<PostData[]>("organizations/pedrohenri/posts-ui-design.json")
    );
  } else if (orgId === "andrevandal") {
    orgPostsData.push(
      loadJsonData<PostData[]>(
        "organizations/andrevandal/posts-desenvolvimento.json"
      ),
      loadJsonData<PostData[]>("organizations/andrevandal/posts-tutorials.json")
    );
  }

  return orgPostsData;
};

const createPostTranslations = async (
  postId: string,
  postData: PostData,
  visibility: VisibilityType,
  languageMap: Map<string, string>
) => {
  const postTransPtId = generateId();
  const postTransEnId = generateId();

  const slugPt = generateSlug(postData.titles.pt, "pt");
  const slugEn = generateSlug(postData.titles.en, "en");

  const seoFieldsPt = createSEOCustomFields(
    postData.titles.pt,
    postData.content.pt,
    slugPt
  );
  const seoFieldsEn = createSEOCustomFields(
    postData.titles.en,
    postData.content.en,
    slugEn
  );

  await database.insert(postsTranslations).values([
    {
      id: postTransPtId,
      postId: postId,
      languageId: languageMap.get("pt-br")!,
      visibility: visibility,
      publishedAt: visibility === "public" ? generateRandomDate() : null,
      customFields: seoFieldsPt,
    },
    {
      id: postTransEnId,
      postId: postId,
      languageId: languageMap.get("en")!,
      visibility: visibility,
      publishedAt: visibility === "public" ? generateRandomDate() : null,
      customFields: seoFieldsEn,
    },
  ]);

  return { postTransPtId, postTransEnId, slugPt, slugEn };
};

const createPostRevisions = async (
  postId: string,
  postData: PostData,
  postTransPtId: string,
  postTransEnId: string,
  slugPt: string,
  slugEn: string,
  visibility: VisibilityType
) => {
  const revisionPtId = generateId();
  const revisionEnId = generateId();

  await database.insert(postsRevisions).values([
    {
      id: revisionPtId,
      postId: postId,
      postTranslationsId: postTransPtId,
      title: postData.titles.pt,
      slug: slugPt,
      content: postData.content.pt,
      publishedAt: visibility === "public" ? new Date() : null,
    },
    {
      id: revisionEnId,
      postId: postId,
      postTranslationsId: postTransEnId,
      title: postData.titles.en,
      slug: slugEn,
      content: postData.content.en,
      publishedAt: visibility === "public" ? new Date() : null,
    },
  ]);

  await database
    .update(postsTranslations)
    .set({ currentRevisionId: revisionPtId })
    .where(eq(postsTranslations.id, postTransPtId));

  await database
    .update(postsTranslations)
    .set({ currentRevisionId: revisionEnId })
    .where(eq(postsTranslations.id, postTransEnId));
};

const createPosts = async (
  orgData: OrganizationData,
  orgId: string,
  languageMap: Map<string, string>,
  tagMap: Map<string, string>
) => {
  console.log(`📰 Creating posts for ${orgData.name}...`);

  const orgPostsData = loadPostsData(orgData.id);
  let postIndex = 0;

  for (const [tagIndex, postsForTag] of orgPostsData.entries()) {
    const tagKey = orgData.tags[tagIndex].key;
    const tagId = tagMap.get(tagKey)!;

    for (const postData of postsForTag) {
      const postId = generateId();
      const visibility = assignVisibility(postIndex);

      await database.insert(posts).values({
        id: postId,
        organizationId: orgId,
        type: "article",
      });

      const { postTransPtId, postTransEnId, slugPt, slugEn } =
        await createPostTranslations(postId, postData, visibility, languageMap);

      await createPostRevisions(
        postId,
        postData,
        postTransPtId,
        postTransEnId,
        slugPt,
        slugEn,
        visibility
      );

      await database.insert(postsTags).values({
        id: generateId(),
        postId: postId,
        tagId: tagId,
      });

      postIndex++;
    }
  }
};

const createMediaFiles = async (
  orgData: OrganizationData,
  orgId: string,
  userMap: Map<string, { id: string; data: UserData }>,
  tagMap: Map<string, string>
) => {
  console.log(`🖼️ Creating media files for ${orgData.name}...`);
  const orgMediaData = loadJsonData<MediaData[]>(
    `organizations/${orgData.id}/media.json`
  );
  const createdMedias: string[] = [];
  const mediaOwnerId = userMap.get(orgData.owner)!.id;

  for (const media of orgMediaData) {
    const mediaId = generateId();

    await database.insert(medias).values({
      id: mediaId,
      organizationId: orgId,
      name: media.name,
      type: media.type,
      url: media.url,
      size: media.size,
      title: media.title,
      altText: media.altText,
      metadata: {
        uploadedBy: mediaOwnerId,
        originalName: media.name,
        category: media.category,
      },
    });

    createdMedias.push(mediaId);
  }

  const mediaPerTag = Math.ceil(createdMedias.length / orgData.tags.length);

  for (let index = 0; index < orgData.tags.length; index++) {
    const tagId = tagMap.get(orgData.tags[index].key)!;
    const startIndex = index * mediaPerTag;
    const endIndex = Math.min(startIndex + mediaPerTag, createdMedias.length);

    for (let index = startIndex; index < endIndex; index++) {
      if (createdMedias[index]) {
        await database.insert(mediasTags).values({
          id: generateId(),
          mediaId: createdMedias[index],
          tagId: tagId,
        });
      }
    }
  }
};

const main = async () => {
  await resetDatabase();

  console.log("📁 Loading data from JSON files...");
  const organizationsData =
    loadJsonData<OrganizationData[]>("organizations.json");
  const { languageMap, languagesData } = await createLanguages();
  const { userMap, usersData } = await createUsers(languageMap);

  console.log("🏢 Creating organizations...");
  for (const orgData of organizationsData) {
    const orgId = generateId();

    await database.insert(organization).values({
      id: orgId,
      name: orgData.name,
      slug: orgData.slug,
      settings: orgData.settings,
      metadata: orgData.metadata,
    });

    console.log(`🔗 Linking languages to ${orgData.name}...`);
    for (const orgLang of orgData.languages) {
      await database.insert(organizationLanguages).values({
        id: generateId(),
        organizationId: orgId,
        languageId: languageMap.get(orgLang.code)!,
        isDefault: orgLang.isDefault,
      });
    }

    console.log(`👨‍💼 Creating members for ${orgData.name}...`);
    for (const memberData of orgData.members) {
      const userId = userMap.get(memberData.userId)!.id;

      await database.insert(member).values({
        id: generateId(),
        organizationId: orgId,
        userId: userId,
        role: memberData.role,
      });
    }

    console.log(`📝 Creating custom field definitions for ${orgData.name}...`);
    const customFieldsForTags = createCustomFieldsForTags(orgData, orgId);
    const customFieldsForPosts = createCustomFieldsForPosts(orgId);

    await database
      .insert(customFieldDefinitions)
      .values([...customFieldsForTags, ...customFieldsForPosts]);

    console.log(`🏷️ Creating tags for ${orgData.name}...`);
    const tagMap = new Map<string, string>();

    for (const tagConfig of orgData.tags) {
      const tagId = generateId();
      tagMap.set(tagConfig.key, tagId);

      await database.insert(tags).values({
        id: tagId,
        organizationId: orgId,
        featured: true,
        visibility: "public",
      });
    }

    await createPosts(orgData, orgId, languageMap, tagMap);
    await createMediaFiles(orgData, orgId, userMap, tagMap);
  }

  console.log("✅ Database seed completed successfully!");
  console.log(`
📊 Created:
- ${usersData.length} users
- ${organizationsData.length} organizations
- ${languagesData.length} languages
- Multiple custom field definitions per organization
- Tags with translations and custom fields
- Posts with translations, revisions and SEO custom fields
- Media files with tag associations
- All necessary relationships and revisions

🔐 Login credentials:
${usersData.map((u) => `- ${u.email} : ${u.password}`).join("\n")}
  `);
};

main().catch((error) => {
  console.error("Seed failed:", error);
  throw error;
});
