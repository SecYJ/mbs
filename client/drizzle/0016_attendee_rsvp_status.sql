CREATE TYPE "public"."attendee_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
ALTER TABLE "attendees" ADD COLUMN "status" "attendee_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "attendees" SET "status" = CASE WHEN "accepted" THEN 'accepted'::"attendee_status" ELSE 'pending'::"attendee_status" END;--> statement-breakpoint
ALTER TABLE "attendees" DROP COLUMN "accepted";
