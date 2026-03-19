import type { Subject } from './subjectsApi'

const AI_EXAM_BASE_URL = 'https://ai-exam-backend-d3nv.onrender.com'
const ACCESS_TOKEN_KEY = 'accessToken'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// --- /api/auth/me + /api/auth/change-password (AI backend) ---
export type AiAuthMeStats = { totalExamsTaken: number; totalExamsCreated: number }

export type AiAuthMeData = {
  id: number
  email: string
  fullName: string
  role: string
  className: string | null
  createdAt: string
  stats: AiAuthMeStats
}

export type AiAuthMeResponse = { status: string; data: AiAuthMeData }

export type AiUpdateMeBody = { fullName?: string; className?: string }

export async function getAiMe(): Promise<AiAuthMeResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/auth/me`, { method: 'GET', headers: getAuthHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy thông tin profile thất bại')
  return json as AiAuthMeResponse
}

export async function updateAiMe(body: AiUpdateMeBody): Promise<AiAuthMeResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/auth/me`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body) })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật thông tin thất bại')
  return json as AiAuthMeResponse
}

export type AiChangePasswordBody = { currentPassword: string; newPassword: string; confirmPassword: string }

export async function changeAiPassword(body: AiChangePasswordBody): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Đổi mật khẩu thất bại')
  return json as { status: string; message?: string }
}

export type TeacherSubjectsResponse = {
  status: string
  data: {
    subjects: Subject[]
    pagination?: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
      hasNextPage?: boolean
      hasPrevPage?: boolean
    }
  }
}

export async function getTeacherSubjectsFromAiBackend(teacherId: number): Promise<TeacherSubjectsResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/teachers/${teacherId}/subjects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách môn học thất bại')
  return json as TeacherSubjectsResponse
}

export type GenerateExamBody = {
  request: string
  subjectId: number
}

export type GenerateExamResponse = {
  status: string
  data: unknown
}

export async function generateExamWithAi(body: GenerateExamBody): Promise<GenerateExamResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/generate-exam`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Tạo đề với AI thất bại')
  return json as GenerateExamResponse
}

// --- GET /api/questions (question bank) ---
export type QuestionBankItem = {
  id: number
  contentHtml?: string | null
  content_html?: string | null
  options?: Record<string, string> | null
  correctAnswer?: string | null
  correct_answer?: string | null
  explanationHtml?: string | null
  explanation_html?: string | null
  topic?: string | null
  subjectId?: number | null
  subject_id?: number | null
  bloomLevel?: string | null
  bloom_level?: string | null
  isAiGenerated?: boolean | null
  is_ai_generated?: boolean | null
  status?: string | null
  hasImage?: boolean | null
  imageUrl?: string | null
  imageDescription?: string | null
  createdAt?: string | null
  createdBy?: { id: number; fullName?: string | null } | null
  subject?: { id: number; name?: string | null; code?: string | null } | null
}

export type QuestionBankPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type GetQuestionsParams = {
  page?: number
  limit?: number
  subjectId?: number
  topic?: string
  bloom_level?: string
  is_ai_generated?: boolean
  search?: string
}

export type GetQuestionsResponse = {
  status: string
  data: {
    questions: QuestionBankItem[]
    pagination: QuestionBankPagination
  }
}

export async function getQuestionBank(params: GetQuestionsParams): Promise<GetQuestionsResponse> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.subjectId != null) sp.set('subjectId', String(params.subjectId))
  if (params.topic) sp.set('topic', params.topic)
  if (params.bloom_level) sp.set('bloom_level', params.bloom_level)
  if (params.is_ai_generated != null) sp.set('is_ai_generated', String(params.is_ai_generated))
  if (params.search) sp.set('search', params.search)

  const res = await fetch(`${AI_EXAM_BASE_URL}/api/questions?${sp.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy ngân hàng câu hỏi thất bại')
  return json as GetQuestionsResponse
}

// --- POST /api/questions (AI backend) ---
export type CreateAiQuestionBody = {
  subjectId: number
  topic: string
  bloomLevel: string
  questionType: string
  contentHtml: string
  options: Record<string, string>
  correctAnswer: string
  explanationHtml?: string | null
  isAiGenerated?: boolean
}

export type CreateAiQuestionResponse = {
  status: string
  message?: string
  data?: { question?: QuestionBankItem }
}

