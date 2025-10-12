import { describe, expect, test } from "vitest";

import {
  createCustomFieldsSchema,
  validateCustomFields,
  type CustomFieldDefinition,
} from "../src";

describe("Custom Fields Validation", () => {
  test("text field with length constraints", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "title",
      fieldType: "text",
      required: true,
      validation: { minLength: 5, maxLength: 100 },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(validateCustomFields({ title: "Hi" }, schema).success).toBe(false);
    expect(
      validateCustomFields({ title: "Valid title here" }, schema).success
    ).toBe(true);
    expect(
      validateCustomFields({ title: "A".repeat(101) }, schema).success
    ).toBe(false);
  });

  test("email validation", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "email",
      fieldType: "text",
      required: true,
      validation: { email: true },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(
      validateCustomFields({ email: "invalid-email" }, schema).success
    ).toBe(false);
    expect(
      validateCustomFields({ email: "valid@email.com" }, schema).success
    ).toBe(true);
  });

  test("select field with options", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "status",
      fieldType: "select",
      required: true,
      data: { values: ["draft", "published", "archived"] },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(validateCustomFields({ status: "invalid" }, schema).success).toBe(
      false
    );
    expect(validateCustomFields({ status: "draft" }, schema).success).toBe(
      true
    );
  });

  test("number field with min/max", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "reading_time",
      fieldType: "number",
      required: true,
      validation: { min: 1, max: 60 },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(validateCustomFields({ readingTime: 0 }, schema).success).toBe(
      false
    );
    expect(validateCustomFields({ readingTime: 5 }, schema).success).toBe(true);
    expect(validateCustomFields({ readingTime: 61 }, schema).success).toBe(
      false
    );
  });

  test("boolean field required/optional", () => {
    const requiredDef: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "featured",
      fieldType: "boolean",
      required: true,
    };

    const optionalDef: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "archived",
      fieldType: "boolean",
      required: false,
    };

    const schema = createCustomFieldsSchema("post", [requiredDef, optionalDef]);

    expect(validateCustomFields({ featured: true }, schema).success).toBe(true);
    expect(validateCustomFields({}, schema).success).toBe(false); // missing required
    expect(
      validateCustomFields({ featured: true, archived: false }, schema).success
    ).toBe(true);
  });
});

describe("Advanced Custom Field Types", () => {
  test("object field with nested validation", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "author",
      fieldType: "object",
      required: true,
      data: {
        schema: {
          name: {
            entityType: "post" as const,
            fieldKey: "name",
            fieldType: "text" as const,
            required: true,
            validation: { minLength: 2 },
          },
          email: {
            entityType: "post" as const,
            fieldKey: "email",
            fieldType: "text" as const,
            required: false,
            validation: { email: true },
          },
          bio: {
            entityType: "post" as const,
            fieldKey: "bio",
            fieldType: "textarea" as const,
            required: false,
            validation: { maxLength: 500 },
          },
        },
      },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(
      validateCustomFields(
        {
          author: {
            name: "John Doe",
            email: "john@example.com",
            bio: "Software developer",
          },
        },
        schema
      ).success
    ).toBe(true);

    expect(
      validateCustomFields(
        {
          author: {
            name: "J", // Too short
            email: "invalid-email",
          },
        },
        schema
      ).success
    ).toBe(false);
  });

  test("list field with item validation", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "tags",
      fieldType: "list",
      required: true,
      data: { itemType: "text" },
      validation: { minItems: 1, maxItems: 10 },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(validateCustomFields({ tags: [] }, schema).success).toBe(false); // Min items
    expect(
      validateCustomFields({ tags: ["tag1", "tag2"] }, schema).success
    ).toBe(true);
    expect(
      validateCustomFields(
        { tags: Array.from({ length: 11 }).fill("tag") },
        schema
      ).success
    ).toBe(false); // Max items
  });

  test("image field validation with size/type constraints", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "featured_image",
      fieldType: "image",
      required: true,
      validation: {
        allowedTypes: ["image/jpeg", "image/png"],
        maxSize: 1024 * 1024 * 2, // 2MB
        maxWidth: 1920,
        maxHeight: 1080,
      },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(
      validateCustomFields(
        {
          featuredImage: {
            url: "https://example.com/image.jpg",
            type: "image/jpeg",
            size: 1024 * 1024, // 1MB
            width: 1200,
            height: 800,
          },
        },
        schema
      ).success
    ).toBe(true);

    expect(
      validateCustomFields(
        {
          featuredImage: {
            url: "https://example.com/image.gif",
            type: "image/gif", // Not allowed
            size: 1024 * 1024,
          },
        },
        schema
      ).success
    ).toBe(false);
  });

  test("nested object in list items", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "authors",
      fieldType: "list",
      required: true,
      data: {
        itemType: "object",
        itemSchema: {
          entityType: "post" as const,
          fieldKey: "author_item",
          fieldType: "object" as const,
          required: true,
          data: {
            schema: {
              name: {
                entityType: "post" as const,
                fieldKey: "name",
                fieldType: "text" as const,
                required: true,
              },
              role: {
                entityType: "post" as const,
                fieldKey: "role",
                fieldType: "text" as const,
                required: false,
              },
            },
          },
        },
      },
    };

    const schema = createCustomFieldsSchema("post", [definition]);

    expect(
      validateCustomFields(
        {
          authors: [
            { name: "John Doe", role: "Lead Author" },
            { name: "Jane Smith" },
          ],
        },
        schema
      ).success
    ).toBe(true);

    expect(
      validateCustomFields(
        {
          authors: [
            { role: "Lead Author" }, // Missing required name
          ],
        },
        schema
      ).success
    ).toBe(false);
  });
});

