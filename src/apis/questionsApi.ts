import { getApiBaseUrl } from './config'
import { clearSessionAndRedirectToLogin } from '../utils/session'

const ACCESS_TOKEN_KEY = 'accessToken'

function checkUnauthorized(res: Response): void {
  if (res.status === 401) {
    clearSessionAndRedirectToLogin()
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
}

export type QuestionOptions = {
  A?: string
  B?: string
  C?: string
  D?: string
  [key: string]: string | undefined
}

export type Question = {
  id: number
  contentHtml: string
  options: QuestionOptions
  topic: string
  bloomLevel: string
  correctAnswer: string
  explanationHtml?: string
  isAiGenerated?: boolean
  createdAt?: string
}

export type QuestionsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type QuestionsResponse = {
  status: string
  data: {
    questions: Question[]
    pagination: QuestionsPagination
  }
}

export type QuestionsParams = {
  page?: number
  limit?: number
}

/** GET /api/questions?page=1&limit=20 */
export async function getQuestions(params: QuestionsParams = {}): Promise<QuestionsResponse> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  const q = search.toString()
  const url = `${base}/api/questions${q ? `?${q}` : ''}`
  const res = await fetch(url, { method: 'GET', headers })
  const json = await res.json()
  checkUnauthorized(res)
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách câu hỏi thất bại')
  return json as QuestionsResponse
}