export async function createAiQuestion(body: CreateAiQuestionBody): Promise<CreateAiQuestionResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Thêm câu hỏi vào ngân hàng thất bại')
  return json as CreateAiQuestionResponse
}

// --- POST /api/ai/save-generated-exam ---
export type SaveGeneratedExamBody = {
  exam: {
    title: string
    subject_id: number
    duration_minutes: number
    description: string
  }
  questions: Array<Record<string, unknown>>
}

export type SaveGeneratedExamResponse = {
  status: string
  message?: string
  data?: unknown
}

export async function saveGeneratedExam(body: SaveGeneratedExamBody): Promise<SaveGeneratedExamResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/save-generated-exam`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lưu đề thi thất bại')
  return json as SaveGeneratedExamResponse
}

// --- GET /api/exams/:id (AI backend) ---
export type AiExamQuestion = {
  id: number
  orderNumber?: number
  contentHtml?: string | null
  options?: Record<string, string> | null
  questionType?: string | null
  topic?: string | null
  bloomLevel?: string | null
  correctAnswer?: string | null
  explanationHtml?: string | null
  hasImage?: boolean | null
  imageUrl?: string | null
  imageDescription?: string | null
  status?: string | null
}

export type AiExamDetail = {
  id: number
  code?: string
  title?: string
  description?: string
  subjectId?: number
  totalQuestions?: number
  durationMinutes?: number
  isAiGenerated?: boolean
  status?: string
  questions?: AiExamQuestion[]
  [key: string]: unknown
}

export type GetAiExamResponse = {
  status: string
  data: AiExamDetail
}

export async function getAiExamById(examId: number): Promise<GetAiExamResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/exams/${examId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết đề thi thất bại')
  return json as GetAiExamResponse
}

// --- PATCH /api/questions/:id (AI backend) ---
export type UpdateAiQuestionBody = {
  content_html?: string
  options?: Record<string, string>
  question_type?: string
  topic?: string
  bloom_level?: string
  correct_answer?: string
  explanation_html?: string | null
}

export async function updateAiQuestion(questionId: number, body: UpdateAiQuestionBody): Promise<{ status: string; data?: unknown; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/questions/${questionId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật câu hỏi thất bại')
  return json as { status: string; data?: unknown; message?: string }
}

export async function deleteAiQuestion(questionId: number): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Xóa câu hỏi thất bại')
  return json as { status: string; message?: string }
}

// --- GET /api/classes (AI backend) ---
export type AiClassTeacher = { id: number; fullName: string; email: string }
export type AiClassSubject = { id: number; code: string; name: string }

export type AiClassItem = {
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
  teacher: AiClassTeacher
  subject: AiClassSubject
  studentCount: number
}

export type AiClassesPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export type GetAiClassesParams = {
  page?: number
  limit?: number
  search?: string
  teacherId?: number
  subjectId?: number
  schoolYear?: string
  isActive?: boolean
}

export type GetAiClassesResponse = {
  status: string
  data: { classes: AiClassItem[]; pagination: AiClassesPagination }
}

export async function getAiClasses(params: GetAiClassesParams): Promise<GetAiClassesResponse> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.search) sp.set('search', params.search)
  if (params.teacherId != null) sp.set('teacherId', String(params.teacherId))
  if (params.subjectId != null) sp.set('subjectId', String(params.subjectId))
  if (params.schoolYear) sp.set('schoolYear', params.schoolYear)
  if (params.isActive != null) sp.set('isActive', String(params.isActive))

  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes?${sp.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách lớp học thất bại')
  return json as GetAiClassesResponse
}

// --- GET /api/classes/public (AI backend) ---
export type AiPublicClassItem = {
  id: number
  name: string
  code: string
  description: string | null
  schoolYear: string
  teacher?: { id: number; fullName?: string }
  subject?: { id: number; code?: string; name?: string }
  studentCount?: number
}

export type GetPublicAiClassesParams = {
  page?: number
  limit?: number
}

export type GetPublicAiClassesResponse = {
  status: string
  data: { classes: AiPublicClassItem[]; pagination: AiClassesPagination }
}

export async function getPublicAiClasses(params: GetPublicAiClassesParams = {}): Promise<GetPublicAiClassesResponse> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes/public${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách lớp công khai thất bại')
  return json as GetPublicAiClassesResponse
}

// --- GET /api/exams (AI backend) ---
export type AiExamItem = {
  id: number
  code?: string
  title?: string
  description?: string | null
  subjectId?: number
  totalQuestions?: number
  durationMinutes?: number
  isAiGenerated?: boolean
  status?: string
  createdById?: number
  createdAt?: string
  updatedAt?: string
  subject?: { id: number; code?: string; name?: string }
  createdBy?: { id: number; fullName?: string }
  questionCount?: number
}

export type AiExamsPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export type GetAiExamsParams = {
  page?: number
  limit?: number
}

export type GetAiExamsResponse = {
  status: string
  data: { exams: AiExamItem[]; pagination: AiExamsPagination }
}

export async function getAiExams(params: GetAiExamsParams = {}): Promise<GetAiExamsResponse> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/exams${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách đề thi thất bại')
  return json as GetAiExamsResponse
}

// --- POST /api/assignments (AI backend) ---
type AssignmentBaseBody = {
  classId: number
  title: string
  description?: string
  deadline: string
  durationMinutes: number
}

export type FixedExamAssignmentBody = AssignmentBaseBody & {
  examId: number
  assignmentType: 'fixed_exam'
  examConfig: Record<string, unknown>
}

export type RandomConfigAssignmentBody = AssignmentBaseBody & {
  examId?: number
  assignmentType: 'random_config'
  examConfig: {
    subjectId: number
    totalQuestions: number
    distribution: Record<
      string,
      {
        count: number
        trac_nghiem: number | null
        tu_luan: number
      }
    >
  }
}

export type CreateAiAssignmentBody = FixedExamAssignmentBody | RandomConfigAssignmentBody

export type CreateAiAssignmentResponse = {
  status: string
  message?: string
  data?: { id?: number } | Record<string, unknown>
}

export async function createAiAssignment(body: CreateAiAssignmentBody): Promise<CreateAiAssignmentResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Tạo giao bài thất bại')
  return json as CreateAiAssignmentResponse
}

export type AiAssignmentDetail = {
  id: number
  classId: number
  teacherId: number
  examId?: number | null
  title: string
  description?: string | null
  assignmentType: 'fixed_exam' | 'random_config' | string
  examConfig?: Record<string, unknown> | null
  deadline: string
  durationMinutes: number
  status?: string
  createdAt?: string
  updatedAt?: string
  class?: { id: number; name?: string; code?: string }
  exam?: { id: number; code?: string; title?: string } | null
  myAttempt?: {
    id: number
    status?: 'in_progress' | 'completed' | string
    score?: number | null
    submittedAt?: string | null
  } | null
}

export type GetAiAssignmentByIdResponse = {
  status: string
  data: AiAssignmentDetail
}

export type GetAiAssignmentsParams = {
  classId?: number
  page?: number
  limit?: number
}

export type GetAiAssignmentsResponse = {
  status: string
  data: {
    assignments: AiAssignmentDetail[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export async function getAiAssignments(params: GetAiAssignmentsParams = {}): Promise<GetAiAssignmentsResponse> {
  const sp = new URLSearchParams()
  if (params.classId != null) sp.set('classId', String(params.classId))
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách bài giao thất bại')
  return json as GetAiAssignmentsResponse
}

export async function getAiAssignmentById(id: number): Promise<GetAiAssignmentByIdResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết bài giao thất bại')
  return json as GetAiAssignmentByIdResponse
}

export async function updateAiAssignmentDeadline(
  id: number,
  body: { deadline: string }
): Promise<{ status: string; message?: string; data?: unknown }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật giờ kết thúc thất bại')
  return json as { status: string; message?: string; data?: unknown }
}

export type UpdateAiAssignmentBody = {
  title?: string
  description?: string | null
  deadline?: string | null
  durationMinutes?: number
}

export async function updateAiAssignment(
  id: number,
  body: UpdateAiAssignmentBody
): Promise<{ status: string; message?: string; data?: unknown }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật bài giao thất bại')
  return json as { status: string; message?: string; data?: unknown }
}

export async function deleteAiAssignment(id: number): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Xóa bài giao thất bại')
  return json as { status: string; message?: string }
}

export type AiAssignmentProgressStudent = {
  student: { id: number; fullName?: string; email?: string }
  attempted: boolean
  status?: 'in_progress' | 'completed' | string
  score?: number | null
  timeSpentSeconds?: number | null
  submittedAt?: string | null
}

export type AiAssignmentProgressResponse = {
  status: string
  data: {
    assignment: { id: number; title: string; assignmentType: string }
    stats: {
      totalStudents: number
      completed: number
      inProgress: number
      notStarted: number
      averageScore: number | null
    }
    students: AiAssignmentProgressStudent[]
  }
}

export async function getAiAssignmentProgress(id: number): Promise<AiAssignmentProgressResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}/progress`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy tiến độ bài giao thất bại')
  return json as AiAssignmentProgressResponse
}

