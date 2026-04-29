CREATE TABLE "booking_rules" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"max_booking_duration_hours" integer DEFAULT 8 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_rules_singleton" CHECK ("booking_rules"."id" = 1),
	CONSTRAINT "booking_rules_duration_positive" CHECK ("booking_rules"."max_booking_duration_hours" > 0)
);

INSERT INTO "booking_rules" ("id", "max_booking_duration_hours")
VALUES (1, 8)
ON CONFLICT ("id") DO NOTHING;
