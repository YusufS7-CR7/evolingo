/**
 * Returns the correct src URL for an avatar.
 * - If avatarUrl starts with 'http' (Cloudinary), use it directly.
 * - Otherwise, prepend the API base URL (legacy local uploads).
 */
export function getAvatarUrl(avatarUrl: string | undefined | null): string | null {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    return `${base}${avatarUrl}`;
}