// --- Student assignment attempt flow ---
export type AssignmentAttemptQuestion = {
  orderNumber: number
  question: {
    id: number
    contentHtml?: string | null
    options?: Record<string, string> | null
    questionType?: string | null
    topic?: string | null
    bloomLevel?: string | null
    hasImage?: boolean | null
    imageUrl?: string | null
    imageDescription?: string | null
  }
  answer?: {
    questionId?: number
    studentAnswer?: string | null
    isCorrect?: boolean | null
  } | null
}

export type StartAiAssignmentResponse = {
  status: string
  message?: string
  data?: {
    attemptId: number
    startedAt?: string
    durationMinutes?: number
    totalQuestions?: number
    questions?: AssignmentAttemptQuestion[]
  }
}

export async function startAiAssignment(id: number): Promise<StartAiAssignmentResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Bắt đầu làm bài thất bại')
  return json as StartAiAssignmentResponse
}

export type GetAiAssignmentQuestionsResponse = {
  status: string
  data?: {
    attemptId: number
    status?: string
    totalQuestions?: number
    durationMinutes?: number
    questions: AssignmentAttemptQuestion[]
  }
}

export async function getAiAssignmentQuestions(id: number): Promise<GetAiAssignmentQuestionsResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}/questions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy câu hỏi bài giao thất bại')
  return json as GetAiAssignmentQuestionsResponse
}

