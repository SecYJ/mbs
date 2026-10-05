-- Database-level double-booking guard. The booking service still checks overlaps first to return a friendly message;
-- this constraint is the last line of defence if two requests ever slip past that check.
-- btree_gist lets a GiST index compare plain values (room_id with =) next to ranges (time with &&).
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_room_overlap" EXCLUDE USING gist (
	"room_id" WITH =,
	tstzrange("start_time", "end_time") WITH &&
) WHERE ("status" = 'active');
