// Tiny localStorage-backed cache for the sidebar menu list (GET/POST /menu/list). The menu is
// global/static (not user-specific - see menuServiceImpl, no auth or user param involved), so
// there's no per-user invalidation to worry about: just an expiry.
//
// This lives in localStorage rather than a plain module-level variable because a plain in-memory
// cache would be wiped on every full page reload (e.g. a hard refresh, or a bookmark/typed URL),
// which is exactly the case a 1-hour TTL is meant to survive.
const MENU_CACHE_KEY = 'menu_cache_v1';
const MENU_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface MenuCacheEntry<T> {
    data: T;
    cachedAt: number;
}

export function readMenuCache<T>(): T | null {
    try {
        const raw = localStorage.getItem(MENU_CACHE_KEY);
        if (!raw) return null;
        const entry: MenuCacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.cachedAt > MENU_CACHE_TTL_MS) return null;
        return entry.data;
    } catch {
        return null;
    }
}

export function writeMenuCache<T>(data: T): void {
    try {
        const entry: MenuCacheEntry<T> = { data, cachedAt: Date.now() };
        localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(entry));
    } catch {
        // localStorage full/unavailable (e.g. private browsing) - just falls back to
        // re-fetching next time, no worse than before this cache existed.
    }
}
