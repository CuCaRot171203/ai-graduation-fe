import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type Exam = {
  id: number
  title?: string
  name?: string
  code?: string
  subjectId?: number
  subject?: { id: number; name?: string; code?: string }
  totalQuestions?: number
  questionCount?: number
  createdBy?: string
  creator?: { id: number; fullName?: string; email?: string }
  status?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export type ExamsPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export type ExamsResponse = {
  status: string
  data: {
    exams: Exam[]
    pagination: ExamsPagination
  }
}

export type ExamsParams = {
  page?: number
  limit?: number
}

/** GET /api/exams?page=1&limit=10 */
export async function getExams(params: ExamsParams = {}): Promise<ExamsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  const q = search.toString()
  const url = `${base}/api/exams${q ? `?${q}` : ''}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách đề thi thất bại')
  return json as ExamsResponse
}

export type CreateExamBody = {
  code: string
  title: string
  description?: string
  subjectId: number
  durationMinutes: number
}

/** POST /api/exams */
export async function createExam(body: CreateExamBody): Promise<{ status: string; data?: { exam?: Exam } }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Tạo đề thi thất bại')
  return json
}

export type ExamDetailResponse = {
  status: string
  data: Exam
}

/** GET /api/exams/:id */
export async function getExamById(id: number): Promise<ExamDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${id}`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết đề thi thất bại')
  return json as ExamDetailResponse
}

export type UpdateExamBody = {
  title: string
  description?: string
  durationMinutes: number
}

/** PUT /api/exams/:id */
export async function updateExam(id: number, body: UpdateExamBody): Promise<ExamDetailResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật đề thi thất bại')
  return json as ExamDetailResponse
}

/** DELETE /api/exams/:id */
export async function deleteExam(id: number): Promise<{ status: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${id}`, { method: 'DELETE', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Xóa đề thi thất bại')
  return json
}

/** POST /api/exams/:id/submit - Gửi đề thi chờ duyệt */
export async function submitExam(id: number): Promise<{ status: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${id}/submit`, { method: 'POST', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Gửi duyệt đề thi thất bại')
  return json
}

// --- Excel templates ---
export type ExcelTemplate = {
  id: string
  name: string
  description: string
  columnCount: number
  requiredColumns: string[]
}

export type ExcelTemplatesResponse = {
  status: string
  data: ExcelTemplate[]
}

/** GET /api/exams/excel-templates */
export async function getExcelTemplates(): Promise<ExcelTemplatesResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/excel-templates`, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách template thất bại')
  return json as ExcelTemplatesResponse
}

/** GET /api/exams/excel-templates/:templateId/download - tải file Excel về */
export async function downloadExcelTemplate(templateId: string): Promise<void> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/excel-templates/${templateId}/download`, {
    method: 'GET',
    headers,
  })
  checkUnauthorized(res)
  if (!res.ok) throw new Error('Tải template thất bại')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `template_${templateId}.xlsx` || 'template.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Câu hỏi trong đề ---

export type AddQuestionToExamBody = {
  content_html: string
  options?: Record<string, string> | null
  question_type: string
  topic: string
  bloom_level: string
  correct_answer: string
  explanation_html?: string
  rounding_rule?: string
}

export type ExamQuestion = {
  id?: number
  contentHtml?: string
  content_html?: string
  options?: Record<string, string>
  topic?: string
  bloomLevel?: string
  bloom_level?: string
  correctAnswer?: string
  correct_answer?: string
  explanationHtml?: string
  explanation_html?: string
  questionType?: string
  question_type?: string
  rounding_rule?: string
  order_number?: number
  approved?: boolean
  [key: string]: unknown
}

/** Response từ POST .../questions/ocr - trích xuất câu hỏi, chưa lưu */
export type OcrExtractResponse = {
  status: string
  message?: string
  data: {
    sessionId: number
    questions: ExamQuestion[]
    metadata?: { total_questions?: number; exam_title?: string | null; has_images?: boolean; subject?: string }
  }
}