export type SubmitAiAssignmentBody = {
  answers: Array<{ questionId: number; selectedAnswer: string | null }>
  timeSpentSeconds?: number
}

export type SubmitAiAssignmentResponse = {
  status: string
  message?: string
  data?: {
    attemptId: number
    totalQuestions: number
    correctCount: number
    score: number
    timeSpentSeconds?: number | null
  }
}

export async function submitAiAssignment(id: number, body: SubmitAiAssignmentBody): Promise<SubmitAiAssignmentResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/assignments/${id}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Nộp bài thất bại')
  return json as SubmitAiAssignmentResponse
}

// --- Enrollments (AI backend) ---
export type EnrollmentItem = {
  id: number
  status: 'pending' | 'active' | string
  enrolledAt: string
  class: {
    id: number
    name: string
    code: string
    schoolYear?: string
    isActive?: boolean
    teacher?: { id: number; fullName?: string }
    subject?: { id: number; name?: string }
  }
  student?: { id: number; fullName?: string; email?: string; className?: string | null }
}

export type GetMyEnrollmentsResponse = {
  status: string
  data: {
    enrollments: EnrollmentItem[]
    total: number
  }
}

export async function getMyEnrollments(): Promise<GetMyEnrollmentsResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/enrollments/my`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách đăng ký lớp thất bại')
  return json as GetMyEnrollmentsResponse
}

export async function enrollInClass(body: { classId?: number; className?: string }): Promise<{ status: string; message?: string; data?: EnrollmentItem }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/enrollments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Đăng ký lớp thất bại')
  return json as { status: string; message?: string; data?: EnrollmentItem }
}

export type GetPendingEnrollmentsResponse = {
  status: string
  data: {
    enrollments: EnrollmentItem[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
    }
  }
}

export async function getPendingEnrollments(params: { classId?: number; page?: number; limit?: number } = {}): Promise<GetPendingEnrollmentsResponse> {
  const sp = new URLSearchParams()
  if (params.classId != null) sp.set('classId', String(params.classId))
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/enrollments/pending${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách chờ duyệt thất bại')
  return json as GetPendingEnrollmentsResponse
}

export async function approveEnrollment(id: number): Promise<{ status: string; message?: string; data?: EnrollmentItem }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/enrollments/${id}/approve`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Duyệt học sinh thất bại')
  return json as { status: string; message?: string; data?: EnrollmentItem }
}

