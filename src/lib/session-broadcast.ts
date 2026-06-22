const CHANNEL_NAME = "mbs-session";

type SessionBroadcastMessage = { type: "sign-out" };

// A single channel instance per tab: a BroadcastChannel never receives messages
// it posted itself, so the tab that signs out can run its own local flow while
// every other tab listening on its own instance reacts to the message.
let channel: BroadcastChannel | undefined;

const getChannel = () => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
        return undefined;
    }

    channel ??= new BroadcastChannel(CHANNEL_NAME);

    return channel;
};

export const broadcastSessionSignOut = () => {
    getChannel()?.postMessage({ type: "sign-out" } satisfies SessionBroadcastMessage);
};

export const subscribeToSessionSignOut = (onSignOut: () => void) => {
    const sessionChannel = getChannel();

    if (!sessionChannel) {
        return () => {};
    }

    const handler = (event: MessageEvent<SessionBroadcastMessage>) => {
        if (event.data?.type === "sign-out") {
            onSignOut();
        }
    };

    sessionChannel.addEventListener("message", handler);

    return () => sessionChannel.removeEventListener("message", handler);
};
