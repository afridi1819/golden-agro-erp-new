/**
 * Returns true if the URL is safe to use as img src (not a local file path).
 * Browsers block file:// and local paths for security.
 */
export function isSafeImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return !trimmed.startsWith('file://') && !/^[a-zA-Z]:[\\/]/.test(trimmed);
}
