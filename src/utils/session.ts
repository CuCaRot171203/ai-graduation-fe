/**
 * Keys used for auth session in localStorage (must match loginPage).
 */
const STORAGE_KEYS = ['accessToken', 'refreshToken', 'user'] as const

/**
 * Clears session data and redirects to login.
 * Call this when API returns 401 (session expired / unauthorized).
 */
export function clearSessionAndRedirectToLogin(): void {
  try {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore
  }
  window.location.replace('/login')
}
