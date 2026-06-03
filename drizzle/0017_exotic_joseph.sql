ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'super_admin';--> statement-breakpoint
UPDATE "user"
SET "role" = 'super_admin'::"user_role"
WHERE (SELECT count(*) FROM "user") = 1;
