import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

// Imported for its side effect: the server process validates env on startup, not on the first request.
// oxlint-disable-next-line import/no-unassigned-import
import "@/env";

export default createServerEntry({
    fetch(request) {
        return handler.fetch(request);
    },
});
