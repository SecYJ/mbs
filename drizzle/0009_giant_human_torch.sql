ALTER TABLE "equipment" ADD COLUMN "purchase_date" date;--> statement-breakpoint
UPDATE "equipment" SET "purchase_date" = CURRENT_DATE WHERE "purchase_date" IS NULL;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "purchase_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "warranty_expiry" date;