describe("Custom Fields Integration", () => {
  test("complete post with multiple custom fields", () => {
    const definitions: CustomFieldDefinition[] = [
      {
        entityType: "post",
        fieldKey: "author_bio",
        fieldType: "textarea",
        required: true,
      },
      {
        entityType: "post",
        fieldKey: "reading_time",
        fieldType: "number",
        required: false,
      },
      {
        entityType: "post",
        fieldKey: "featured_image",
        fieldType: "image",
        required: true,
      },
      {
        entityType: "post",
        fieldKey: "metadata",
        fieldType: "object",
        required: false,
        data: {
          schema: {
            seoTitle: {
              entityType: "post" as const,
              fieldKey: "seo_title",
              fieldType: "text" as const,
              required: false,
            },
          },
        },
      },
    ];

    const schema = createCustomFieldsSchema("post", definitions);

    const validData = {
      authorBio: "Author biography text...",
      readingTime: 5,
      featuredImage: {
        url: "https://example.com/image.jpg",
        type: "image/jpeg",
        size: 123_456,
      },
      metadata: { seoTitle: "Custom SEO title" },
    };

    expect(validateCustomFields(validData, schema).success).toBe(true);
  });

  test("schema generation from definitions", () => {
    const definitions: CustomFieldDefinition[] = [
      {
        entityType: "post",
        fieldKey: "post_field",
        fieldType: "text",
        required: true,
      },
      {
        entityType: "tag",
        fieldKey: "tag_field",
        fieldType: "text",
        required: true,
      },
    ];

    const postSchema = createCustomFieldsSchema("post", definitions);
    const tagSchema = createCustomFieldsSchema("tag", definitions);

    expect(
      validateCustomFields({ postField: "test" }, postSchema).success
    ).toBe(true);
    expect(validateCustomFields({ tagField: "test" }, postSchema).success).toBe(
      false
    );

    expect(validateCustomFields({ tagField: "test" }, tagSchema).success).toBe(
      true
    );
    expect(validateCustomFields({ postField: "test" }, tagSchema).success).toBe(
      false
    );
  });

  test("validation errors with detailed messages", () => {
    const definition: CustomFieldDefinition = {
      entityType: "post",
      fieldKey: "title",
      fieldType: "text",
      required: true,
      validation: { minLength: 5 },
    };

    const schema = createCustomFieldsSchema("post", [definition]);
    const result = validateCustomFields({ title: "hi" }, schema);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toBeDefined();
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
