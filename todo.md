# MTS Enhancement Backlog

Shared tracker for gradually improving the Meeting Room Booking System user experience.

Status key:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## P0 - Trust And Core Product Completion

### [ ] Replace Mock Admin Bookings With Real Data

Why: Admins currently see hard-coded booking data, so the admin bookings page does not reflect the actual system.

Likely files:

- `src/features/admin/pages/bookings-page.tsx`
- `src/features/admin/services/bookings/fns.ts`
- `src/features/admin/services/bookings/queries.ts`
- `src/routes/admin/bookings.tsx`

Implementation slices:

- [ ] Add DB-backed admin booking query.
- [ ] Show real booking title, room, organizer, attendees, date/time, and status.
- [ ] Add URL-backed search/filter/sort state.
- [ ] Replace local cancel state with a server mutation.
- [ ] Add tests for admin booking query and cancellation permissions.

### [x] Preserve Booking History On Cancellation

Why: Cancelling currently deletes booking-related rows, which removes history and prevents good audit/user feedback.

Likely files:

- `src/db/schema.ts`
- `src/features/bookings/services/fns.ts`
- `src/features/bookings/schema/booking.schema.ts`
- Drizzle migration files

Implementation slices:

- [x] Add booking lifecycle fields such as `status`, `cancelledAt`, `cancelledBy`, and `cancelReason`.
- [x] Change cancel mutation from hard delete to status update.
- [x] Hide or visually mute cancelled bookings in calendar views.
- [x] Keep cancelled bookings visible in history/admin views.
- [x] Add tests for cancelled booking behavior.

### [x] Notify Attendees When A Booking Is Cancelled

Why: Users need to know when meetings they participate in are cancelled.

Likely files:

- `src/features/bookings/services/fns.ts`
- `src/features/notifications/services/fns.ts`
- `src/features/notifications/notification-format.ts`
- `src/routes/_bookings/notifications.tsx`

Implementation slices:

- [x] Insert cancellation notifications for attendees during cancel mutation.
- [x] Include room/time context in cancellation messages.
- [x] Keep notification rows when bookings are cancelled.
- [x] Ensure notification links open a useful cancelled/history view.

### [ ] Add Admin Cancel-Any-Booking Permission

Why: Requirements say admins can cancel any booking system-wide, but current cancellation requires ownership.

Likely files:

- `src/features/bookings/services/fns.ts`
- `src/features/admin/services/bookings/fns.ts`
- `src/features/admin/pages/bookings-page.tsx`

Implementation slices:

- [ ] Add an admin-only cancel mutation or extend cancellation authorization.
- [ ] Require a cancellation reason in admin flow.
- [ ] Notify organizer and attendees.
- [ ] Show who cancelled the booking in admin/history views.

## P1 - User-Facing Booking Experience

### [x] Add My Bookings Page

Why: Users need a focused view of meetings they own or attend, grouped by status.

Likely files:

- `src/routes/_bookings/my-bookings.tsx`
- `src/routes/_bookings/route.tsx`
- `src/features/bookings/services/fns.ts`
- `src/features/bookings/services/queries.ts`

Implementation slices:

- [x] Add route and nav item.
- [x] Query bookings for current user as organizer or attendee.
- [x] Group into Upcoming, In Progress, and Past.
- [x] Add quick actions for view, edit, and cancel where allowed.
- [x] Add empty states for each group.

### [x] Add Single-Room Day Detail View

Why: Users can filter rooms, but cannot drill into a room to inspect its day schedule and details.

Likely files:

- `src/routes/_bookings/rooms.$roomId.tsx`
- `src/features/bookings/services/fns.ts`
- `src/routes/_bookings/bookings.tsx`

Implementation slices:

- [x] Add room detail route.
- [x] Show room location, capacity, equipment, and availability.
- [x] Show a day schedule for only that room.
- [x] Add "Book this room" action with prefilled room/time.
- [x] Link room chips/resource labels to the detail route.

### [x] Improve Conflict Error Messages

Why: Overlap errors should tell users which occupied slot caused the conflict.

Likely files:

- `src/features/bookings/services/fns.ts`
- `src/features/bookings/booking-dialog.tsx`
- `src/features/bookings/schema/booking.schema.test.ts`

Implementation slices:

- [x] Query overlapping booking start/end/title/room.
- [x] Format a clear conflict message with the occupied time slot.
- [x] Keep messages safe for privacy if the viewer should not see full details.
- [x] Add tests for create and edit conflicts.

### [x] Add Calendar Empty And Filter-Zero States

Why: The calendar is weak when no rooms exist or filters hide every room.

Likely files:

- `src/routes/_bookings/bookings.tsx`

Implementation slices:

- [x] Show an onboarding empty state when there are no rooms.
- [x] Show a filter-empty state when no rooms match filters.
- [x] Add a reset-filters action.
- [x] Add admin shortcut for admins when no rooms exist.

## P1 - Notifications And Preferences

### [ ] Add Real-Time Notification Delivery

Why: Requirements call for SSE, and users should receive booking updates without refreshing or navigating.

Likely files:

- `src/routes/api/notifications/stream.ts`
- `src/features/notifications/services/fns.ts`
- `src/routes/_bookings/route.tsx`
- `src/features/notifications/services/queries.ts`

Implementation slices:

- [ ] Add authenticated SSE endpoint.
- [ ] Subscribe from the app shell.
- [ ] Update React Query cache when notification events arrive.
- [ ] Reconnect gracefully after network interruptions.
- [ ] Keep a polling fallback if SSE is unavailable.