// --- GET /api/classes/:id (AI backend) ---
export type GetAiClassByIdResponse = {
  status: string
  data: AiClassItem & { students?: unknown[] }
}

export async function getAiClassById(id: number): Promise<GetAiClassByIdResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes/${id}`, { method: 'GET', headers: getAuthHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết lớp học thất bại')
  return json as GetAiClassByIdResponse
}

// --- GET /api/classes/:id/results (AI backend) ---
export type GetAiClassResultsResponse = {
  status: string
  data: {
    class: { id: number; name: string; code: string; studentCount: number }
    results: unknown[]
    summary: { totalStudents: number; studentsWithResults: number; totalExamsTaken: number }
  }
}

export async function getAiClassResults(
  id: number,
  params: { sortBy?: string; sortOrder?: 'asc' | 'desc' } = { sortBy: 'totalScore', sortOrder: 'desc' }
): Promise<GetAiClassResultsResponse> {
  const sp = new URLSearchParams()
  if (params.sortBy) sp.set('sortBy', params.sortBy)
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder)
  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes/${id}/results${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy kết quả lớp thất bại')
  return json as GetAiClassResultsResponse
}

// --- DELETE /api/classes/:id (AI backend) ---
export async function deleteAiClass(id: number): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Xóa lớp học thất bại')
  return json as { status: string; message?: string }
}

// --- PUT /api/classes/:id (AI backend) ---
export type UpdateAiClassBody = {
  name: string
  description?: string
  schoolYear: string
  teacherId: number
  subjectId: number
}

export async function updateAiClass(id: number, body: UpdateAiClassBody): Promise<{ status: string; data?: unknown; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật lớp học thất bại')
  return json as { status: string; data?: unknown; message?: string }
}

// --- GET /api/ai/generation-options ---
export type AiGenerationOptions = {
  subjects: Array<{
    id: number
    code: string
    name: string
    topics: string[] | null
    questionStats?: {
      total?: number
      byTopic?: Record<string, number>
      byBloomLevel?: Record<string, number>
    }
  }>
  bloomLevels: Array<{ value: string; label: string; description?: string | null }>
  questionTypes: Array<{ value: string; label: string }>
  defaultTopics: string[]
}

export type GetAiGenerationOptionsResponse = {
  status: string
  data: AiGenerationOptions
}

export async function getAiGenerationOptions(): Promise<GetAiGenerationOptionsResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/generation-options`, { method: 'GET', headers: getAuthHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy generation options thất bại')
  return json as GetAiGenerationOptionsResponse
}

// --- POST /api/ai/generate-question ---
export type GenerateAiQuestionBody = {
  subjectId: number
  topic: string
  bloomLevel: string
  questionType: string
  count: number
}

export type GenerateAiQuestionResponse = {
  status: string
  message?: string
  data?: {
    questions?: unknown[]
  }
}

export async function generateAiQuestion(body: GenerateAiQuestionBody): Promise<GenerateAiQuestionResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/generate-question`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Tạo câu hỏi AI thất bại')
  return json as GenerateAiQuestionResponse
}

// --- GET /api/topics?subjectId=... ---
export type AiTopic = {
  id: number
  subjectId: number
  code: string
  name: string
  description?: string | null
  orderNumber?: number | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  subject?: { id: number; code?: string; name?: string }
}

export type GetAiTopicsParams = {
  subjectId?: number
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export type GetAiTopicsResponse = {
  status: string
  data: {
    topics: AiTopic[]
    pagination?: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
      hasNextPage?: boolean
      hasPrevPage?: boolean
    }
  }
}

export async function getAiTopics(params: GetAiTopicsParams): Promise<GetAiTopicsResponse> {
  const sp = new URLSearchParams()
  if (params.subjectId != null) sp.set('subjectId', String(params.subjectId))
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.search) sp.set('search', params.search)
  if (params.isActive != null) sp.set('isActive', String(params.isActive))

  const q = sp.toString()
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/topics${q ? `?${q}` : ''}`, { method: 'GET', headers: getAuthHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy danh sách topics thất bại')
  return json as GetAiTopicsResponse
}

export type CreateAiTopicBody = {
  subjectId: number
  code: string
  name: string
  description?: string
  orderNumber?: number
}

