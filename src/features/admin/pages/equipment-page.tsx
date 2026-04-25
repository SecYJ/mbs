import { useState, useRef } from "react";
import { Plus, Wrench, Pencil, Trash2, Check, X, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";

/* ── Mock data ── */

interface Equipment {
    id: string;
    name: string;
    roomCount: number;
}

const initialEquipment: Equipment[] = [
    { id: "1", name: "Projector", roomCount: 3 },
    { id: "2", name: "Video Conference", roomCount: 4 },
    { id: "3", name: "Whiteboard", roomCount: 5 },
    { id: "4", name: "TV Screen", roomCount: 2 },
    { id: "5", name: "Speakerphone", roomCount: 1 },
];

export function EquipmentPage() {
    const { toast } = useAdminToast();
    const [items, setItems] = useState(initialEquipment);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newName.trim()) return;
        const id = String(Date.now());
        setItems((prev) => [...prev, { id, name: newName.trim(), roomCount: 0 }]);
        setNewName("");
        setIsAdding(false);
        toast(`"${newName.trim()}" added`, "success");
    };

    const handleStartEdit = (item: Equipment) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const handleSaveEdit = () => {
        if (!editName.trim() || !editingId) return;
        setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, name: editName.trim() } : i)));
        toast(`Renamed to "${editName.trim()}"`, "success");
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        const item = items.find((i) => i.id === id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeletingId(null);
        toast(`"${item?.name}" removed`, "danger");
    };

    return (
        <div>
            <AdminHeader
                title="Equipment"
                action={
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(true);
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                            background: "var(--a-accent)",
                            color: "#fff",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--a-accent-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--a-accent)")}
                    >
                        <Plus className="size-3.5" strokeWidth={2.2} />
                        Add Equipment
                    </button>
                }
            />

            <div className="p-6">
                {items.length === 0 && !isAdding ? (
                    <EmptyState
                        icon={Wrench}
                        title="No equipment types"
                        description="Add equipment types that can be assigned to meeting rooms."
                        action={
                            <button
                                type="button"
                                onClick={() => setIsAdding(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                                style={{ background: "var(--a-accent)", color: "#fff" }}
                            >
                                <Plus className="size-4" />
                                Add Equipment
                            </button>
                        }
                    />
                ) : (
                    <div
                        className="max-w-xl overflow-hidden rounded-xl border"
                        style={{
                            borderColor: "var(--a-border-hover)",
                            background: "var(--a-surface-0)",
                        }}
                    >
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>Equipment Type</th>
                                    <th style={{ width: "25%" }}>Rooms Using</th>
                                    <th style={{ width: "25%" }} />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {editingId === item.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className="admin-input flex-1"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveEdit();
                                                            if (e.key === "Escape") setEditingId(null);
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveEdit}
                                                        className="flex size-6 items-center justify-center rounded-md"
                                                        style={{
                                                            background: "var(--a-success-subtle)",
                                                            color: "var(--a-success)",
                                                        }}
                                                    >
                                                        <Check className="size-3.5" strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingId(null)}
                                                        className="flex size-6 items-center justify-center rounded-md"
                                                        style={{
                                                            background: "var(--a-surface-2)",
                                                            color: "var(--a-text-muted)",
                                                        }}
                                                    >
                                                        <X className="size-3.5" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="font-medium" style={{ color: "var(--a-text)" }}>
                                                    {item.name}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className="tabular-nums text-xs"
                                                style={{ color: "var(--a-text-secondary)" }}
                                            >
                                                {item.roomCount} {item.roomCount === 1 ? "room" : "rooms"}
                                            </span>
                                        </td>
                                        <td>
                                            {deletingId === item.id ? (
                                                <div className="admin-confirm flex items-center gap-2">
                                                    {item.roomCount > 0 && (
                                                        <span
                                                            className="flex items-center gap-1 text-[0.6875rem]"
                                                            style={{ color: "var(--a-accent)" }}
                                                        >
                                                            <AlertTriangle className="size-3" />
                                                            {item.roomCount} rooms
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="flex size-6 items-center justify-center rounded-md"
                                                        style={{
                                                            background: "var(--a-danger-subtle)",
                                                            color: "var(--a-danger)",
                                                        }}
                                                    >
                                                        <Check className="size-3.5" strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingId(null)}
                                                        className="flex size-6 items-center justify-center rounded-md"
                                                        style={{
                                                            background: "var(--a-surface-2)",
                                                            color: "var(--a-text-muted)",
                                                        }}
                                                    >
                                                        <X className="size-3.5" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="Rename"
                                                        onClick={() => handleStartEdit(item)}
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
                                                        <Pencil className="size-3.5" strokeWidth={1.6} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        onClick={() => setDeletingId(item.id)}
                                                        className="flex size-7 items-center justify-center rounded-md transition-colors"
                                                        style={{ color: "var(--a-text-muted)" }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = "var(--a-danger-subtle)";
                                                            e.currentTarget.style.color = "var(--a-danger)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = "transparent";
                                                            e.currentTarget.style.color = "var(--a-text-muted)";
                                                        }}
                                                    >
                                                        <Trash2 className="size-3.5" strokeWidth={1.6} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* ── Inline add row ── */}
                                {isAdding && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="admin-confirm flex items-center gap-2">
                                                <input
                                                    ref={inputRef}
                                                    className="admin-input flex-1"
                                                    placeholder="Equipment name..."
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAdd();
                                                        if (e.key === "Escape") {
                                                            setIsAdding(false);
                                                            setNewName("");
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAdd}
                                                    disabled={!newName.trim()}
                                                    className="flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-30"
                                                    style={{
                                                        background: "var(--a-success-subtle)",
                                                        color: "var(--a-success)",
                                                    }}
                                                >
                                                    <Check className="size-3.5" strokeWidth={2} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAdding(false);
                                                        setNewName("");
                                                    }}
                                                    className="flex size-7 items-center justify-center rounded-md"
                                                    style={{
                                                        background: "var(--a-surface-2)",
                                                        color: "var(--a-text-muted)",
                                                    }}
                                                >
                                                    <X className="size-3.5" strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
