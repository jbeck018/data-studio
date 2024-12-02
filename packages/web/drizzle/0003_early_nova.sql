ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "query_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "query_history" CASCADE;--> statement-breakpoint
ALTER TABLE "database_connections" DROP CONSTRAINT "database_connections_created_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "database_connections" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "host" text NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "port" text NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "database" text NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "ssl" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "database_connections" ADD COLUMN "last_connected_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "hashed_password";--> statement-breakpoint
ALTER TABLE "database_connections" DROP COLUMN IF EXISTS "created_by_id";--> statement-breakpoint
ALTER TABLE "database_connections" DROP COLUMN IF EXISTS "config";--> statement-breakpoint
ALTER TABLE "database_connections" DROP COLUMN IF EXISTS "last_used_at";