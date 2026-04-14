# Meeting Room Booking System - V1 Requirements

## Project Overview

A full-stack internal meeting room booking web app. Employees can view room availability, book meeting rooms, invite attendees, and admins can manage rooms and users.

## Tech Stack

- **Framework**: TanStack Start
- **Runtime**: Bun
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Calendar UI**: FullCalendar (resource view for multi-room timeline)
- **Notifications**: Server-Sent Events (SSE)

## User Roles

### Regular User

- Any registered user can book meeting rooms
- No special permission restrictions

### Admin

- Has all regular user permissions
- Can additionally manage rooms, booking rules, and user accounts

## Authentication

- Email + Password registration / login
- No SSO / Google Workspace integration in V1 (deferred to V2)

## Core Features

### 1. Meeting Room Booking

#### Booking Fields

- Meeting title
- Room — selected from available list
- Start time
- End time
- Attendees — selected from registered users
- Description / Notes (optional)

#### Booking Rules

- Cannot book past time slots
- No advance booking time limit (can book anytime)
- Maximum single booking duration: **8 hours**
- Same room cannot be double-booked for the same time slot (conflict detection required on both frontend and backend)

#### Conflict Detection

- Check for time slot conflicts when creating a booking
- Re-validate conflicts when modifying a booking
- Error messages must clearly indicate which time slot is already occupied

### 2. View / Browse Meeting Rooms

#### Resource View (Main View)

- Y-axis: All meeting rooms
- X-axis: Time (defaults to current day)
- At-a-glance view of which rooms are available at which time slots
- Uses FullCalendar's `resourceTimeGridDay`

#### Calendar View Switching

- Support day / week / month view toggle (similar to Google Calendar)
- **Day view**: Detailed hourly time slots for the selected date
- **Week view**: Overview of the current week's bookings
- **Month view**: High-level monthly overview with booking indicators
- Default view: Day view

#### Single Room Day View

- Click into a specific room to view its full day of bookings

#### Room Filtering

- Filter by capacity
- Filter by equipment (projector, video conferencing, whiteboard, etc.)
- Filter by location

### 3. Modify / Cancel Bookings

- Users can modify / cancel their own bookings
- Time modifications require conflict re-detection
- Cancellation notifies all attendees

### 4. My Bookings

- List all bookings for the current user
- Categorized as: Upcoming / In Progress / Completed
- Quick links to modify / cancel

### 5. In-App Notification System

#### Implementation

- **Server-Sent Events (SSE)** — server pushes to frontend
- No email notifications in V1

#### Notification Triggers

- Added as an attendee to a meeting
- A meeting the user is part of is modified (time, location, etc.)
- A meeting the user is part of is cancelled

#### Notification Center UI

- Bell icon + unread count badge in top navigation
- Click to expand notification list
- Read / unread status
- Mark as read / mark all as read

### 6. Meeting Room Properties

Each room should have the following attributes:

- Name
- Location (e.g., "3rd Floor East")
- Capacity
- Equipment — projector, video conferencing, whiteboard, TV screen, etc.
- Description (optional)
- Active / Inactive status

## Admin Portal

Separate admin interface, accessible only to admin role users.

### 1. Room Management

- Add / edit / delete rooms
- Edit all room attributes (name, location, capacity, equipment, etc.)
- Enable / disable rooms (disabled rooms cannot be booked, but existing bookings are preserved)

### 2. User Management

- View all users list
- Reset user passwords
- Enable / disable user accounts
- Grant / revoke admin privileges

### 3. Booking Rules Configuration

- Maximum single booking duration (default 8 hours, adjustable)
- Other rule parameters (reserved for future expansion)

### 4. View All Bookings

- View all bookings across users system-wide
- Cancel bookings on behalf of users when necessary (e.g., policy violations)

## Out of V1 Scope (Deferred to V2+)

- SSO / Google Workspace / Microsoft login integration
- Recurring meetings (weekly standup, etc.)
- Google Calendar / Outlook bi-directional sync
- Email notifications
- Audit logs (who did what and when)
- Auto-release no-show bookings
- Cross-timezone support
- Native mobile app

## Open Items / To Be Decided

- [ ] Database schema design (users / rooms / bookings / notifications / etc.)
- [ ] SSE implementation details and TanStack Start integration
- [ ] FullCalendar + shadcn theme styling integration
- [ ] Deployment strategy (Vercel / Railway / self-hosted)
- [ ] Password hashing strategy (bcrypt / argon2)
- [ ] Session management approach (cookie-based / JWT)