export type ExamQuestionsResponse = {
  status: string
  data: {
    questions: ExamQuestion[]
    pagination?: { page: number; limit: number; total: number; totalPages?: number }
  }
}

/** GET /api/exams/:examId/questions - danh sách câu hỏi của đề */
export async function getExamQuestions(
  examId: number,
  params: { page?: number; limit?: number } = {}
): Promise<ExamQuestionsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  const q = search.toString()
  const url = `${base}/api/exams/${examId}/questions${q ? `?${q}` : ''}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy câu hỏi đề thi thất bại')
  return json as ExamQuestionsResponse
}

/** POST /api/exams/:examId/questions - thêm câu hỏi thủ công vào đề */
export async function addQuestionToExam(
  examId: number,
  body: AddQuestionToExamBody
): Promise<{ status: string; data?: { question?: ExamQuestion } }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/questions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Thêm câu hỏi thất bại')
  return json
}

/** Response từ POST .../questions/import - Excel không trả về danh sách câu hỏi */
export type ExcelImportResponse = {
  status: string
  message?: string
  data: {
    imported: number
    errors: string[] | unknown[]
    templateUsed?: string
  }
}

/** POST /api/exams/:examId/questions/import - import câu hỏi từ Excel (multipart: file, templateId) */
export async function importExamQuestionsFromExcel(
  examId: number,
  file: File,
  templateId: string
): Promise<ExcelImportResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const form = new FormData()
  form.append('file', file)
  form.append('templateId', templateId)
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/questions/import`, {
    method: 'POST',
    headers,
    body: form,
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Import Excel thất bại')
  return json as ExcelImportResponse
}

/** POST /api/exams/:examId/questions/ocr - trích xuất câu hỏi từ ảnh (trả về sessionId + questions, chưa lưu) */
export async function importExamQuestionsFromOcr(
  examId: number,
  files: File[]
): Promise<OcrExtractResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/questions/ocr`, {
    method: 'POST',
    headers,
    body: form,
  })
  let json: { status?: string; message?: string; data?: unknown } = {}
  try {
    json = await res.json()
  } catch {
    /* Render/HTML error body */
  }
  checkUnauthorized(res)
  if (!res.ok) {
    throw new Error(
      json?.message ??
        (res.status === 500 ? 'Lỗi máy chủ khi OCR (PDF, Word, ảnh)' : 'Trích xuất câu hỏi (OCR) thất bại')
    )
  }
  return json as OcrExtractResponse
}

/** Body cho PATCH review từng câu OCR */
export type OcrReviewQuestionItem = {
  index: number
  approved: boolean
  correct_answer: string
  bloom_level: string
  topic: string
}

/** PATCH /api/exams/:examId/ocr-sessions/:sessionId/review - duyệt từng câu */
export async function reviewOcrSession(
  examId: number,
  sessionId: number,
  body: { questions: OcrReviewQuestionItem[] }
): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/ocr-sessions/${sessionId}/review`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật duyệt thất bại')
  return json
}

/** POST /api/exams/:examId/ocr-sessions/:sessionId/approve-all - duyệt tất cả câu hỏi OCR */
export async function approveAllOcrSession(
  examId: number,
  sessionId: number
): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/ocr-sessions/${sessionId}/approve-all`, {
    method: 'POST',
    headers,
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Duyệt tất cả thất bại')
  return json
}

/** POST /api/exams/:examId/ocr-sessions/:sessionId/save - lưu câu hỏi đã duyệt vào đề */
export async function saveOcrSession(
  examId: number,
  sessionId: number
): Promise<{ status: string; message?: string }> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/exams/${examId}/ocr-sessions/${sessionId}/save`, {
    method: 'POST',
    headers,
  })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lưu câu hỏi vào đề thất bại')
  return json
}