export async function createAiTopic(body: CreateAiTopicBody): Promise<{ status: string; message?: string; data?: AiTopic }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/topics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Thêm chủ đề thất bại')
  return json as { status: string; message?: string; data?: AiTopic }
}

export type UpdateAiTopicBody = {
  code?: string
  name?: string
  description?: string
  orderNumber?: number
  isActive?: boolean
}

export async function updateAiTopic(id: number, body: UpdateAiTopicBody): Promise<{ status: string; message?: string; data?: AiTopic }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/topics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Cập nhật chủ đề thất bại')
  return json as { status: string; message?: string; data?: AiTopic }
}

export async function deleteAiTopic(id: number): Promise<{ status: string; message?: string }> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/topics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Xóa chủ đề thất bại')
  return json as { status: string; message?: string }
}

// --- POST /api/exams/random ---
export type RandomExamBody = {
  subjectId: number
  totalQuestions: number
  distribution: Record<string, number>
  excludeExamIds: number[]
  topicDistribution: Record<string, number>
}

export type RandomExamResponse = { status: string; message?: string; data?: unknown }

export async function createRandomExam(body: RandomExamBody): Promise<RandomExamResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/exams/random`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Tạo đề random thất bại')
  return json as RandomExamResponse
}

// --- POST /api/practice/start ---
export type StartPracticeBody = { subjectId: number; topicId: number; count: number }

export type StartPracticeResponse = {
  status: string
  message?: string
  data?: {
    sessionId: number
    subject?: { id: number; code?: string; name?: string }
    topic?: { id: number; code?: string; name?: string }
    totalQuestions?: number
    status?: string
  }
}

export async function startPractice(body: StartPracticeBody): Promise<StartPracticeResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/practice/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Bắt đầu luyện tập thất bại')
  return json as StartPracticeResponse
}

// --- GET /api/practice/:sessionId/questions ---
export type PracticeQuestion = {
  id: number
  contentHtml?: string | null
  options?: Record<string, string> | null
  questionType?: string | null
  topic?: string | null
  bloomLevel?: string | null
  hasImage?: boolean | null
  imageUrl?: string | null
  imageDescription?: string | null
}

export type PracticeSessionQuestion = {
  orderNumber: number
  sessionQuestionId: number
  studentAnswer: string | null
  question: PracticeQuestion
}

export type GetPracticeQuestionsResponse = {
  status: string
  data: {
    sessionId: number
    status?: string
    totalQuestions: number
    questions: PracticeSessionQuestion[]
  }
}

export async function getPracticeQuestions(sessionId: number): Promise<GetPracticeQuestionsResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/practice/${sessionId}/questions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy câu hỏi luyện tập thất bại')
  return json as GetPracticeQuestionsResponse
}

// --- POST /api/practice/:sessionId/submit ---
export type PracticeSubmitAnswer = {
  sessionQuestionId: number
  questionId: number
  selectedAnswer: string
}

export type SubmitPracticeBody = { answers: PracticeSubmitAnswer[] }

export type SubmitPracticeResponse = {
  status: string
  message?: string
  data?: unknown
}

export async function submitPractice(sessionId: number, body: SubmitPracticeBody): Promise<SubmitPracticeResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/practice/${sessionId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Nộp bài luyện tập thất bại')
  return json as SubmitPracticeResponse
}

// --- PATCH /api/practice/:sessionId/progress ---
export type PracticeProgressAnswer = {
  sessionQuestionId: number
  selectedAnswer: string
}

export type ProgressPracticeBody = { answers: PracticeProgressAnswer[] }

export type ProgressPracticeResponse = {
  status: string
  message?: string
}

export async function patchPracticeProgress(sessionId: number, body: ProgressPracticeBody): Promise<ProgressPracticeResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/practice/${sessionId}/progress`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lưu tiến độ thất bại')
  return json as ProgressPracticeResponse
}

