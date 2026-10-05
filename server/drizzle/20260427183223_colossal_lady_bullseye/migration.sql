CREATE TABLE "room_equipment" (
	"room_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "room_equipment_room_id_equipment_id_pk" PRIMARY KEY("room_id","equipment_id"),
	CONSTRAINT "room_equipment_quantity_positive" CHECK ("room_equipment"."quantity" >= 1)
);
--> statement-breakpoint
ALTER TABLE "room_equipment" ADD CONSTRAINT "room_equipment_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_equipment" ADD CONSTRAINT "room_equipment_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("equipment_id") ON DELETE cascade ON UPDATE no action;