ALTER TABLE "platforms" ALTER COLUMN "name" SET DEFAULT 'Platform name';--> statement-breakpoint
ALTER TABLE "platforms" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "platforms" ADD COLUMN "base_url" varchar(255) DEFAULT 'https://example.com' NOT NULL;