// --- GET /api/practice/:sessionId/result ---
export type PracticeResultResponse = {
  status: string
  data: {
    sessionId: number
    subject: { id: number; code?: string; name?: string }
    topic: { id: number; code?: string; name?: string }
    status?: string
    totalQuestions: number
    score: number | null
    completedAt: string | null
    questions: Array<{
      orderNumber: number
      question: {
        id: number
        contentHtml?: string | null
        options?: Record<string, string> | null
        questionType?: string | null
        topic?: string | null
        bloomLevel?: string | null
        correctAnswer?: string | null
        explanationHtml?: string | null
        hasImage?: boolean | null
        imageUrl?: string | null
        imageDescription?: string | null
      }
      studentAnswer: string | null
      isCorrect: boolean | null
    }>
  }
}

export async function getPracticeResult(sessionId: number): Promise<PracticeResultResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/practice/${sessionId}/result`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy kết quả luyện tập thất bại')
  return json as PracticeResultResponse
}

// --- GET /api/practice/history?page=...&limit=... ---
export type PracticeHistoryItem = {
  id: number
  subject?: { id: number; code?: string; name?: string } | null
  topic?: { id: number; code?: string; name?: string } | null
  status?: string | null
  totalQuestions: number
  score: number | null
  createdAt: string
  completedAt: string | null
}

export type PracticeHistoryPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export type GetPracticeHistoryParams = {
  page?: number
  limit?: number
}

export type GetPracticeHistoryResponse = {
  status: string
  data: {
    sessions: PracticeHistoryItem[]
    pagination: PracticeHistoryPagination
  }
}

export async function getPracticeHistory(params: GetPracticeHistoryParams = {}): Promise<GetPracticeHistoryResponse> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.limit != null) sp.set('limit', String(params.limit))
  const query = sp.toString()
  const url = `${AI_EXAM_BASE_URL}/api/practice/history${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy lịch sử luyện tập thất bại')
  return json as GetPracticeHistoryResponse
}

// --- GET /api/ai/analysis/student/:studentId?subjectId=... ---
export type AiGenericResponse<T = unknown> = { status: string; data: T }

export type AiStudentAnalysisResponse = unknown

export async function getAiStudentAnalysis(params: { studentId: number; subjectId: number }): Promise<AiGenericResponse<AiStudentAnalysisResponse>> {
  const sp = new URLSearchParams()
  sp.set('subjectId', String(params.subjectId))
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/analysis/student/${params.studentId}?${sp.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Phân tích kết quả thất bại')
  return json as AiGenericResponse<AiStudentAnalysisResponse>
}

// --- GET /api/ai/predict-score?subjectId=... ---
export type AiPredictScoreResponse = unknown

export async function getAiPredictScore(params: { subjectId: number }): Promise<AiGenericResponse<AiPredictScoreResponse>> {
  const sp = new URLSearchParams()
  sp.set('subjectId', String(params.subjectId))
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/predict-score?${sp.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Dự đoán điểm thi thất bại')
  return json as AiGenericResponse<AiPredictScoreResponse>
}

// --- GET /api/ai/study-plan?subjectId=... ---
export type AiStudyPlanResponse = unknown

export async function getAiStudyPlan(params: { subjectId: number }): Promise<AiGenericResponse<AiStudyPlanResponse>> {
  const sp = new URLSearchParams()
  sp.set('subjectId', String(params.subjectId))
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/study-plan?${sp.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Tạo lộ trình học thất bại')
  return json as AiGenericResponse<AiStudyPlanResponse>
}

// --- POST /api/ai/explain ---
export type ExplainAiBody = {
  questionId?: number
  question?: {
    content_html?: string
    options?: Record<string, string>
    correct_answer?: string
    topic?: string
    bloom_level?: string
  }
}

export type ExplainAiResponse = {
  status: string
  message?: string
  data?: {
    question?: unknown
    explanation?: string
  }
}

export async function explainQuestionWithAi(body: ExplainAiBody): Promise<ExplainAiResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/explain`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Giải thích với AI thất bại')
  return json as ExplainAiResponse
}

// --- POST /api/ai/step-solution ---
export type StepSolutionAiBody = {
  questionId?: number
  question?: Record<string, unknown>
}

export type StepSolutionAiResponse = {
  status: string
  message?: string
  data?: {
    question?: unknown
    stepSolution?: string
  }
}

export async function getStepSolutionWithAi(body: StepSolutionAiBody): Promise<StepSolutionAiResponse> {
  const res = await fetch(`${AI_EXAM_BASE_URL}/api/ai/step-solution`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message ?? 'Lấy chi tiết bước giải AI thất bại')
  return json as StepSolutionAiResponse
}

