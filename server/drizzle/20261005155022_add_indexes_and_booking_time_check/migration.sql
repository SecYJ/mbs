CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "attendees_user_id_idx" ON "attendees" ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_room_active_time_idx" ON "bookings" ("room_id","start_time","end_time") WHERE "status" = 'active';--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_booking_id_idx" ON "notifications" ("booking_id");--> statement-breakpoint
CREATE INDEX "room_equipment_equipment_id_idx" ON "room_equipment" ("equipment_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_end_after_start" CHECK ("end_time" > "start_time");
