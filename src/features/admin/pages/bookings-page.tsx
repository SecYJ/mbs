import { useState, useMemo } from "react";
import { CalendarDays, TrendingUp, Building2, Eye, Ban, Check, Filter } from "lucide-react";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";

/* ── Mock data ── */

type BookingStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

interface Booking {
    id: string;
    title: string;
    room: string;
    bookedBy: string;
    attendees: number;
    date: string;
    time: string;
    status: BookingStatus;
}

const initialBookings: Booking[] = [
    {
        id: "1",
        title: "Sprint Planning",
        room: "Horizon Hall",
        bookedBy: "Alice Chen",
        attendees: 6,
        date: "2026-04-14",
        time: "09:00 – 10:30",
        status: "upcoming",
    },
    {
        id: "2",
        title: "Design Review",
        room: "Summit Room",
        bookedBy: "Bob Wang",
        attendees: 3,
        date: "2026-04-14",
        time: "10:00 – 11:00",
        status: "in-progress",
    },
    {
        id: "3",
        title: "1:1 Catchup",
        room: "Spark Pod",
        bookedBy: "David Zhang",
        attendees: 2,
        date: "2026-04-14",
        time: "14:00 – 14:30",
        status: "upcoming",
    },
    {
        id: "4",
        title: "All Hands Meeting",
        room: "Horizon Hall",
        bookedBy: "Alice Chen",
        attendees: 25,
        date: "2026-04-13",
        time: "15:00 – 16:30",
        status: "completed",
    },
    {
        id: "5",
        title: "Client Demo",
        room: "Summit Room",
        bookedBy: "Eve Huang",
        attendees: 5,
        date: "2026-04-13",
        time: "11:00 – 12:00",
        status: "completed",
    },
    {
        id: "6",
        title: "Retro Q1",
        room: "Horizon Hall",
        bookedBy: "Frank Li",
        attendees: 12,
        date: "2026-04-12",
        time: "13:00 – 14:00",
        status: "completed",
    },
    {
        id: "7",
        title: "Training Session",
        room: "Boardroom One",
        bookedBy: "Carol Liu",
        attendees: 15,
        date: "2026-04-12",
        time: "09:00 – 12:00",
        status: "cancelled",
    },
    {
        id: "8",
        title: "Product Sync",
        room: "Spark Pod",
        bookedBy: "Bob Wang",
        attendees: 3,
        date: "2026-04-15",
        time: "10:00 – 10:30",
        status: "upcoming",
    },
];

const STATUS_STYLES: Record<BookingStatus, { bg: string; color: string; label: string }> = {
    upcoming: { bg: "var(--a-info-subtle)", color: "var(--a-info)", label: "Upcoming" },
    "in-progress": { bg: "var(--a-accent-subtle)", color: "var(--a-accent)", label: "In Progress" },
    completed: { bg: "var(--a-surface-2)", color: "var(--a-text-muted)", label: "Completed" },
    cancelled: { bg: "var(--a-danger-subtle)", color: "var(--a-danger)", label: "Cancelled" },
};

