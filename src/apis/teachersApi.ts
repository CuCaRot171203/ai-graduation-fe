import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'
import type { Subject } from './subjectsApi'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type TeacherSubjectsResponse = {
  status: string
  data: { subjects: Subject[] }
}

/** GET /api/teachers/:teacherId/subjects - Danh sách môn giáo viên đang dạy */
export async function getTeacherSubjects(teacherId: number): Promise<TeacherSubjectsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/teachers/${teacherId}/subjects`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách môn đang dạy thất bại')
  return json as TeacherSubjectsResponse
}

/** POST /api/teachers/:teacherId/subjects - Đăng ký môn dạy */
export async function registerTeacherSubject(
  teacherId: number,
  subjectId: number
): Promise<{ status: string; data?: unknown }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/teachers/${teacherId}/subjects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subjectId }),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Đăng ký môn học thất bại')
  return json
}

/** DELETE /api/teachers/:teacherId/subjects/:subjectId - Hủy đăng ký môn dạy */
export async function deleteTeacherSubject(
  teacherId: number,
  subjectId: number
): Promise<{ status: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/teachers/${teacherId}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers,
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Hủy đăng ký môn học thất bại')
  return json
}
