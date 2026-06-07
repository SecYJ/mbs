/**
 * The reservation editor is always in exactly one of these views. Keeping the
 * states and the rules that select between them in one place means the
 * "which combinations are valid?" invariant lives here rather than being
 * re-derived from scattered booleans at each call site.
 */
type EditorView = "closed" | "create" | "details" | "edit" | "missing";

type EditorViewInput = {
    /** The dialog has a reservation context (an open create or view request). */
    isOpen: boolean;
    /** The context targets an existing reservation rather than a new booking. */
    isExistingReservation: boolean;
    /** The targeted reservation was resolved from the current calendar data. */
    hasEvent: boolean;
    /** The user has switched an existing reservation into the edit form. */
    isEditing: boolean;
};

/**
 * Resolves the active editor view. The guards are ordered from most to least
 * specific so each line reads as a single rule:
 *
 *   no context            -> closed
 *   new booking           -> create
 *   existing, not found   -> missing
 *   existing, editing      -> edit
 *   existing, viewing      -> details
 */
export const resolveEditorView = ({
    isOpen,
    isExistingReservation,
    hasEvent,
    isEditing,
}: EditorViewInput): EditorView => {
    if (!isOpen) return "closed";
    if (!isExistingReservation) return "create";
    if (!hasEvent) return "missing";
    return isEditing ? "edit" : "details";
};
