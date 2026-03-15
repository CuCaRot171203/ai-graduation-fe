import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type UserStats = {
  totalExamsTaken: number
  totalExamsCreated: number
  totalQuestionsCreated: number
}

export type AdminUser = {
  id: number
  email: string
  fullName: string
  role: string
  className: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  stats: UserStats
}

export type AdminUsersPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type AdminUsersResponse = {
  status: string
  data: {
    users: AdminUser[]
    pagination: AdminUsersPagination
  }
}

export type AdminUsersParams = {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

function buildQueryString(params: AdminUsersParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.search != null && params.search.trim()) search.set('search', params.search.trim())
  if (params.role != null && params.role !== '') search.set('role', params.role)
  if (params.isActive !== undefined && params.isActive !== null)
    search.set('isActive', String(params.isActive))
  if (params.sortBy != null && params.sortBy !== '') search.set('sortBy', params.sortBy)
  if (params.sortOrder != null) search.set('sortOrder', params.sortOrder)
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function getAdminUsers(params: AdminUsersParams = {}): Promise<AdminUsersResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = `${base}/api/admin/users${buildQueryString(params)}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách người dùng thất bại')
  return json as AdminUsersResponse
}

export type CreateAdminUserBody = {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'teacher' | 'student'
  className?: string | null
  isActive: boolean
}

export type CreateAdminUserResponse = {
  status: string
  message?: string
  data?: unknown
}

export async function createAdminUser(
  body: CreateAdminUserBody
): Promise<CreateAdminUserResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Thêm người dùng thất bại')
  return json as CreateAdminUserResponse
}

export type AdminUserDetail = AdminUser & {
  recentExamResults?: unknown[]
  recentCreatedExams?: unknown[]
}

export type GetAdminUserResponse = {
  status: string
  data: AdminUserDetail
}

export async function getAdminUser(id: number): Promise<GetAdminUserResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/users/${id}`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy thông tin người dùng thất bại')
  return json as GetAdminUserResponse
}

export type UpdateAdminUserBody = {
  email: string
  password?: string
  fullName: string
  role: 'admin' | 'teacher' | 'student'
  className?: string | null
  isActive: boolean
}

export async function updateAdminUser(
  id: number,
  body: UpdateAdminUserBody
): Promise<CreateAdminUserResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật người dùng thất bại')
  return json as CreateAdminUserResponse
}

export async function deleteAdminUser(id: number): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/users/${id}`, { method: 'DELETE', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Xóa người dùng thất bại')
  return json
}

export async function patchAdminUserStatus(
  id: number,
  isActive: boolean
): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ isActive }),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật trạng thái thất bại')
  return json
}

// --- GET /api/admin/exams ---
export type AdminExam = {
  id: number
  code?: string
  title?: string
  name?: string
  description?: string | null
  status?: string
  subjectId?: number
  subject?: { id: number; name?: string; code?: string }
  totalQuestions?: number
  questionCount?: number
  durationMinutes?: number
  createdBy?: { id: number; fullName?: string; email?: string }
  creator?: { id: number; fullName?: string }
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export type AdminExamsPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export type AdminExamsResponse = {
  status: string
  data: {
    exams: AdminExam[]
    pagination: AdminExamsPagination
  }
}

export type AdminExamsParams = {
  page?: number
  limit?: number
  status?: string
  subjectId?: number
  search?: string
}

function buildExamsQueryString(params: AdminExamsParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.status != null && params.status !== '') search.set('status', params.status)
  if (params.subjectId != null && !Number.isNaN(params.subjectId)) search.set('subjectId', String(params.subjectId))
  if (params.search != null && params.search.trim()) search.set('search', params.search.trim())
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function getAdminExams(params: AdminExamsParams = {}): Promise<AdminExamsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = `${base}/api/admin/exams${buildExamsQueryString(params)}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách đề thi thất bại')
  return json as AdminExamsResponse
}

/** GET /api/admin/exams/pending - danh sách đề chờ duyệt */
export async function getAdminExamsPending(params: {
  page?: number
  limit?: number
  subjectId?: number
} = {}): Promise<AdminExamsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.subjectId != null && !Number.isNaN(params.subjectId)) search.set('subjectId', String(params.subjectId))
  const q = search.toString()
  const url = `${base}/api/admin/exams/pending${q ? `?${q}` : ''}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách đề chờ duyệt thất bại')
  return json as AdminExamsResponse
}

/** Câu hỏi trong response review */
export type AdminReviewQuestion = {
  id: number
  orderNumber: number
  contentHtml: string
  options: Record<string, string>
  questionType: string
  topic: string
  bloomLevel: string
  correctAnswer: string
  explanationHtml?: string | null
  hasImage: boolean
  imageUrl?: string | null
  imageDescription?: string | null
  isAiGenerated: boolean
}

/** GET /api/admin/exams/:id/review - chi tiết đề để duyệt */
export type AdminExamReviewResponse = {
  status: string
  data: {
    exam: AdminExam & { questions?: AdminReviewQuestion[] }
    stats: {
      totalQuestions: number
      byBloomLevel: Record<string, number>
      byQuestionType: Record<string, number>
      byTopic: Record<string, number>
      aiGenerated: number
    }
  }
}

export async function getAdminExamReview(id: number): Promise<AdminExamReviewResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/exams/${id}/review`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết đề thi thất bại')
  return json as AdminExamReviewResponse
}

/** PATCH /api/admin/exams/:id/approve - duyệt đề thi */
export async function approveAdminExam(id: number): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/exams/${id}/approve`, { method: 'PATCH', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Duyệt đề thi thất bại')
  return json
}

/** PATCH /api/admin/exams/:id/reject - từ chối đề thi (body: { reason }), lý do tối thiểu 3 ký tự */
export async function rejectAdminExam(
  id: number,
  body: { reason: string }
): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/admin/exams/${id}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Từ chối đề thi thất bại')
  return json
}
