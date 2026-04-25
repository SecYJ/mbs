# Meeting Room Booking System — Requirements

Internal web application for employees to view room availability, create bookings, invite attendees, and for admins to manage rooms and users.

---

## 1. User Roles

### 1.1 User (Default)

- Any registered account
- Can create, edit, and cancel their own bookings
- Can view all rooms and their availability
- Receives in-app notifications for meetings they participate in

### 1.2 Admin

- All User permissions, plus:
- Manage rooms (create, edit, delete, enable/disable)
- Manage users (view list, reset passwords, enable/disable accounts, grant/revoke admin)
- Configure booking rules (max duration, etc.)
- View and cancel any booking system-wide

---

## 2. Authentication

- Email + password registration and login
- Out of scope for V1: SSO, Google Workspace, Microsoft login

---

## 3. Bookings

### 3.1 Create Booking

Required fields:

| Field       | Type         | Notes                     |
| ----------- | ------------ | ------------------------- |
| Title       | text         | Meeting title             |
| Room        | select       | From available rooms list |
| Start time  | datetime     |                           |
| End time    | datetime     |                           |
| Attendees   | multi-select | From registered users     |
| Description | text         | Optional                  |

### 3.2 Booking Rules

- Cannot book in the past
- No advance booking limit (can book any future time)
- Maximum single booking duration: **8 hours** (admin-configurable)
- A room cannot have overlapping bookings in the same time slot

### 3.3 Conflict Detection

- Enforced on both **create** and **edit** operations
- Validated on both **client** and **server**
- Error messages must specify which time slot is already occupied

### 3.4 Edit Booking

- Users can edit their own bookings
- Conflict detection re-runs on time/room changes
- Attendees are notified of changes

### 3.5 Cancel Booking

- Users can cancel their own bookings
- Admins can cancel any booking
- All attendees are notified on cancellation

---

## 4. Room Browsing

### 4.1 Resource View (Primary)

- Uses FullCalendar `resourceTimeGridDay`
- Y-axis: all rooms
- X-axis: time slots (defaults to current day)
- Shows at a glance which rooms are free in which time slots

### 4.2 Single Room Day View

- Click into a room to see its full day schedule

### 4.3 Room Filtering

- By capacity (number of people)
- By equipment (projector, video conferencing, whiteboard, TV screen, etc.)
- By location

---

## 5. My Bookings

- Lists all bookings for the current user
- Grouped into three categories:
    - **Upcoming** — future bookings not yet started
    - **In Progress** — currently active bookings
    - **Past** — completed bookings
- Quick actions to edit or cancel from the list

---

## 6. Notifications

### 6.1 Transport

- **Server-Sent Events (SSE)** — server pushes to client in real time
- No email notifications in V1

### 6.2 Trigger Events

| Event                               | Recipients     |
| ----------------------------------- | -------------- |
| Added as attendee to a booking      | The added user |
| Booking modified (time, room, etc.) | All attendees  |
| Booking cancelled                   | All attendees  |

### 6.3 Notification Center UI

- Bell icon in the top navigation bar
- Unread count badge on the bell icon
- Click to expand notification list
- Each notification has read / unread state
- Actions: mark individual as read, mark all as read

---

## 7. Room Properties

Each room has the following attributes:

| Property    | Type    | Notes                                                                          |
| ----------- | ------- | ------------------------------------------------------------------------------ |
| Name        | text    | Required                                                                       |
| Location    | text    | e.g. "3F East Wing". Required                                                  |
| Capacity    | integer | Number of people. Required                                                     |
| Equipment   | list    | Projector, video conferencing, whiteboard, TV, etc. Via facilities join table  |
| Description | text    | Optional                                                                       |
| Active      | boolean | Inactive rooms cannot receive new bookings but existing bookings are preserved |

---

## 8. Admin Portal

Separate admin interface accessible only to admin-role users.

### 8.1 Room Management

- Create / edit / delete rooms
- Edit all room properties (name, location, capacity, equipment, description)
- Enable / disable rooms (disabled rooms reject new bookings; existing bookings remain)

### 8.2 User Management

- View all users
- Reset user passwords
- Enable / disable user accounts
- Grant / revoke admin role

### 8.3 Booking Rules Configuration

- Maximum single booking duration (default: 8 hours)
- Reserved for future rule parameters

### 8.4 All Bookings View

- View all bookings across all users
- Cancel bookings when necessary (e.g. policy violations)

---

## 9. Out of Scope (V2+)

- SSO / Google Workspace / Microsoft login
- Recurring meetings (weekly standup, etc.)
- Google Calendar / Outlook bi-directional sync
- Email notifications
- Audit log (who did what and when)
- Auto-release for no-show bookings
- Cross-timezone support
- Native mobile app

---

## 10. Open Questions

- [ ] SSE integration approach with TanStack Start
- [ ] FullCalendar + shadcn theme styling integration
- [ ] Deployment target (Vercel / Railway / self-hosted)
- [ ] Password hashing algorithm (bcrypt / argon2)
- [ ] Session management strategy (cookie-based / JWT)
