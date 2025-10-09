-- CREATE TABLE "resources" (
-- 	"content" text NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"id" varchar(191) PRIMARY KEY NOT NULL,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL
-- );
-- --> statement-breakpoint
-- CREATE TABLE "historys" (
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"first_message" varchar(255) DEFAULT 'New Chat' NOT NULL,
-- 	"id" varchar(16) PRIMARY KEY NOT NULL,
-- 	"messages" jsonb NOT NULL
-- );
-- --> statement-breakpoint
-- CREATE TABLE "embeddings" (
-- 	"content" text NOT NULL,
-- 	"embedding" vector(1024) NOT NULL,
-- 	"id" varchar(191) PRIMARY KEY NOT NULL,
-- 	"resource_id" varchar(191)
-- );
--> statement-breakpoint
CREATE TABLE "schedule" (
	"created_at" timestamp DEFAULT now(),
	"date" timestamp with time zone NOT NULL,
	"description" text,
	"id" serial PRIMARY KEY NOT NULL,
	"is_completed" boolean DEFAULT false,
	"title" text NOT NULL
);
-- --> statement-breakpoint
-- ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- CREATE INDEX "embeddingIndex" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);