export function BookingsPage() {
    const { toast } = useAdminToast();
    const [bookings, setBookings] = useState(initialBookings);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [roomFilter, setRoomFilter] = useState<string>("all");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const rooms = useMemo(() => [...new Set(bookings.map((b) => b.room))], [bookings]);

    const filtered = useMemo(() => {
        let list = bookings;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.bookedBy.toLowerCase().includes(q) ||
                    b.room.toLowerCase().includes(q),
            );
        }
        if (statusFilter !== "all") {
            list = list.filter((b) => b.status === statusFilter);
        }
        if (roomFilter !== "all") {
            list = list.filter((b) => b.room === roomFilter);
        }
        return list;
    }, [bookings, search, statusFilter, roomFilter]);

    /* ── Stats ── */
    const todayCount = bookings.filter((b) => b.date === "2026-04-14" && b.status !== "cancelled").length;
    const weekCount = bookings.filter((b) => b.status !== "cancelled").length;
    const roomCounts: Record<string, number> = {};
    for (const b of bookings) {
        if (b.status !== "cancelled") {
            roomCounts[b.room] = (roomCounts[b.room] || 0) + 1;
        }
    }
    const popularRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];

    const handleCancel = (id: string) => {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
        const booking = bookings.find((b) => b.id === id);
        toast(`"${booking?.title}" cancelled`, "danger");
        setCancellingId(null);
        setCancelReason("");
    };

    return (
        <div>
            <AdminHeader
                title="All Bookings"
                searchPlaceholder="Search bookings..."
                searchValue={search}
                onSearchChange={setSearch}
            />

            <div className="p-6">
                {/* ── Stats strip ── */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="admin-stat-card">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "var(--a-accent-subtle)",
                                    border: "1px solid var(--a-accent-border)",
                                }}
                            >
                                <CalendarDays
                                    className="size-4"
                                    style={{ color: "var(--a-accent)" }}
                                    strokeWidth={1.6}
                                />
                            </div>
                            <div>
                                <p className="tabular-nums text-xl font-bold" style={{ color: "var(--a-text)" }}>
                                    {todayCount}
                                </p>
                                <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                                    Today's bookings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "var(--a-info-subtle)",
                                    border: "1px solid rgba(83,155,245,0.2)",
                                }}
                            >
                                <TrendingUp className="size-4" style={{ color: "var(--a-info)" }} strokeWidth={1.6} />
                            </div>
                            <div>
                                <p className="tabular-nums text-xl font-bold" style={{ color: "var(--a-text)" }}>
                                    {weekCount}
                                </p>
                                <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                                    This week
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "var(--a-success-subtle)",
                                    border: "1px solid rgba(52,211,153,0.2)",
                                }}
                            >
                                <Building2 className="size-4" style={{ color: "var(--a-success)" }} strokeWidth={1.6} />
                            </div>
                            <div>
                                <p className="truncate text-sm font-bold" style={{ color: "var(--a-text)" }}>
                                    {popularRoom?.[0] ?? "—"}
                                </p>
                                <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                                    Most popular room
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div
                    className="mb-4 flex items-center gap-3 rounded-lg px-4 py-2.5"
                    style={{
                        background: "var(--a-surface-0)",
                        border: "1px solid var(--a-border)",
                    }}
                >
                    <Filter className="size-3.5" style={{ color: "var(--a-text-muted)" }} strokeWidth={1.6} />
                    <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select className="admin-select" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
                        <option value="all">All rooms</option>
                        {rooms.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    {(statusFilter !== "all" || roomFilter !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter("all");
                                setRoomFilter("all");
                            }}
                            className="ml-auto text-[0.75rem] font-medium transition-colors"
                            style={{ color: "var(--a-accent)" }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* ── Table ── */}
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={CalendarDays}
                        title="No bookings found"
                        description="No bookings match your current filters."
                    />
                ) : (
                    <div
                        className="overflow-hidden rounded-xl border"
                        style={{
                            borderColor: "var(--a-border-hover)",
                            background: "var(--a-surface-0)",
                        }}
                    >
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "12%" }}>Date</th>
                                    <th style={{ width: "10%" }}>Time</th>
                                    <th style={{ width: "20%" }}>Title</th>
                                    <th style={{ width: "14%" }}>Room</th>
                                    <th style={{ width: "14%" }}>Booked By</th>
                                    <th style={{ width: "8%" }}>Attendees</th>
                                    <th style={{ width: "10%" }}>Status</th>
                                    <th style={{ width: "12%" }} />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((booking) => {
                                    const st = STATUS_STYLES[booking.status];
                                    const isCancelling = cancellingId === booking.id;

                                    return (
                                        <tr key={booking.id}>
                                            <td className="tabular-nums" style={{ color: "var(--a-text-secondary)" }}>
                                                {booking.date}
                                            </td>
                                            <td className="tabular-nums" style={{ color: "var(--a-text-secondary)" }}>
                                                {booking.time}
                                            </td>
                                            <td>
                                                <span className="font-medium" style={{ color: "var(--a-text)" }}>
                                                    {booking.title}
                                                </span>
                                            </td>
                                            <td style={{ color: "var(--a-text-secondary)" }}>{booking.room}</td>
                                            <td style={{ color: "var(--a-text-secondary)" }}>{booking.bookedBy}</td>
                                            <td className="tabular-nums" style={{ color: "var(--a-text-muted)" }}>
                                                {booking.attendees}
                                            </td>
                                            <td>
                                                <span
                                                    className="admin-badge"
                                                    style={{
                                                        background: st.bg,
                                                        color: st.color,
                                                    }}
                                                >
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td>
                                                {isCancelling ? (
                                                    <div className="admin-confirm space-y-2">
                                                        <input
                                                            className="admin-input w-full"
                                                            placeholder="Cancellation reason..."
                                                            value={cancelReason}
                                                            onChange={(e) => setCancelReason(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleCancel(booking.id);
                                                                if (e.key === "Escape") {
                                                                    setCancellingId(null);
                                                                    setCancelReason("");
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancel(booking.id)}
                                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-medium transition-colors"
                                                                style={{
                                                                    background: "var(--a-danger-subtle)",
                                                                    color: "var(--a-danger)",
                                                                }}
                                                            >
                                                                <Check className="size-3" />
                                                                Cancel booking
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCancellingId(null);
                                                                    setCancelReason("");
                                                                }}
                                                                className="rounded-md px-2 py-1 text-[0.6875rem] font-medium"
                                                                style={{
                                                                    color: "var(--a-text-muted)",
                                                                }}
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="View details"
                                                            className="flex size-7 items-center justify-center rounded-md transition-colors"
                                                            style={{ color: "var(--a-text-muted)" }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = "var(--a-surface-2)";
                                                                e.currentTarget.style.color = "var(--a-text-secondary)";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = "transparent";
                                                                e.currentTarget.style.color = "var(--a-text-muted)";
                                                            }}
                                                        >
                                                            <Eye className="size-3.5" strokeWidth={1.6} />
                                                        </button>
                                                        {booking.status !== "cancelled" &&
                                                            booking.status !== "completed" && (
                                                                <button
                                                                    type="button"
                                                                    title="Cancel booking"
                                                                    onClick={() => setCancellingId(booking.id)}
                                                                    className="flex size-7 items-center justify-center rounded-md transition-colors"
                                                                    style={{ color: "var(--a-text-muted)" }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background =
                                                                            "var(--a-danger-subtle)";
                                                                        e.currentTarget.style.color = "var(--a-danger)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background =
                                                                            "transparent";
                                                                        e.currentTarget.style.color =
                                                                            "var(--a-text-muted)";
                                                                    }}
                                                                >
                                                                    <Ban className="size-3.5" strokeWidth={1.6} />
                                                                </button>
                                                            )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
