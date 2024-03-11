CREATE TABLE IF NOT EXISTS "buckets" (
	"name" text NOT NULL,
	"provider" text DEFAULT 'vandal.services' NOT NULL,
	"endpoint" text DEFAULT 'minio.vandal.services' NOT NULL,
	"files" text DEFAULT 'files.vandal.services' NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "buckets_project_id_name_provider_pk" PRIMARY KEY("project_id","name","provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"social_image" text,
	"cover_image" text,
	"private" boolean DEFAULT false NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "categories_project_id_slug_unique" UNIQUE("project_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orgs_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(10) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"owner" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "orgs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text,
	"description" text,
	"social_image" text,
	"cover_image" text,
	"private" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"metadata" json DEFAULT '{}'::json,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts_to_categories" (
	"post_id" text NOT NULL,
	"category_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "posts_to_categories_post_id_category_id_pk" PRIMARY KEY("post_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"social_image" text,
	"cover_image" text,
	"private" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"metadata" json DEFAULT '{}'::json,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "posts_project_id_slug_unique" UNIQUE("project_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts_to_tags" (
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "posts_to_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"metadata" json DEFAULT '{}'::json,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"social_image" text,
	"cover_image" text,
	"private" boolean DEFAULT false NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "tags_project_id_slug_unique" UNIQUE("project_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "buckets_project_id_index" ON "buckets" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "buckets_name_index" ON "buckets" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "buckets_provider_index" ON "buckets" ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_project_id_index" ON "categories" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_slug_index" ON "categories" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orgs_members_organization_id_index" ON "orgs_members" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orgs_members_user_id_index" ON "orgs_members" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orgs_name_index" ON "orgs" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orgs_slug_index" ON "orgs" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_project_id_index" ON "pages" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_slug_index" ON "pages" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pages_project_id_slug_index" ON "pages" ("project_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_to_categories_post_id_index" ON "posts_to_categories" ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_to_categories_category_id_index" ON "posts_to_categories" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_project_id_index" ON "posts" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_slug_index" ON "posts" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_to_tags_post_id_index" ON "posts_to_tags" ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_to_tags_tag_id_index" ON "posts_to_tags" ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_organization_id_index" ON "projects" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_slug_index" ON "projects" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_session_user_id_index" ON "users_session" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_project_id_index" ON "tags" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_slug_index" ON "tags" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_index" ON "users" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buckets" ADD CONSTRAINT "buckets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orgs_members" ADD CONSTRAINT "orgs_members_organization_id_orgs_id_fk" FOREIGN KEY ("organization_id") REFERENCES "orgs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orgs_members" ADD CONSTRAINT "orgs_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orgs" ADD CONSTRAINT "orgs_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts_to_categories" ADD CONSTRAINT "posts_to_categories_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts_to_categories" ADD CONSTRAINT "posts_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts_to_tags" ADD CONSTRAINT "posts_to_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts_to_tags" ADD CONSTRAINT "posts_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_orgs_id_fk" FOREIGN KEY ("organization_id") REFERENCES "orgs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_session" ADD CONSTRAINT "users_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags" ADD CONSTRAINT "tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
