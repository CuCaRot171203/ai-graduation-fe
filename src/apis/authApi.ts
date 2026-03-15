import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type UserRole = 'admin' | 'teacher' | 'student'

export type LoginUser = {
  id: number
  email: string
  fullName: string
  role: UserRole
  className: string | null
  createdAt: string
}

export type LoginResponseData = {
  user: LoginUser
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export type LoginResponse = {
  status: string
  message: string
  data: LoginResponseData
}

export type LoginBody = {
  email: string
  password: string
}

export function getDashboardPathByRole(role: string): string {
  const r = role?.toLowerCase()
  switch (r) {
    case 'admin':
      return '/admin/dashboard'
    case 'teacher':
      return '/lecture/dashboard'
    case 'student':
      return '/user/dashboard'
    default:
      return '/'
  }
}

export async function login(body: LoginBody): Promise<LoginResponse> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not set')
  }
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.message ?? 'Đăng nhập thất bại')
  }
  return json as LoginResponse
}

// --- POST /api/auth/logout ---
export async function logout(): Promise<void> {
  const base = getApiBaseUrl()
  if (!base) return
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    await fetch(`${base}/api/auth/logout`, { method: 'POST', headers })
  } catch {
    // ignore network errors
  }
}

// --- /api/auth/me (GET / PUT) và /api/auth/change-password (PUT) ---

export type AuthMeStats = {
  totalExamsTaken: number
  totalExamsCreated: number
}

export type AuthMeData = {
  id: number
  email: string
  fullName: string
  role: string
  className: string | null
  createdAt: string
  stats: AuthMeStats
}

export type AuthMeResponse = {
  status: string
  data: AuthMeData
}

export type UpdateMeBody = {
  fullName?: string
  className?: string
}

export type ChangePasswordBody = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function getMe(): Promise<AuthMeResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const res = await fetch(`${base}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy thông tin thất bại')
  return json as AuthMeResponse
}

export async function updateMe(body: UpdateMeBody): Promise<AuthMeResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const res = await fetch(`${base}/api/auth/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật thông tin thất bại')
  return json as AuthMeResponse
}

export async function changePassword(body: ChangePasswordBody): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const res = await fetch(`${base}/api/auth/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Đổi mật khẩu thất bại')
  return json
}
