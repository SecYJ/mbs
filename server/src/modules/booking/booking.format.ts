import { APP_TIME_ZONE } from "@mbs/shared/time";

// Server-built messages are read by people in the office, so they always use the app time zone,
// whatever zone the server process runs in.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
});

// For example "Sep 20, 2026 from 9:00 AM to 10:30 AM".
export function formatBookingSlot(startTime: Date, endTime: Date) {
    return `${dateFormatter.format(startTime)} from ${timeFormatter.format(startTime)} to ${timeFormatter.format(endTime)}`;
}
