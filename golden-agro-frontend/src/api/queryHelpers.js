/**
 * Safe query helper: never returns undefined so React Query doesn't throw.
 * On API error (e.g. 403) returns fallback instead of throwing.
 */
export function safeQueryData(apiCall, fallback = []) {
  return apiCall()
    .then((res) => res?.data?.data ?? fallback)
    .catch(() => fallback);
}
