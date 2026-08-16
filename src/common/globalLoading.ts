// Minimal pub/sub for "is at least one API call in flight right now" - deliberately not a full
// state library since nothing else in this app uses one. The axios interceptors registered in
// common.tsx are the only writers (beginRequest/endRequest); TopProgressBar.tsx is the only
// reader (subscribeGlobalLoading). This is what drives route-transition feedback: navigating to
// a page that fetches on mount (board list, board detail's comments, etc.) trips this the moment
// that fetch starts, without each page needing to wire up its own top-level indicator.
type Listener = (active: boolean) => void;

let activeRequests = 0;
const listeners = new Set<Listener>();

function notify() {
    const active = activeRequests > 0;
    listeners.forEach((listener) => listener(active));
}

export function beginRequest() {
    activeRequests += 1;
    notify();
}

export function endRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    notify();
}

export function subscribeGlobalLoading(listener: Listener): () => void {
    listeners.add(listener);
    listener(activeRequests > 0);
    return () => listeners.delete(listener);
}
