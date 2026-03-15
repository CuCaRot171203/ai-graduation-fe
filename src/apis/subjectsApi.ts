import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type SubjectStats = {
  totalTeachers: number
  totalStudents: number
}

export type Subject = {
  id: number
  code: string
  name: string
  description: string
  topics: unknown
  isActive: boolean
  createdAt: string
  updatedAt: string
  stats: SubjectStats
}

export type SubjectsPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type SubjectsResponse = {
  status: string
  data: {
    subjects: Subject[]
    pagination: SubjectsPagination
  }
}

export type SubjectsParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

function buildQueryString(params: SubjectsParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.search != null && params.search.trim()) search.set('search', params.search.trim())
  if (params.isActive !== undefined && params.isActive !== null)
    search.set('isActive', String(params.isActive))
  if (params.sortBy != null && params.sortBy !== '') search.set('sortBy', params.sortBy)
  if (params.sortOrder != null && params.sortOrder !== '') search.set('sortOrder', params.sortOrder)
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function getSubjects(params: SubjectsParams = {}): Promise<SubjectsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = `${base}/api/subjects${buildQueryString(params)}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách môn học thất bại')
  return json as SubjectsResponse
}

// --- GET /api/subjects/:id ---
export type SubjectDetail = Subject & {
  teachers: unknown[]
  recentStudents: unknown[]
}

export type SubjectDetailResponse = {
  status: string
  data: SubjectDetail
}

export async function getSubjectById(id: number): Promise<SubjectDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/subjects/${id}`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết môn học thất bại')
  return json as SubjectDetailResponse
}

// --- POST /api/subjects ---
export type CreateSubjectBody = {
  code: string
  name: string
  description?: string
}

export async function createSubject(body: CreateSubjectBody): Promise<SubjectsResponse & { data: { subject?: Subject } }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/subjects`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Thêm môn học thất bại')
  return json
}

// --- PUT /api/subjects/:id ---
export type UpdateSubjectBody = {
  code: string
  name: string
  description?: string
  isActive: boolean
}

export async function updateSubject(id: number, body: UpdateSubjectBody): Promise<SubjectDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/subjects/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật môn học thất bại')
  return json as SubjectDetailResponse
}

// --- PATCH /api/subjects/:id/status ---
export async function patchSubjectStatus(id: number, isActive: boolean): Promise<{ status: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/subjects/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ isActive }),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Đổi trạng thái môn học thất bại')
  return json
}