### [ ] Make Notification Preferences Account-Based

Why: Sound preferences currently live in localStorage, so they do not follow users across devices.

Likely files:

- `src/db/schema.ts`
- `src/features/settings/user-preferences.ts`
- `src/routes/_bookings/settings.tsx`

Implementation slices:

- [ ] Add `user_preferences` table.
- [ ] Add get/update preference server functions.
- [ ] Hydrate settings from the database.
- [ ] Preserve localStorage as a migration/fallback path.

### [ ] Expand Settings Beyond Sound

Why: Settings page shows Delivery, Quiet hours, and Digest as placeholders.

Likely files:

- `src/routes/_bookings/settings.tsx`
- `src/features/settings/user-preferences.ts`

Implementation slices:

- [ ] Add quiet hours.
- [ ] Add delivery preferences for in-app sound/visual alerts.
- [ ] Add optional digest preference if it fits V1.
- [ ] Remove placeholder-only cards once real controls exist.

## P1 - Admin Management Completion

### [ ] Complete Room Management

Why: Admins can create/list rooms, but edit/delete/toggle flows are missing or read-only.

Likely files:

- `src/features/admin/services/rooms/fns.ts`
- `src/features/admin/components/room-row.tsx`
- `src/features/admin/pages/rooms-page.tsx`
- `src/features/admin/schema/room.schema.ts`

Implementation slices:

- [ ] Edit room name, location, capacity, and availability.
- [ ] Assign/unassign equipment with quantities.
- [ ] Disable rooms while preserving existing bookings.
- [ ] Delete rooms only when safe, or soft-delete/archive them.
- [ ] Add validation and tests for disabled room booking rejection.

### [ ] Complete Equipment Management

Why: Equipment can be created/listed, but not edited/deleted/assigned from the equipment side.

Likely files:

- `src/features/admin/services/equipment/fns.ts`
- `src/features/admin/components/equipment-row.tsx`
- `src/features/admin/pages/equipment-page.tsx`
- `src/features/admin/schema/equipment.schema.ts`

Implementation slices:

- [ ] Edit equipment fields.
- [ ] Delete/archive equipment safely.
- [ ] Show room assignments for each equipment item.
- [ ] Add assignment management from equipment detail.

### [ ] Complete User Management

Why: Admins can create/list users, but cannot disable accounts, reset passwords, or change roles after creation.

Likely files:

- `src/db/schema.ts`
- `src/features/admin/services/users/fns.ts`
- `src/features/admin/pages/users-page.tsx`
- `src/features/admin/schema/user.schema.ts`

Implementation slices:

- [ ] Add account active/disabled status.
- [ ] Add enable/disable user actions.
- [ ] Add grant/revoke admin action.
- [ ] Add admin-triggered password reset.
- [ ] Prevent an admin from locking out the final admin account.

## P2 - Product Polish And Reliability

### [ ] Fix Registration Production UX

Why: Registration currently contains seeded defaults and logs errors instead of showing form feedback.

Likely files:

- `src/features/register/hooks/useRegister.ts`
- `src/features/register/components/RegisterForm.tsx`

Implementation slices:

- [ ] Remove seeded default values.
- [ ] Surface registration errors in the form.
- [ ] Add loading state to returned hook data if needed.
- [ ] Add duplicate email error copy.

### [ ] Add Route-Level Loading And Error States

Why: Suspense loaders need designed pending/error states for slow or failed requests.

Likely files:

- `src/routes/__root.tsx`
- `src/routes/_bookings/bookings.tsx`
- `src/routes/_bookings/notifications.tsx`
- `src/routes/admin/*.tsx`

Implementation slices:

- [ ] Add root error component.
- [ ] Add route pending components for main app routes.
- [ ] Add admin-specific loading/error states.
- [ ] Ensure failed mutations show user-friendly errors.

### [ ] Update App Metadata And Production Devtools Behavior

Why: The document title still says "TanStack Start Starter", and devtools render unconditionally.

Likely files:

- `src/routes/__root.tsx`

Implementation slices:

- [ ] Change title/meta to Meridian or MTS.
- [ ] Add useful app description.
- [ ] Render TanStack devtools only in development.

### [ ] Clarify Facilities Vs Equipment Model

Why: The schema has `facilities` and `roomFacilities`, but the UI filters by `roomEquipment`.

Likely files:

- `src/db/schema.ts`
- `src/features/admin/services/rooms/fns.ts`
- `src/features/bookings/services/fns.ts`
- Seed scripts

Implementation slices:

- [ ] Decide whether facilities are separate from equipment.
- [ ] Remove unused model or expose it in admin/user filtering.
- [ ] Update seed scripts and docs to match the chosen model.

### [x] Add Attendee RSVP Flow

Why: `attendees.accepted` exists, but users cannot accept or decline invitations.

Likely files:

- `src/db/schema.ts`
- `src/features/bookings/services/fns.ts`
- `src/routes/_bookings/notifications.tsx`
- `src/routes/_bookings/my-bookings.tsx`

Implementation slices:

- [x] Change attendee status from boolean to richer state if needed.
- [x] Add accept/decline server action.
- [x] Show RSVP status in booking details.
- [x] Let organizers see attendee responses.

## Later / V2 Candidates

### [ ] Recurring Meetings

Why: Useful for weekly standups and repeated team rituals, but listed as V2+ in requirements.

### [ ] Calendar Integrations

Why: Google/Outlook sync would reduce duplicate scheduling work, but is out of V1 scope.

### [ ] Audit Log

Why: Admin changes and cancellation history become easier to trust once the product is used by a real organization.
