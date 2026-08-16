// All throwaway/one-off transforms for the text utility bundle (item 4) - nothing here
// persists anything, that's what DB 관리 노트 / 만능 테이블 are for. Every function is pure
// and client-side only.

// btoa/atob only handle Latin1 natively - this round-trips through encodeURIComponent/
// decodeURIComponent so non-ASCII (Korean, emoji, etc.) text doesn't corrupt.
export function base64Encode(text: string): string {
    return btoa(unescape(encodeURIComponent(text)));
}
export function base64Decode(text: string): string {
    return decodeURIComponent(escape(atob(text)));
}

export function urlEncode(text: string): string {
    return encodeURIComponent(text);
}
export function urlDecode(text: string): string {
    return decodeURIComponent(text);
}

// JWT decode - display only, no signature verification (this is a client-side convenience
// tool, not an auth mechanism - matches what's been done manually in-chat for JWT inspection).
export interface JwtDecoded {
    header: string;
    payload: string;
}
function base64UrlDecode(segment: string): string {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return decodeURIComponent(escape(atob(padded)));
}
export function decodeJwt(token: string): JwtDecoded {
    const parts = token.trim().split('.');
    if (parts.length < 2) throw new Error('유효한 JWT 형식이 아닙니다 (header.payload[.signature])');
    return {
        header: JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2),
        payload: JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2),
    };
}

// Case conversion
export function toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
export function toCamelCase(text: string): string {
    return text
        .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toLowerCase());
}
export function toSnakeCase(text: string): string {
    return text
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .toLowerCase();
}

// Line utilities
export function sortLines(text: string): string {
    return text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
}
export function dedupeLines(text: string): string {
    return Array.from(new Set(text.split('\n'))).join('\n');
}
export function trimLines(text: string): string {
    return text.split('\n').map((l) => l.trim()).join('\n');
}
