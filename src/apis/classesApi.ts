import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type ClassTeacher = {
  id: number
  fullName: string
  email: string
}

export type ClassSubject = {
  id: number
  code: string
  name: string
}

export type ClassItem = {
  id: number
  name: string
  code: string
  description: string | null
  schoolYear: string
  teacherId: number
  subjectId: number
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  teacher: ClassTeacher
  subject: ClassSubject
  studentCount: number
}

export type ClassesPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export type ClassesResponse = {
  status: string
  data: {
    classes: ClassItem[]
    pagination: ClassesPagination
  }
}

export type ClassesParams = {
  page?: number
  limit?: number
  search?: string
  teacherId?: number
  subjectId?: number
  schoolYear?: string
  isActive?: boolean
}

function buildQueryString(params: ClassesParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.search != null && params.search.trim()) search.set('search', params.search.trim())
  if (params.teacherId != null && !Number.isNaN(params.teacherId)) search.set('teacherId', String(params.teacherId))
  if (params.subjectId != null && !Number.isNaN(params.subjectId)) search.set('subjectId', String(params.subjectId))
  if (params.schoolYear != null && params.schoolYear.trim()) search.set('schoolYear', params.schoolYear.trim())
  if (params.isActive !== undefined && params.isActive !== null) search.set('isActive', String(params.isActive))
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function getClasses(params: ClassesParams = {}): Promise<ClassesResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = `${base}/api/classes${buildQueryString(params)}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách lớp học thất bại')
  return json as ClassesResponse
}

// --- GET /api/classes/:id ---
export type ClassDetailItem = ClassItem & {
  students: unknown[]
}

export type ClassDetailResponse = {
  status: string
  data: ClassDetailItem
}

export async function getClassById(id: number): Promise<ClassDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/classes/${id}`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết lớp học thất bại')
  return json as ClassDetailResponse
}

// --- POST /api/classes ---
export type CreateClassBody = {
  name: string
  code: string
  description?: string
  schoolYear: string
  teacherId: number
  subjectId: number
}

export async function createClass(body: CreateClassBody): Promise<ClassDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/classes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Tạo lớp học thất bại')
  return json as ClassDetailResponse
}

// --- PUT /api/classes/:id ---
export type UpdateClassBody = {
  name: string
  description?: string
  schoolYear: string
  teacherId: number
  subjectId: number
}

export async function updateClass(id: number, body: UpdateClassBody): Promise<ClassDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/classes/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật lớp học thất bại')
  return json as ClassDetailResponse
}

// --- DELETE /api/classes/:id ---
export async function deleteClass(id: number): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/classes/${id}`, { method: 'DELETE', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Xóa lớp học thất bại')
  return json
}
