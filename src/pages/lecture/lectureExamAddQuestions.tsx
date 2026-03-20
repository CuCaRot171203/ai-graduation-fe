import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, Dropdown, Form, Input, Modal, Segmented, Select, Table, Upload, message } from 'antd'
import type { UploadFile } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { LatexMixed, LatexParagraphs, ocrPlainText } from '../../components/LatexMixed'
import {
  getExcelTemplates,
  downloadExcelTemplate,
  addQuestionToExam,
  importExamQuestionsFromExcel,
  importExamQuestionsFromOcr,
  reviewOcrSession,
  approveAllOcrSession,
  saveOcrSession,
  type AddQuestionToExamBody,
  type ExcelTemplate,
  type ExamQuestion,
} from '../../apis/examsApi'
import { generateAiQuestion, getAiExamById, getAiGenerationOptions, updateAiQuestion, type AiGenerationOptions } from '../../apis/aiExamApi'
import type { LoginUser } from '../../apis/authApi'

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

const BLOOM_LEVEL_OPTIONS = [
  { value: 'nhan_biet', label: 'Nhận biết' },
  { value: 'thong_hieu', label: 'Thông hiểu' },
  { value: 'van_dung', label: 'Vận dụng' },
  { value: 'van_dung_cao', label: 'Vận dụng cao' },
  { value: 'phan_tich', label: 'Phân tích' },
  { value: 'danh_gia', label: 'Đánh giá' },
  { value: 'sang_tao', label: 'Sáng tạo' },
]

const QUESTION_TYPE_OPTIONS = [
  { value: 'trac_nghiem_1_dap_an', label: 'Phần I - Trắc nghiệm 1 đáp án đúng' },
  { value: 'trac_nghiem_dung_sai', label: 'Phần II - Trắc nghiệm đúng sai' },
  { value: 'trac_nghiem_tra_loi_ngan', label: 'Phần III - Trắc nghiệm trả lời ngắn' },
  { value: 'tu_luan', label: 'Phần IV - Tự luận' },
  { value: 'trac_nghiem_nhieu_dap_an', label: 'Trắc nghiệm nhiều đáp án đúng' },
]

const ROUNDING_OPTIONS = [
  { value: 'integer', label: 'Số nguyên' },
  { value: '1_decimal', label: '1 chữ số thập phân' },
  { value: '2_decimals', label: '2 chữ số thập phân' },
  { value: '3_decimals', label: '3 chữ số thập phân' },
]

function stripHtml(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || '—'
}

function stripHtmlFull(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

function formatTopic(topic: string | undefined): string {
  if (!topic) return '—'
  return topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function topicLabelVi(topic: string): string {
  const t = String(topic || '').trim()
  const map: Record<string, string> = {
    dao_dong_co: 'Dao động cơ',
    song_co: 'Sóng cơ',
    dien_xoay_chieu: 'Điện xoay chiều',
    song_anh_sang: 'Sóng ánh sáng',
    luong_tu_anh_sang: 'Lượng tử ánh sáng',
    vat_ly_hat_nhan: 'Vật lý hạt nhân',
  }
  if (map[t]) return map[t]
  return formatTopic(t)
}

function formatCorrectAnswer(correct: string | undefined, questionType: string | undefined): string {
  if (!correct) return '—'
  const qType = (questionType ?? 'trac_nghiem_1_dap_an') === 'trac_nghiem' ? 'trac_nghiem_1_dap_an' : (questionType ?? 'trac_nghiem_1_dap_an')
  if (qType === 'trac_nghiem_nhieu_dap_an') return correct.replace(/,/g, ', ')
  if (qType === 'trac_nghiem_dung_sai') {
    try {
      const obj = JSON.parse(correct) as Record<string, boolean>
      return ['a', 'b', 'c', 'd'].map((k) => `${k}:${obj[k] ? 'Đ' : 'S'}`).join(', ')
    } catch {
      return correct
    }
  }
  if (qType === 'trac_nghiem_tra_loi_ngan') return correct
  if (qType === 'tu_luan') return correct.length > 50 ? correct.slice(0, 50) + '...' : correct
  return correct
}

function isWordImportFile(file: File | undefined | null): boolean {
  const n = file?.name?.toLowerCase() ?? ''
  return n.endsWith('.doc') || n.endsWith('.docx')
}

function isExcelOrCsvImportFile(file: File | undefined | null): boolean {
  const n = file?.name?.toLowerCase() ?? ''
  return n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.csv')
}

export default function LectureExamAddQuestions() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const examIdNum = examId ? parseInt(examId, 10) : 0
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [excelTemplates, setExcelTemplates] = useState<ExcelTemplate[]>([])
  const [excelFileList, setExcelFileList] = useState<UploadFile[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [importLoading, setImportLoading] = useState(false)
  /** excel = template + Excel/CSV; word = không template, AI OCR */
  const [importSourceType, setImportSourceType] = useState<'excel' | 'word'>('excel')
  const [aiScanModalOpen, setAiScanModalOpen] = useState(false)
  const [aiScanFileList, setAiScanFileList] = useState<UploadFile[]>([])
  const [aiScanProgress, setAiScanProgress] = useState(0)
  const [aiScanUploading, setAiScanUploading] = useState(false)
  const [form] = Form.useForm()
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [ocrPending, setOcrPending] = useState<{ sessionId: number; questions: ExamQuestion[] } | null>(null)
  const [reviewOcrLoading, setReviewOcrLoading] = useState(false)
  const [approveAllOcrLoading, setApproveAllOcrLoading] = useState(false)
  const [saveOcrLoading, setSaveOcrLoading] = useState(false)
  const [expandedExamQuestionKeys, setExpandedExamQuestionKeys] = useState<(string | number)[]>([])
  const [expandedOcrKeys, setExpandedOcrKeys] = useState<(string | number)[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<ExamQuestion> | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [reordered, setReordered] = useState(false)
  const [examSubjectId, setExamSubjectId] = useState<number | null>(null)

  const importPickedFile = excelFileList[0]?.originFileObj as File | undefined
  const importModalIsWord = importSourceType === 'word'

  const [aiGenModalOpen, setAiGenModalOpen] = useState(false)
  const [aiGenLoading, setAiGenLoading] = useState(false)
  const [aiGenOptionsLoading, setAiGenOptionsLoading] = useState(false)
  const [aiGenOptions, setAiGenOptions] = useState<AiGenerationOptions | null>(null)
  const [aiGenForm] = Form.useForm()
  const [aiGenPreviewOpen, setAiGenPreviewOpen] = useState(false)
  const [aiGenPreviewQuestions, setAiGenPreviewQuestions] = useState<ExamQuestion[]>([])
  const [aiGenPreviewEditingKey, setAiGenPreviewEditingKey] = useState<string | number | null>(null)
  const [aiGenPreviewDraft, setAiGenPreviewDraft] = useState<Partial<ExamQuestion> | null>(null)

  const normalizeAiGeneratedQuestion = (q: unknown, index: number): ExamQuestion => {
    const r = (q ?? {}) as Record<string, unknown>
    const options = (r.options ?? {}) as Record<string, string>
    const contentHtml = (r.contentHtml ?? r.content_html ?? '') as string
    const explanationHtml = (r.explanationHtml ?? r.explanation_html ?? '') as string
    const correctAnswer = (r.correctAnswer ?? r.correct_answer ?? '') as string
    const bloomLevel = (r.bloomLevel ?? r.bloom_level ?? '') as string
    const topic = (r.topic ?? 'general') as string
    const questionType = (r.questionType ?? r.question_type ?? 'trac_nghiem_1_dap_an') as string
    const id = (r.id as number | undefined) ?? undefined
    let opts: Record<string, string>
    if (questionType === 'trac_nghiem_dung_sai') {
      opts = { a: options.a ?? '', b: options.b ?? '', c: options.c ?? '', d: options.d ?? '' }
    } else if (questionType === 'trac_nghiem_tra_loi_ngan') {
      opts = {}
    } else {
      opts = { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' }
    }
    return {
      ...(id ? { id } : {}),
      order_number: (r.orderNumber as number | undefined) ?? (r.order_number as number | undefined) ?? index + 1,
      contentHtml,
      options: opts,
      correctAnswer,
      bloomLevel,
      topic,
      questionType,
      explanationHtml,
      ...(questionType === 'trac_nghiem_tra_loi_ngan' && (r.roundingRule ?? r.rounding_rule) ? { roundingRule: (r.roundingRule ?? r.rounding_rule) as string } : {}),
    } as unknown as ExamQuestion
  }

  const startEditAiPreview = (q: ExamQuestion, key: string | number) => {
    setAiGenPreviewEditingKey(key)
    setAiGenPreviewDraft({
      contentHtml: (q.contentHtml ?? q.content_html) as string,
      options: (q.options ?? {}) as Record<string, string>,
      correctAnswer: (q.correctAnswer ?? q.correct_answer) as string,
      explanationHtml: (q.explanationHtml ?? q.explanation_html) as string,
      bloomLevel: (q.bloomLevel ?? q.bloom_level) as string,
      topic: (q.topic as string) ?? '',
      questionType: (q as { questionType?: string }).questionType ?? 'trac_nghiem',
    })
  }

  const cancelEditAiPreview = () => {
    setAiGenPreviewEditingKey(null)
    setAiGenPreviewDraft(null)
  }

  const saveEditAiPreview = () => {
    if (aiGenPreviewEditingKey == null || !aiGenPreviewDraft) return
    setAiGenPreviewQuestions((prev) =>
      prev.map((q, i) => {
        const key = (q as { id?: number }).id ?? `gen-${i}`
        if (String(key) !== String(aiGenPreviewEditingKey)) return q
        const options = (aiGenPreviewDraft.options ?? {}) as Record<string, string>
        const qType = (aiGenPreviewDraft as { questionType?: string }).questionType ?? (q as { questionType?: string }).questionType ?? 'trac_nghiem_1_dap_an'
        let opts: Record<string, string>
        if (qType === 'trac_nghiem_dung_sai') {
          opts = { a: options.a ?? '', b: options.b ?? '', c: options.c ?? '', d: options.d ?? '' }
        } else if (qType === 'trac_nghiem_tra_loi_ngan') {
          opts = {}
        } else {
          opts = { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' }
        }
        return {
          ...q,
          contentHtml: (aiGenPreviewDraft.contentHtml ?? '') as string,
          options: opts,
          correctAnswer: (aiGenPreviewDraft as { correctAnswer?: string }).correctAnswer ?? (q.correctAnswer ?? q.correct_answer),
          bloomLevel: (aiGenPreviewDraft as { bloomLevel?: string }).bloomLevel ?? (q.bloomLevel ?? q.bloom_level),
          topic: (aiGenPreviewDraft.topic as string) ?? (q.topic as string),
          explanationHtml: (aiGenPreviewDraft as { explanationHtml?: string }).explanationHtml ?? (q.explanationHtml ?? q.explanation_html),
          questionType: qType,
        } as ExamQuestion
      })
    )
    message.success('Đã cập nhật câu hỏi (preview).')
    cancelEditAiPreview()
  }

  const fetchExamQuestions = useCallback(() => {
    if (!examIdNum) return
    setLoadingQuestions(true)
    getAiExamById(examIdNum)
      .then((res) => {
        const list = (res.data?.questions ?? []) as unknown as ExamQuestion[]
        setExamQuestions(Array.isArray(list) ? list : [])
        const sid = (res.data as unknown as { subjectId?: number; subject_id?: number })?.subjectId ?? (res.data as unknown as { subject_id?: number })?.subject_id
        setExamSubjectId(typeof sid === 'number' ? sid : null)
      })
      .catch(() => setExamQuestions([]))
      .finally(() => setLoadingQuestions(false))
  }, [examIdNum])

  const saveNewQuestionsToExam = useCallback(async () => {
    if (!examIdNum) return
    const pending = examQuestions.filter((q) => !(q as { id?: number }).id)
    if (!pending.length) {
      message.info('Không có câu hỏi mới cần lưu.')
      return
    }

    try {
      setLoadingQuestions(true)
      for (let i = 0; i < pending.length; i++) {
        const q = pending[i]
        const options = (q.options ?? {}) as Record<string, string>
        const qType = ((q as { questionType?: string; question_type?: string }).questionType ??
          (q as { question_type?: string }).question_type ??
          'trac_nghiem_1_dap_an') as string
        let opts: Record<string, string> | null = null
        if (qType === 'trac_nghiem_1_dap_an' || qType === 'trac_nghiem_nhieu_dap_an') {
          opts = { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' }
        } else if (qType === 'trac_nghiem_dung_sai') {
          opts = { a: options.a ?? '', b: options.b ?? '', c: options.c ?? '', d: options.d ?? '' }
        }
        const body: AddQuestionToExamBody = {
          content_html: ((q.contentHtml ?? q.content_html) ?? '') as string,
          options: opts,
          question_type: qType,
          topic: (q.topic ?? '') as string,
          bloom_level: ((q.bloomLevel ?? (q as { bloom_level?: string }).bloom_level) ?? '') as string,
          correct_answer: ((q.correctAnswer ?? q.correct_answer) ?? '') as string,
          explanation_html: ((q.explanationHtml ?? (q as { explanation_html?: string }).explanation_html) ?? '') as string,
        }
        if (qType === 'trac_nghiem_tra_loi_ngan') {
          body.rounding_rule = (q as { roundingRule?: string; rounding_rule?: string }).roundingRule ?? (q as { rounding_rule?: string }).rounding_rule ?? '1_decimal'
        }
        await addQuestionToExam(examIdNum, body)
      }
      message.success(`Đã lưu ${pending.length} câu hỏi mới vào đề.`)
      fetchExamQuestions()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lưu câu hỏi vào đề thất bại')
    } finally {
      setLoadingQuestions(false)
    }
  }, [examIdNum, examQuestions, fetchExamQuestions])

  const fetchAiGenOptions = useCallback(() => {
    setAiGenOptionsLoading(true)
    getAiGenerationOptions()
      .then((res) => setAiGenOptions(res.data))
      .catch((err) => message.error(err?.message ?? 'Không tải được options tạo câu hỏi AI'))
      .finally(() => setAiGenOptionsLoading(false))
  }, [])

  useEffect(() => {
    if (!examIdNum) return
    let cancelled = false
    const tid = setTimeout(() => { if (!cancelled) setLoadingQuestions(true) }, 0)
    getAiExamById(examIdNum)
      .then((res) => {
        if (cancelled) return
        setExamQuestions((res.data?.questions ?? []) as unknown as ExamQuestion[])
        const sid = (res.data as unknown as { subjectId?: number; subject_id?: number })?.subjectId ?? (res.data as unknown as { subject_id?: number })?.subject_id
        setExamSubjectId(typeof sid === 'number' ? sid : null)
      })
      .catch(() => { if (!cancelled) setExamQuestions([]) })
      .finally(() => { if (!cancelled) setLoadingQuestions(false) })
    return () => { cancelled = true; clearTimeout(tid) }
  }, [examIdNum])

  const startEdit = (q: ExamQuestion) => {
    const id = (q as { id?: number }).id
    if (!id) return
    setEditingQuestionId(id)
    setEditDraft({
      id,
      contentHtml: (q.contentHtml ?? q.content_html) as string,
      options: (q.options ?? {}) as Record<string, string>,
      correctAnswer: (q.correctAnswer ?? q.correct_answer) as string,
      explanationHtml: (q.explanationHtml ?? q.explanation_html) as string,
      bloomLevel: (q.bloomLevel ?? q.bloom_level) as string,
      topic: (q.topic as string) ?? '',
      questionType: (q as { questionType?: string }).questionType ?? 'trac_nghiem',
      order_number: (q as { orderNumber?: number; order_number?: number }).orderNumber ?? (q as { order_number?: number }).order_number,
    })
  }

  const cancelEdit = () => {
    setEditingQuestionId(null)
    setEditDraft(null)
  }

  const saveEdit = async () => {
    if (!editingQuestionId || !editDraft) return
    try {
      const options = (editDraft.options ?? {}) as Record<string, string>
      const qType = ((editDraft as { questionType?: string }).questionType ?? 'trac_nghiem_1_dap_an') as string
      let opts: Record<string, string> | undefined
      if (qType === 'trac_nghiem_1_dap_an' || qType === 'trac_nghiem_nhieu_dap_an') {
        opts = { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' }
      } else if (qType === 'trac_nghiem_dung_sai') {
        opts = { a: options.a ?? '', b: options.b ?? '', c: options.c ?? '', d: options.d ?? '' }
      } else {
        opts = undefined
      }
      await updateAiQuestion(editingQuestionId, {
        content_html: (editDraft.contentHtml ?? '') as string,
        options: opts,
        question_type: qType,
        topic: (editDraft.topic as string) ?? 'general',
        bloom_level: ((editDraft as { bloomLevel?: string }).bloomLevel ?? '') as string,
        correct_answer: ((editDraft as { correctAnswer?: string }).correctAnswer ?? '') as string,
        explanation_html: ((editDraft as { explanationHtml?: string }).explanationHtml ?? null) as string | null,
      })
      message.success('Đã cập nhật câu hỏi.')
      setExamQuestions((prev) =>
        prev.map((q) => ((q as { id?: number }).id === editingQuestionId ? { ...q, ...editDraft } : q))
      )
      cancelEdit()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Cập nhật câu hỏi thất bại')
    }
  }

  const questionRows = useMemo(() => {
    // Ưu tiên hiển thị theo orderNumber nếu có
    const list = [...examQuestions]
    list.sort((a, b) => {
      const ao = (a as { orderNumber?: number; order_number?: number }).orderNumber ?? (a as { order_number?: number }).order_number ?? 0
      const bo = (b as { orderNumber?: number; order_number?: number }).orderNumber ?? (b as { order_number?: number }).order_number ?? 0
      return ao - bo
    })
    return list
  }, [examQuestions])

  const openImportModal = useCallback(() => {
    setImportModalOpen(true)
    setImportSourceType('excel')
    setExcelFileList([])
    setSelectedTemplateId('')
    getExcelTemplates()
      .then((res) => {
        const list = res.data ?? []
        setExcelTemplates(list)
        if (list.length > 0) setSelectedTemplateId((prev) => prev || list[0].id)
      })
      .catch(() => setExcelTemplates([]))
  }, [])

  const handleDownloadSample = (templateId: string) => {
    downloadExcelTemplate(templateId)
      .then(() => message.success('Đã tải file mẫu.'))
      .catch((err) => message.error(err?.message ?? 'Tải mẫu thất bại'))
  }

  const updateOcrQuestion = useCallback((index: number, field: keyof ExamQuestion, value: unknown) => {
    setOcrPending((prev) => {
      if (!prev) return prev
      const next = prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
      return { ...prev, questions: next }
    })
  }, [])

  const handleReviewOcr = useCallback(() => {
    if (!ocrPending || !examIdNum) return
    setReviewOcrLoading(true)
    const body = {
      questions: ocrPending.questions.map((q, i) => ({
        index: i,
        approved: q.approved ?? true,
        correct_answer: (q.correct_answer ?? q.correctAnswer) ?? '',
        bloom_level: (q.bloom_level ?? q.bloomLevel) ?? '',
        topic: (q.topic as string) ?? '',
      })),
    }
    reviewOcrSession(examIdNum, ocrPending.sessionId, body)
      .then(() => message.success('Đã cập nhật duyệt.'))
      .catch((err) => message.error(err?.message ?? 'Cập nhật duyệt thất bại'))
      .finally(() => setReviewOcrLoading(false))
  }, [examIdNum, ocrPending])

  const handleApproveAllOcr = useCallback(() => {
    if (!ocrPending || !examIdNum) return
    setApproveAllOcrLoading(true)
    approveAllOcrSession(examIdNum, ocrPending.sessionId)
      .then(() => {
        setOcrPending((prev) => prev ? { ...prev, questions: prev.questions.map((q) => ({ ...q, approved: true })) } : null)
        message.success('Đã duyệt tất cả câu hỏi.')
      })
      .catch((err) => message.error(err?.message ?? 'Duyệt tất cả thất bại'))
      .finally(() => setApproveAllOcrLoading(false))
  }, [examIdNum, ocrPending])

  const handleSaveOcr = useCallback(() => {
    if (!ocrPending || !examIdNum) return
    setSaveOcrLoading(true)
    saveOcrSession(examIdNum, ocrPending.sessionId)
      .then(() => {
        message.success('Đã lưu câu hỏi vào đề.')
        setOcrPending(null)
        setExpandedOcrKeys([])
        fetchExamQuestions()
      })
      .catch((err) => message.error(err?.message ?? 'Lưu vào đề thất bại'))
      .finally(() => setSaveOcrLoading(false))
  }, [examIdNum, ocrPending, fetchExamQuestions])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="exams" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Thêm câu hỏi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thêm hàng loạt câu hỏi vào đề.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Thêm câu hỏi vào đề"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Button type="link" className="!px-0" onClick={() => navigate('/lecture/exams')}>
                Quản lý đề
              </Button>
              <span>/</span>
              <span>Thêm hàng loạt câu hỏi {examId ? `(Đề #${examId})` : ''}</span>
            </div>
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thêm hàng loạt câu hỏi
            </h2>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
              Chọn một trong các phương thức bên dưới để thêm câu hỏi vào đề thi.
            </p>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-4">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex flex-col items-center rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <span className="material-symbols-outlined mb-4 text-5xl text-primary">add_circle</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Thêm câu hỏi thủ công</span>
                <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nhập từng câu hỏi qua form</span>
              </button>
              <button
                type="button"
                onClick={openImportModal}
                className="flex flex-col items-center rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <span className="material-symbols-outlined mb-4 text-5xl text-primary">upload_file</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Import câu hỏi từ Excel, Word</span>
                <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  .xlsx, .xls, .csv, .doc, .docx — tối đa 10MB
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setAiScanModalOpen(true); setAiScanFileList([]); setAiScanProgress(0) }}
                className="flex flex-col items-center rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <span className="material-symbols-outlined mb-4 text-5xl text-primary">image</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">AI quét ảnh tự động</span>
                <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">PDF, JPG, PNG — nhận diện câu hỏi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiGenModalOpen(true)
                  aiGenForm.resetFields()
                  if (!aiGenOptions) fetchAiGenOptions()
                }}
                className="flex flex-col items-center rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <span className="material-symbols-outlined mb-4 text-5xl text-primary">smart_toy</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Tạo câu hỏi AI</span>
                <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sinh câu hỏi theo môn, topic, mức độ</span>
              </button>
            </div>

            {/* Câu hỏi chờ duyệt (OCR) - hiện sau khi quét AI xong */}
            {ocrPending && ocrPending.questions.length > 0 && (
              <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-900/10">
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Câu hỏi chờ duyệt (OCR) — {ocrPending.questions.length} câu
                </h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Chỉnh sửa đáp án đúng, Bloom, Topic nếu cần. Bấm &quot;Gửi duyệt&quot; để cập nhật, &quot;Duyệt tất cả&quot; để duyệt hết, &quot;Lưu vào đề&quot; để lưu câu đã duyệt vào đề thi.
                </p>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
                  <Table
                    rowKey={(r, i) => `ocr-${(r as ExamQuestion).order_number ?? i}`}
                    dataSource={ocrPending.questions}
                    pagination={{ pageSize: 5 }}
                    size="small"
                    expandable={{
                      expandedRowKeys: expandedOcrKeys,
                      onExpand: (expanded, record) => {
                        const key = `ocr-${(record as ExamQuestion).order_number ?? ocrPending.questions.indexOf(record as ExamQuestion)}`
                        setExpandedOcrKeys((prev) => (expanded ? [...prev, key] : prev.filter((k) => k !== key)))
                      },
                      expandedRowRender: (record: ExamQuestion) => {
                        const contentRaw = ocrPlainText((record.contentHtml ?? record.content_html) as string)
                        const options = (record.options ?? {}) as Record<string, string>
                        const correct = (record.correct_answer ?? record.correctAnswer) as string
                        const qType = ((record as { questionType?: string; question_type?: string }).questionType ?? (record as { question_type?: string }).question_type ?? 'trac_nghiem_1_dap_an') as string
                        if (qType === 'trac_nghiem_dung_sai') {
                          let answers: Record<string, boolean> = {}
                          try {
                            answers = JSON.parse(correct || '{}') as Record<string, boolean>
                          } catch { /* ignore */ }
                          const idx = ocrPending.questions.indexOf(record)
                          const setAnswer = (k: string, v: boolean) => {
                            const next = { ...answers, [k]: v }
                            updateOcrQuestion(idx, 'correct_answer', JSON.stringify(next))
                          }
                          return (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                              <div className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                                <LatexParagraphs text={contentRaw} />
                              </div>
                              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các phát biểu (chọn Đúng/Sai):</p>
                              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                {['a', 'b', 'c', 'd'].map((k) => (
                                  <li key={k} className="flex items-center gap-2">
                                    <span className="font-medium w-5">{k}).</span>
                                    <span className="flex-1">
                                      <LatexMixed text={ocrPlainText(options[k])} />
                                    </span>
                                    <Select
                                      size="small"
                                      style={{ width: 90 }}
                                      value={answers[k]}
                                      onChange={(v) => setAnswer(k, v === true)}
                                      options={[{ value: true, label: 'Đúng' }, { value: false, label: 'Sai' }]}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        }
                        if (qType === 'trac_nghiem_tra_loi_ngan') {
                          return (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                              <div className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                                <LatexParagraphs text={contentRaw} />
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                Đáp án:{' '}
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  <LatexMixed text={String(correct || '—')} />
                                </span>
                              </p>
                            </div>
                          )
                        }
                        if (qType === 'tu_luan') {
                          return (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                              <div className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                                <LatexParagraphs text={contentRaw} />
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-medium">Đáp án / Lời giải:</span>
                                <div className="mt-1 text-green-700 dark:text-green-400">
                                  <LatexParagraphs text={correct || '(Chưa có đáp án)'} />
                                </div>
                              </div>
                            </div>
                          )
                        }
                        const correctSet = qType === 'trac_nghiem_nhieu_dap_an' ? new Set((correct || '').split(',').map((s) => s.trim())) : new Set([correct])
                        return (
                          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                              <LatexParagraphs text={contentRaw} />
                            </div>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                              {['A', 'B', 'C', 'D'].map((letter) => {
                                const optText = options[letter] ?? '—'
                                const isCorrect = correctSet.has(letter)
                                return (
                                  <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                    <span className="font-medium">{letter}.</span>{' '}
                                    <LatexMixed text={ocrPlainText(optText)} />
                                    {isCorrect && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )
                      },
                    }}
                    onRow={(record, index) => ({
                      onClick: () => {
                        const key = `ocr-${(record as ExamQuestion).order_number ?? index ?? ocrPending.questions.indexOf(record as ExamQuestion)}`
                        setExpandedOcrKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
                      },
                    })}
                    columns={[
                      { title: 'STT', key: 'stt', width: 56, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
                      {
                        title: 'Nội dung',
                        key: 'content',
                        ellipsis: true,
                        render: (_: unknown, r: ExamQuestion) => (
                          <div className="max-h-[5rem] overflow-hidden text-sm leading-snug">
                            <LatexParagraphs text={ocrPlainText((r.contentHtml ?? r.content_html) as string)} />
                          </div>
                        ),
                      },
                      {
                        title: 'Đáp án đúng',
                        key: 'correct',
                        width: 140,
                        render: (_: unknown, r: ExamQuestion, i: number) => {
                          const qType = ((r as { questionType?: string; question_type?: string }).questionType ?? (r as { question_type?: string }).question_type ?? 'trac_nghiem_1_dap_an') as string
                          const raw = (r.correct_answer ?? r.correctAnswer) ?? ''
                          if (qType === 'trac_nghiem_nhieu_dap_an') {
                            const vals = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []
                            return (
                              <Select
                                mode="multiple"
                                size="small"
                                className="w-full"
                                value={vals}
                                onChange={(v) => updateOcrQuestion(i, 'correct_answer', Array.isArray(v) ? v.join(',') : v)}
                                options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                              />
                            )
                          }
                          if (qType === 'trac_nghiem_dung_sai') {
                            return <span className="text-sm">{formatCorrectAnswer(raw, qType)}</span>
                          }
                          if (qType === 'trac_nghiem_tra_loi_ngan') {
                            return (
                              <Input
                                size="small"
                                value={raw}
                                onChange={(e) => updateOcrQuestion(i, 'correct_answer', e.target.value)}
                                placeholder="Số"
                              />
                            )
                          }
                          if (qType === 'tu_luan') {
                            return <span className="text-sm text-slate-500" title={raw}>{formatCorrectAnswer(raw, qType)}</span>
                          }
                          return (
                            <Select
                              size="small"
                              className="w-full"
                              value={raw || undefined}
                              onChange={(v) => updateOcrQuestion(i, 'correct_answer', v)}
                              options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                            />
                          )
                        },
                      },
                      {
                        title: 'Bloom',
                        key: 'bloom',
                        width: 130,
                        render: (_: unknown, r: ExamQuestion, i: number) => (
                          <Select
                            size="small"
                            className="w-full"
                            value={(r.bloom_level ?? r.bloomLevel) ?? undefined}
                            onChange={(v) => updateOcrQuestion(i, 'bloom_level', v)}
                            options={BLOOM_LEVEL_OPTIONS}
                          />
                        ),
                      },
                      {
                        title: 'Topic',
                        key: 'topic',
                        width: 140,
                        render: (_: unknown, r: ExamQuestion, i: number) => (
                          <Input
                            size="small"
                            value={(r.topic as string) ?? ''}
                            onChange={(e) => updateOcrQuestion(i, 'topic', e.target.value)}
                            placeholder="Topic"
                          />
                        ),
                      },
                      {
                        title: 'Duyệt',
                        key: 'approved',
                        width: 80,
                        render: (_: unknown, r: ExamQuestion, i: number) => (
                          <Checkbox
                            checked={r.approved !== false}
                            onChange={(e) => updateOcrQuestion(i, 'approved', e.target.checked)}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button loading={reviewOcrLoading} onClick={handleReviewOcr} icon={<span className="material-symbols-outlined text-lg">edit_note</span>}>
                    Gửi duyệt
                  </Button>
                  <Button loading={approveAllOcrLoading} onClick={handleApproveAllOcr} icon={<span className="material-symbols-outlined text-lg">done_all</span>}>
                    Duyệt tất cả
                  </Button>
                  <Button type="primary" loading={saveOcrLoading} onClick={handleSaveOcr} icon={<span className="material-symbols-outlined text-lg">save</span>}>
                    Lưu vào đề
                  </Button>
                </div>
              </div>
            )}

            {/* Bảng câu hỏi đã thêm vào đề - click hàng để mở/đóng chi tiết */}
            <div className="mt-10">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Câu hỏi trong đề ({examQuestions.length})
              </h3>
              {reordered && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-200">
                  Bạn đã kéo thả để đổi thứ tự câu hỏi. Thứ tự hiện tại mới áp dụng trên giao diện (chưa lưu lên server).
                </div>
              )}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
                <Table
                  rowKey={(r) => String((r as ExamQuestion).id ?? examQuestions.indexOf(r as ExamQuestion))}
                  loading={loadingQuestions}
                  dataSource={questionRows}
                  pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `Tổng ${t} câu` }}
                  expandable={{
                    expandedRowKeys: expandedExamQuestionKeys,
                    onExpand: (expanded, record) => {
                      const key = String((record as ExamQuestion).id ?? examQuestions.indexOf(record as ExamQuestion))
                      setExpandedExamQuestionKeys((prev) =>
                        expanded ? [...prev, key] : prev.filter((k) => k !== key)
                      )
                    },
                    expandedRowRender: (record: ExamQuestion) => {
                      const content = stripHtmlFull((record.contentHtml ?? record.content_html) as string)
                      const options = (record.options ?? {}) as Record<string, string>
                      const correct = (record.correctAnswer ?? record.correct_answer) as string
                      const qType = ((record as { questionType?: string; question_type?: string }).questionType ?? (record as { question_type?: string }).question_type ?? 'trac_nghiem_1_dap_an') as string
                      const id = (record as { id?: number }).id ?? null
                      const isEditing = id != null && id === editingQuestionId && !!editDraft
                      const draft = isEditing ? (editDraft as ExamQuestion) : record
                      const draftOpts = (draft.options ?? {}) as Record<string, string>
                      const draftCorrect = (draft as { correctAnswer?: string }).correctAnswer ?? correct

                      const renderOptionsList = () => {
                        if (qType === 'trac_nghiem_dung_sai') {
                          let answers: Record<string, boolean> = {}
                          try {
                            answers = JSON.parse(draftCorrect || '{}') as Record<string, boolean>
                          } catch { /* ignore */ }
                          return (
                            <>
                              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các phát biểu:</p>
                              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                {['a', 'b', 'c', 'd'].map((k) => (
                                  <li key={k} className={answers[k] ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                    <span className="font-medium">{k}).</span> {(isEditing ? draftOpts[k] : options[k]) ?? '—'} — {answers[k] ? 'Đúng' : 'Sai'}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )
                        }
                        if (qType === 'trac_nghiem_tra_loi_ngan') {
                          return (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Đáp án: <span className="font-semibold text-green-600 dark:text-green-400">{draftCorrect || '—'}</span>
                            </p>
                          )
                        }
                        if (qType === 'tu_luan') {
                          return (
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Đáp án / Lời giải:</span>
                              <p className="mt-1 whitespace-pre-wrap text-green-700 dark:text-green-400">{draftCorrect || '(Chưa có đáp án)'}</p>
                            </div>
                          )
                        }
                        const correctSet = qType === 'trac_nghiem_nhieu_dap_an'
                          ? new Set((draftCorrect || '').split(',').map((s) => s.trim()))
                          : new Set([draftCorrect])
                        return (
                          <>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                              {['A', 'B', 'C', 'D'].map((letter) => {
                                const text = (isEditing ? draftOpts[letter] : options[letter]) ?? '—'
                                const isCorrect = correctSet.has(letter)
                                return (
                                  <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                    <span className="font-medium">{letter}.</span> {text}
                                    {isCorrect && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                                  </li>
                                )
                              })}
                            </ul>
                          </>
                        )
                      }

                      const renderEditFields = () => {
                        if (qType === 'trac_nghiem_1_dap_an') {
                          return (
                            <>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {(['A', 'B', 'C', 'D'] as const).map((k) => (
                                  <Input key={k} value={draftOpts[k] ?? ''} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, options: { ...draftOpts, [k]: e.target.value } } : prev))} placeholder={`Đáp án ${k}`} />
                                ))}
                              </div>
                              <Select value={draftCorrect || undefined} onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: v } : prev))} options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} placeholder="Đáp án đúng" style={{ width: 120 }} />
                            </>
                          )
                        }
                        if (qType === 'trac_nghiem_nhieu_dap_an') {
                          const vals = (draftCorrect || '').split(',').map((s) => s.trim()).filter(Boolean)
                          return (
                            <>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {(['A', 'B', 'C', 'D'] as const).map((k) => (
                                  <Input key={k} value={draftOpts[k] ?? ''} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, options: { ...draftOpts, [k]: e.target.value } } : prev))} placeholder={`Đáp án ${k}`} />
                                ))}
                              </div>
                              <Select mode="multiple" value={vals} onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: Array.isArray(v) ? v.join(',') : v } : prev))} options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} placeholder="Đáp án đúng (nhiều)" style={{ width: '100%' }} />
                            </>
                          )
                        }
                        if (qType === 'trac_nghiem_dung_sai') {
                          let answers: Record<string, boolean> = {}
                          try {
                            answers = JSON.parse(draftCorrect || '{}') as Record<string, boolean>
                          } catch { /* ignore */ }
                          return (
                            <div className="space-y-2">
                              {(['a', 'b', 'c', 'd'] as const).map((k) => (
                                <div key={k} className="flex gap-2 items-center">
                                  <Input className="flex-1" value={draftOpts[k] ?? ''} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, options: { ...draftOpts, [k]: e.target.value } } : prev))} placeholder={`Phát biểu ${k}`} />
                                  <Select style={{ width: 90 }} value={answers[k]} onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: JSON.stringify({ ...answers, [k]: v === true }) } : prev))} options={[{ value: true, label: 'Đúng' }, { value: false, label: 'Sai' }]} />
                                </div>
                              ))}
                            </div>
                          )
                        }
                        if (qType === 'trac_nghiem_tra_loi_ngan') {
                          return (
                            <Input type="number" step="any" value={draftCorrect} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: e.target.value } : prev))} placeholder="Đáp án số" />
                          )
                        }
                        if (qType === 'tu_luan') {
                          return (
                            <Input.TextArea rows={4} value={draftCorrect} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: e.target.value } : prev))} placeholder="Đáp án / Lời giải mẫu" />
                          )
                        }
                        return null
                      }

                      return (
                        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-slate-700 dark:text-slate-200">
                              <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                              {isEditing ? null : content}
                            </p>
                            <div className="flex items-center gap-2">
                              {!isEditing ? (
                                <Button size="small" onClick={() => startEdit(record)} icon={<span className="material-symbols-outlined text-base">edit</span>}>Sửa</Button>
                              ) : (
                                <>
                                  <Button size="small" type="primary" onClick={saveEdit} icon={<span className="material-symbols-outlined text-base">save</span>}>Lưu</Button>
                                  <Button size="small" onClick={cancelEdit}>Hủy</Button>
                                </>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <div className="mb-3 space-y-3">
                              <Input.TextArea rows={3} value={(draft.contentHtml ?? '') as string} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, contentHtml: e.target.value } : prev))} placeholder="Nội dung câu hỏi" />
                              {renderEditFields()}
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <Select value={((draft as { bloomLevel?: string }).bloomLevel ?? '') as string} onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, bloomLevel: v } : prev))} options={BLOOM_LEVEL_OPTIONS} placeholder="Bloom" />
                                <Input value={(draft.topic as string) ?? ''} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, topic: e.target.value } : prev))} placeholder="Topic" />
                              </div>
                              <Input.TextArea rows={2} value={((draft as { explanationHtml?: string }).explanationHtml ?? '') as string} onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, explanationHtml: e.target.value } : prev))} placeholder="Giải thích" />
                            </div>
                          )}
                          {!isEditing && renderOptionsList()}
                          <p className="mt-2 text-xs text-slate-500">
                            Bloom: {(draft.bloomLevel ?? (draft as { bloom_level?: string }).bloom_level) ?? '—'} · Topic: {formatTopic(draft.topic as string)}
                          </p>
                          {(draft.explanationHtml ?? (draft as { explanation_html?: string }).explanation_html) ? (
                            <div className="mt-3 rounded border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lời giải</p>
                              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: ((draft.explanationHtml ?? (draft as { explanation_html?: string }).explanation_html) as string) }} />
                            </div>
                          ) : null}
                        </div>
                      )
                    },
                  }}
                  onRow={(record, index) => ({
                    draggable: true,
                    onDragStart: () => {
                      dragIndexRef.current = index ?? 0
                    },
                    onDragOver: (e) => {
                      e.preventDefault()
                    },
                    onDrop: () => {
                      const from = dragIndexRef.current
                      const to = index ?? 0
                      if (from == null || from === to) return
                      setExamQuestions((prev) => {
                        const next = [...prev]
                        const moved = next.splice(from, 1)[0]
                        next.splice(to, 0, moved)
                        return next
                      })
                      setReordered(true)
                      dragIndexRef.current = null
                    },
                    onClick: () => {
                      const key = String((record as ExamQuestion).id ?? index ?? examQuestions.indexOf(record as ExamQuestion))
                      setExpandedExamQuestionKeys((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    },
                  })}
                  columns={[
                    { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
                    { title: 'Nội dung', key: 'content', ellipsis: true, render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string) },
                    { title: 'Đáp án đúng', key: 'correct', width: 140, render: (_: unknown, r: ExamQuestion) => formatCorrectAnswer((r.correctAnswer ?? r.correct_answer) as string, (r as { questionType?: string; question_type?: string }).questionType ?? (r as { question_type?: string }).question_type) },
                    { title: 'Bloom', key: 'bloom', width: 100, render: (_: unknown, r: ExamQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—' },
                    { title: 'Topic', key: 'topic', width: 120, render: (_: unknown, r: ExamQuestion) => formatTopic(r.topic as string) },
                  ]}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3">
              <Button size="large" onClick={() => navigate('/lecture/exams')}>
                Quay lại danh sách đề
              </Button>
              <Button
                onClick={saveNewQuestionsToExam}
                loading={loadingQuestions}
                icon={<span className="material-symbols-outlined">save</span>}
                size="large"
              >
                Lưu lại đề
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<span className="material-symbols-outlined">check_circle</span>}
                onClick={() => {
                  saveNewQuestionsToExam().finally(() => {
                    message.success('Xác nhận đề thành công.')
                    navigate('/lecture/exams')
                  })
                }}
              >
                Xác nhận và quay lại danh sách đề
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tạo câu hỏi AI */}
      <Modal
        title="Tạo câu hỏi AI"
        open={aiGenModalOpen}
        onCancel={() => setAiGenModalOpen(false)}
        onOk={() => aiGenForm.submit()}
        okText="Tạo câu hỏi"
        cancelText="Hủy"
        confirmLoading={aiGenLoading}
        width={720}
        destroyOnHidden
      >
        <Form
          form={aiGenForm}
          layout="vertical"
          initialValues={{ questionType: 'trac_nghiem', count: 5 }}
          onFinish={async (values) => {
            const subjectId = examSubjectId ?? 0
            const topic = String(values.topic ?? '').trim()
            const bloomLevel = String(values.bloomLevel ?? '').trim()
            const questionType = String(values.questionType ?? '').trim()
            const count = Number(values.count ?? 1)
            if (!subjectId) {
              message.error('Không xác định được môn học của đề. Vui lòng tải lại trang.')
              return
            }
            if (!topic || !bloomLevel || !questionType || !count) {
              message.error('Vui lòng nhập đủ thông tin.')
              return
            }
            try {
              setAiGenLoading(true)
              const res = await generateAiQuestion({ subjectId, topic, bloomLevel, questionType, count })
              const rawQuestions = (res.data?.questions ?? []) as unknown[]
              const normalized = Array.isArray(rawQuestions) ? rawQuestions.map((q, i) => normalizeAiGeneratedQuestion(q, i)) : []
              setAiGenPreviewQuestions(normalized)
              setAiGenModalOpen(false)
              setAiGenPreviewOpen(true)
              message.success(res.message ?? 'Tạo câu hỏi AI thành công.')
            } catch (err) {
              message.error(err instanceof Error ? err.message : 'Tạo câu hỏi AI thất bại')
            } finally {
              setAiGenLoading(false)
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="Topic" name="topic" rules={[{ required: true, message: 'Chọn topic' }]}>
              <Select
                loading={aiGenOptionsLoading}
                placeholder="Chọn topic"
                showSearch
                optionFilterProp="label"
                allowClear
                options={(() => {
                  const sid = examSubjectId ?? 0
                  const subj = (aiGenOptions?.subjects ?? []).find((s) => s.id === sid)
                  const byTopic = subj?.questionStats?.byTopic ?? {}
                  const fromStats = Object.keys(byTopic)
                  const fromDefault = aiGenOptions?.defaultTopics ?? []
                  const unique = Array.from(new Set([...fromStats, ...fromDefault])).filter(Boolean)
                  return unique.map((t) => ({
                    value: t,
                    label: `${topicLabelVi(t)}${byTopic[t] != null ? ` (${byTopic[t]})` : ''}`,
                  }))
                })()}
              />
            </Form.Item>

            <Form.Item label="Mức độ khó" name="bloomLevel" rules={[{ required: true, message: 'Chọn mức độ' }]}>
              <Select
                loading={aiGenOptionsLoading}
                placeholder="Chọn mức độ"
                allowClear
                options={(aiGenOptions?.bloomLevels ?? []).map((b) => ({
                  value: b.value,
                  label: (
                    <div>
                      <div className="font-semibold">{b.label}</div>
                      {b.description ? <div className="text-xs text-slate-500">{b.description}</div> : null}
                    </div>
                  ),
                }))}
              />
            </Form.Item>

            <Form.Item label="Loại câu hỏi" name="questionType" rules={[{ required: true, message: 'Chọn loại câu hỏi' }]}>
              <Select
                loading={aiGenOptionsLoading}
                placeholder="Chọn loại"
                allowClear
                options={(aiGenOptions?.questionTypes ?? []).map((t) => ({ value: t.value, label: t.label }))}
              />
            </Form.Item>

            <Form.Item label="Số lượng câu hỏi" name="count" rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <Input type="number" min={1} max={50} placeholder="VD: 5" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal Preview câu hỏi AI (Accept -> mới thêm vào đề) */}
      <Modal
        title={`Câu hỏi AI đã tạo (${aiGenPreviewQuestions.length})`}
        open={aiGenPreviewOpen}
        onCancel={() => {
          setAiGenPreviewOpen(false)
          cancelEditAiPreview()
        }}
        okText="Xác nhận và thêm vào đề"
        cancelText="Đóng"
        onOk={() => {
          if (!aiGenPreviewQuestions.length) {
            message.warning('Chưa có câu hỏi để thêm.')
            return
          }
          setExamQuestions((prev) => [...aiGenPreviewQuestions, ...prev])
          message.success(`Đã thêm ${aiGenPreviewQuestions.length} câu hỏi vào đề.`)
          setAiGenPreviewOpen(false)
          cancelEditAiPreview()
          setAiGenPreviewQuestions([])
        }}
        width={980}
        destroyOnHidden
      >
        <div className="mb-3 text-sm text-slate-500">
          Bạn có thể <span className="font-medium">Sửa</span> hoặc <span className="font-medium">Xóa</span> từng câu hỏi. Chỉ khi bấm <span className="font-medium">Accept</span> thì câu hỏi mới được thêm vào đề bên dưới.
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <Table
            rowKey={(r, i) => String((r as { id?: number }).id ?? `gen-${i}`)}
            dataSource={aiGenPreviewQuestions}
            pagination={{ pageSize: 5 }}
            size="small"
            expandable={{
              expandedRowRender: (record: ExamQuestion, index) => {
                const key = String((record as { id?: number }).id ?? `gen-${index}`)
                const isEditing = String(aiGenPreviewEditingKey) === key
                const draft = isEditing ? (aiGenPreviewDraft as ExamQuestion) : record
                const options = (draft.options ?? {}) as Record<string, string>
                const correct = (draft.correctAnswer ?? (draft as { correct_answer?: string }).correct_answer) as string
                const qType = ((draft as { questionType?: string; question_type?: string }).questionType ?? (draft as { question_type?: string }).question_type ?? 'trac_nghiem_1_dap_an') as string

                const renderOptionsSection = () => {
                  if (qType === 'trac_nghiem_dung_sai') {
                    let answers: Record<string, boolean> = {}
                    try {
                      answers = JSON.parse(correct || '{}') as Record<string, boolean>
                    } catch { /* ignore */ }
                    return (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {['a', 'b', 'c', 'd'].map((k) => (
                          <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/30">
                            <div className="mb-1 text-xs font-semibold text-slate-500">{k})</div>
                            {isEditing ? (
                              <div className="flex gap-2">
                                <Input className="flex-1" value={options[k] ?? ''} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), options: { ...((d?.options ?? {}) as Record<string, string>), [k]: e.target.value } }))} />
                                <Select style={{ width: 90 }} value={answers[k]} onChange={(v) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: JSON.stringify({ ...answers, [k]: v === true }) }))} options={[{ value: true, label: 'Đúng' }, { value: false, label: 'Sai' }]} />
                              </div>
                            ) : (
                              <div className={answers[k] ? 'font-semibold text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}>
                                {options[k] ?? '—'} — {answers[k] ? 'Đúng' : 'Sai'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }
                  if (qType === 'trac_nghiem_tra_loi_ngan') {
                    return (
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án (số)</div>
                        {isEditing ? (
                          <Input type="number" step="any" value={correct} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: e.target.value }))} placeholder="VD: 42.5" />
                        ) : (
                          <div className="font-semibold text-green-600 dark:text-green-400">{correct || '—'}</div>
                        )}
                      </div>
                    )
                  }
                  if (qType === 'tu_luan') {
                    return (
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án / Lời giải</div>
                        {isEditing ? (
                          <Input.TextArea rows={4} value={correct} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: e.target.value }))} placeholder="Nhập đáp án hoặc lời giải mẫu..." />
                        ) : (
                          <div className="whitespace-pre-wrap text-green-700 dark:text-green-400">{correct || '(Chưa có đáp án)'}</div>
                        )}
                      </div>
                    )
                  }
                  const correctSet = qType === 'trac_nghiem_nhieu_dap_an' ? new Set((correct || '').split(',').map((s) => s.trim())) : new Set([correct])
                  return (
                    <>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {['A', 'B', 'C', 'D'].map((k) => (
                          <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/30">
                            <div className="mb-1 text-xs font-semibold text-slate-500">{k}</div>
                            {isEditing ? (
                              <Input value={options[k] ?? ''} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), options: { ...((d?.options ?? {}) as Record<string, string>), [k]: e.target.value } }))} />
                            ) : (
                              <div className={correctSet.has(k) ? 'font-semibold text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}>
                                {options[k] ?? '—'}
                                {correctSet.has(k) && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án đúng</div>
                        {isEditing ? (
                          qType === 'trac_nghiem_nhieu_dap_an' ? (
                            <Select mode="multiple" value={(correct || '').split(',').map((s) => s.trim()).filter(Boolean)} onChange={(v) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: Array.isArray(v) ? v.join(',') : v }))} options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} style={{ width: 200 }} />
                          ) : (
                            <Select value={correct || undefined} onChange={(v) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: v }))} options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} style={{ width: 120 }} />
                          )
                        ) : (
                          <div className="text-slate-700 dark:text-slate-200">{formatCorrectAnswer(correct, qType)}</div>
                        )}
                      </div>
                    </>
                  )
                }

                return (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Mức độ khó: {(draft.bloomLevel ?? (draft as { bloom_level?: string }).bloom_level) ?? '—'} · Topic: {topicLabelVi((draft.topic as string) ?? '')}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button size="small" onClick={cancelEditAiPreview}>Hủy</Button>
                            <Button size="small" type="primary" onClick={saveEditAiPreview}>Lưu</Button>
                          </>
                        ) : (
                          <>
                            <Button size="small" onClick={() => startEditAiPreview(record, key)} icon={<span className="material-symbols-outlined text-lg">edit</span>}>Sửa</Button>
                            <Button size="small" danger onClick={() => { cancelEditAiPreview(); setAiGenPreviewQuestions((prev) => prev.filter((_, i) => i !== index)) }} icon={<span className="material-symbols-outlined text-lg">delete</span>}>Xóa</Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      {isEditing ? (
                        <Input.TextArea rows={3} value={(draft.contentHtml ?? '') as string} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), contentHtml: e.target.value }))} />
                      ) : (
                        <div className="font-medium text-slate-800 dark:text-slate-200">{stripHtmlFull((record.contentHtml ?? record.content_html) as string)}</div>
                      )}
                    </div>
                    {renderOptionsSection()}
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-semibold text-slate-500">Giải thích</div>
                      {isEditing ? (
                        <Input.TextArea rows={2} value={(draft.explanationHtml ?? '') as string} onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), explanationHtml: e.target.value }))} />
                      ) : (
                        <div className="text-slate-700 dark:text-slate-200">{stripHtmlFull((record.explanationHtml ?? record.explanation_html) as string) || '—'}</div>
                      )}
                    </div>
                  </div>
                )
              },
            }}
            columns={[
              { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
              { title: 'Nội dung', key: 'content', ellipsis: true, render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string) },
              { title: 'Đáp án đúng', key: 'correct', width: 140, render: (_: unknown, r: ExamQuestion) => formatCorrectAnswer((r.correctAnswer ?? r.correct_answer) as string, (r as { questionType?: string; question_type?: string }).questionType ?? (r as { question_type?: string }).question_type) },
              { title: 'Mức độ khó', key: 'bloom', width: 120, render: (_: unknown, r: ExamQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—' },
              { title: 'Topic', key: 'topic', width: 160, render: (_: unknown, r: ExamQuestion) => topicLabelVi(r.topic as string) },
            ]}
          />
        </div>
      </Modal>

      {/* Modal Thêm câu hỏi thủ công */}
      <Modal title="Thêm câu hỏi mới" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields() }} footer={null} width={720} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ questionType: 'trac_nghiem_1_dap_an' }}
          onFinish={(values) => {
            if (!examIdNum) return
            setAddLoading(true)
            const qType = values.questionType ?? 'trac_nghiem_1_dap_an'
            let options: Record<string, string> | null = null
            let correctAnswer = ''

            if (qType === 'trac_nghiem_1_dap_an' || qType === 'trac_nghiem_nhieu_dap_an') {
              options = {
                A: values.option_A ?? '',
                B: values.option_B ?? '',
                C: values.option_C ?? '',
                D: values.option_D ?? '',
              }
              correctAnswer = qType === 'trac_nghiem_nhieu_dap_an'
                ? (values.correctAnswers ?? []).join(',')
                : (values.correctAnswer ?? '')
            } else if (qType === 'trac_nghiem_dung_sai') {
              options = {
                a: values.statement_a ?? '',
                b: values.statement_b ?? '',
                c: values.statement_c ?? '',
                d: values.statement_d ?? '',
              }
              correctAnswer = JSON.stringify({
                a: values.answer_a === true,
                b: values.answer_b === true,
                c: values.answer_c === true,
                d: values.answer_d === true,
              })
            } else if (qType === 'trac_nghiem_tra_loi_ngan') {
              correctAnswer = String(values.correctAnswerNumber ?? '')
            } else if (qType === 'tu_luan') {
              correctAnswer = values.correctAnswerText ?? ''
            }

            const body: AddQuestionToExamBody = {
              content_html: values.contentHtml ?? '',
              options,
              question_type: qType,
              topic: values.topic ?? '',
              bloom_level: values.bloomLevel ?? '',
              correct_answer: correctAnswer,
              explanation_html: values.explanationHtml ?? '',
            }
            if (qType === 'trac_nghiem_tra_loi_ngan') {
              body.rounding_rule = values.roundingRule ?? '1_decimal'
            }

            addQuestionToExam(examIdNum, body)
              .then(() => {
                message.success('Đã thêm câu hỏi vào đề.')
                setAddModalOpen(false)
                form.resetFields()
                fetchExamQuestions()
              })
              .catch((err) => message.error(err?.message ?? 'Thêm câu hỏi thất bại'))
              .finally(() => setAddLoading(false))
          }}
        >
          <Form.Item name="questionType" label="Loại câu hỏi" rules={[{ required: true }]}>
            <Select options={QUESTION_TYPE_OPTIONS} placeholder="Chọn loại câu hỏi" />
          </Form.Item>
          <Form.Item name="contentHtml" label="Nội dung câu hỏi *" rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}>
            <Input.TextArea rows={4} placeholder="Nhập nội dung câu hỏi tại đây..." />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.questionType !== curr.questionType}>
            {({ getFieldValue }) => {
              const qType = getFieldValue('questionType')
              if (qType === 'trac_nghiem_1_dap_an') {
                return (
                  <>
                    <Form.Item label="Đáp án A, B, C, D">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <Form.Item key={letter} name={`option_${letter}`} noStyle>
                          <Input placeholder={`Đáp án ${letter}`} className="mb-2" />
                        </Form.Item>
                      ))}
                    </Form.Item>
                    <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}>
                      <Select placeholder="Chọn 1 đáp án" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} />
                    </Form.Item>
                  </>
                )
              }
              if (qType === 'trac_nghiem_nhieu_dap_an') {
                return (
                  <>
                    <Form.Item label="Đáp án A, B, C, D">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <Form.Item key={letter} name={`option_${letter}`} noStyle>
                          <Input placeholder={`Đáp án ${letter}`} className="mb-2" />
                        </Form.Item>
                      ))}
                    </Form.Item>
                    <Form.Item name="correctAnswers" label="Đáp án đúng (chọn nhiều)" rules={[{ required: true, message: 'Chọn ít nhất 1 đáp án' }]}>
                      <Select mode="multiple" placeholder="Chọn các đáp án đúng" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} />
                    </Form.Item>
                  </>
                )
              }
              if (qType === 'trac_nghiem_dung_sai') {
                return (
                  <>
                    <Form.Item label="4 phát biểu (a, b, c, d)">
                      {(['a', 'b', 'c', 'd'] as const).map((letter) => (
                        <div key={letter} className="mb-3 flex gap-2">
                          <Form.Item name={`statement_${letter}`} noStyle className="flex-1">
                            <Input placeholder={`Phát biểu ${letter}`} />
                          </Form.Item>
                          <Form.Item name={`answer_${letter}`} noStyle>
                            <Select style={{ width: 100 }} placeholder="Đ/S" options={[{ value: true, label: 'Đúng' }, { value: false, label: 'Sai' }]} />
                          </Form.Item>
                        </div>
                      ))}
                    </Form.Item>
                  </>
                )
              }
              if (qType === 'trac_nghiem_tra_loi_ngan') {
                return (
                  <>
                    <Form.Item name="correctAnswerNumber" label="Đáp án (số)" rules={[{ required: true, message: 'Nhập đáp án số' }]}>
                      <Input type="number" step="any" placeholder="VD: 42.5" />
                    </Form.Item>
                    <Form.Item name="roundingRule" label="Quy tắc làm tròn">
                      <Select options={ROUNDING_OPTIONS} placeholder="Chọn quy tắc" />
                    </Form.Item>
                  </>
                )
              }
              if (qType === 'tu_luan') {
                return (
                  <Form.Item name="correctAnswerText" label="Đáp án / Lời giải mẫu">
                    <Input.TextArea rows={4} placeholder="Nhập đáp án hoặc lời giải mẫu chi tiết..." />
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="bloomLevel" label="Mức độ Bloom" rules={[{ required: true }]}>
              <Select placeholder="Chọn cấp độ" options={BLOOM_LEVEL_OPTIONS} />
            </Form.Item>
            <Form.Item name="topic" label="Chủ đề" rules={[{ required: true }]}>
              <Select placeholder="Chọn chủ đề" options={[{ value: 'dao_dong_co', label: 'Dao động cơ' }, { value: 'song_co', label: 'Sóng cơ' }, { value: 'dien_xoay_chieu', label: 'Điện xoay chiều' }, { value: 'song_anh_sang', label: 'Sóng ánh sáng' }, { value: 'luong_tu_anh_sang', label: 'Lượng tử ánh sáng' }, { value: 'vat_ly_hat_nhan', label: 'Vật lý hạt nhân' }]} />
            </Form.Item>
          </div>
          <Form.Item name="explanationHtml" label="Giải thích (tùy chọn)">
            <Input.TextArea rows={2} placeholder="Lời giải chi tiết..." />
          </Form.Item>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => { setAddModalOpen(false); form.resetFields() }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={addLoading} icon={<span className="material-symbols-outlined">save</span>}>Lưu câu hỏi</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Import Excel / Word — Excel: import API; Word: OCR → bảng chờ duyệt */}
      <Modal
        title="Import câu hỏi từ Excel, Word"
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false)
          setImportSourceType('excel')
          setExcelFileList([])
          setSelectedTemplateId('')
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Segmented
          block
          className="mb-4"
          value={importSourceType}
          onChange={(v) => {
            setImportSourceType(v as 'excel' | 'word')
            setExcelFileList([])
          }}
          options={[
            { label: 'Excel / CSV', value: 'excel' },
            { label: 'Word (.doc, .docx)', value: 'word' },
          ]}
        />
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {importModalIsWord ? (
            <>
              <strong>Word:</strong> không dùng template. Chọn file → <strong>Trích xuất câu hỏi</strong> → kết quả ở &quot;Câu hỏi chờ duyệt
              (OCR)&quot; → <strong>Lưu vào đề</strong>.
            </>
          ) : (
            <>
              <strong>Excel / CSV:</strong> chọn template và (khuyến nghị) file mẫu. Không áp dụng cho Word.
            </>
          )}
        </p>
        {!importModalIsWord && (
          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium">Chọn template (Excel / CSV)</span>
            <Select
              className="w-full"
              placeholder="Chọn template"
              value={selectedTemplateId || undefined}
              onChange={setSelectedTemplateId}
              options={excelTemplates.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>
        )}
        <Upload.Dragger
          accept={importModalIsWord ? '.doc,.docx' : '.xlsx,.xls,.csv'}
          fileList={excelFileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={({ fileList }) => setExcelFileList(fileList)}
        >
          <p className="py-8">
            <span className="material-symbols-outlined text-5xl text-primary">upload_file</span>
          </p>
          <p className="text-sm font-medium">Kéo file vào đây hoặc chọn file</p>
          <p className="mt-1 text-xs text-slate-500">
            {importModalIsWord ? 'Chỉ file Word — tối đa 10MB' : 'Chỉ Excel / CSV — tối đa 10MB'}
          </p>
        </Upload.Dragger>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {!importModalIsWord ? (
            <Dropdown
              menu={{
                items: excelTemplates.length
                  ? excelTemplates.map((t) => ({ key: t.id, label: t.name, onClick: () => handleDownloadSample(t.id) }))
                  : [{ key: 'load', label: 'Đang tải...', disabled: true }],
              }}
              trigger={['click']}
            >
              <Button icon={<span className="material-symbols-outlined">download</span>}>Tải file Excel mẫu</Button>
            </Dropdown>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setImportModalOpen(false)
                setImportSourceType('excel')
                setExcelFileList([])
                setSelectedTemplateId('')
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={importLoading}
              disabled={
                !importPickedFile ||
                (importModalIsWord
                  ? !isWordImportFile(importPickedFile)
                  : !selectedTemplateId || !isExcelOrCsvImportFile(importPickedFile))
              }
              onClick={() => {
                const file = excelFileList[0]?.originFileObj as File | undefined
                if (!file || !examIdNum) return
                if (importModalIsWord) {
                  if (!isWordImportFile(file)) {
                    message.warning('Vui lòng chọn file .doc hoặc .docx')
                    return
                  }
                  setImportLoading(true)
                  importExamQuestionsFromOcr(examIdNum, [file])
                    .then((res) => {
                      const list = res.data?.questions ?? []
                      setOcrPending({ sessionId: res.data.sessionId, questions: list })
                      setImportModalOpen(false)
                      setImportSourceType('excel')
                      setExcelFileList([])
                      setSelectedTemplateId('')
                      if (list.length > 0) {
                        message.success(
                          res.message ?? `Đã trích ${list.length} câu từ Word. Duyệt bên dưới rồi lưu vào đề.`
                        )
                      } else {
                        message.warning('Không trích được câu hỏi từ file Word.')
                      }
                    })
                    .catch((err) => message.error(err?.message ?? 'Trích xuất Word thất bại'))
                    .finally(() => setImportLoading(false))
                  return
                }
                if (!selectedTemplateId) return
                if (!isExcelOrCsvImportFile(file)) {
                  message.warning('Vui lòng chọn file .xls, .xlsx hoặc .csv (hoặc chuyển sang tab Word).')
                  return
                }
                setImportLoading(true)
                importExamQuestionsFromExcel(examIdNum, file, selectedTemplateId)
                  .then((res) => {
                    const msg = res.message ?? `Import thành công ${res.data?.imported ?? 0} câu hỏi`
                    message.success(msg)
                    setImportModalOpen(false)
                    setImportSourceType('excel')
                    setExcelFileList([])
                    setSelectedTemplateId('')
                    fetchExamQuestions()
                    if (Array.isArray(res.data?.errors) && res.data.errors.length > 0) {
                      message.warning(`Có ${res.data.errors.length} lỗi: ${res.data.errors.slice(0, 3).join(', ')}`)
                    }
                  })
                  .catch((err) => message.error(err?.message ?? 'Import thất bại'))
                  .finally(() => setImportLoading(false))
              }}
            >
              {importModalIsWord ? 'Trích xuất câu hỏi' : 'Upload file'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal AI quét ảnh - không preview, quét xong đóng modal và đẩy data xuống bảng trang */}
      <Modal
        title="AI quét ảnh tự động"
        open={aiScanModalOpen}
        onCancel={() => { setAiScanModalOpen(false); setAiScanFileList([]); setAiScanProgress(0) }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary">cloud_upload</span>
          <p className="mt-4 font-medium">Upload file PDF hoặc ảnh để AI nhận diện câu hỏi (có thể chọn nhiều ảnh)</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Supported: PDF, JPG, PNG</p>
          <Upload
            accept=".pdf,.jpg,.jpeg,.png"
            fileList={aiScanFileList}
            multiple
            maxCount={20}
            beforeUpload={() => false}
            onChange={({ fileList }) => setAiScanFileList(fileList)}
            onRemove={() => setAiScanFileList((prev) => prev.slice(0, -1))}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button type="default" className="mt-4" icon={<span className="material-symbols-outlined">add</span>}>Chọn file</Button>
          </Upload>
          {aiScanFileList.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-sm text-slate-600 dark:text-slate-400">Đã chọn {aiScanFileList.length} file.</p>
              <Button
                type="primary"
                className="mt-3"
                loading={aiScanUploading}
                icon={<span className="material-symbols-outlined">image_search</span>}
                onClick={() => {
                  const files = aiScanFileList.map((f) => f.originFileObj).filter(Boolean) as File[]
                  if (!files.length || !examIdNum) return
                  setAiScanUploading(true)
                  setAiScanProgress(0)
                  const t = setInterval(() => setAiScanProgress((p) => (p >= 95 ? p : p + 10)), 150)
                  importExamQuestionsFromOcr(examIdNum, files)
                    .then((res) => {
                      clearInterval(t)
                      setAiScanProgress(100)
                      const list = res.data?.questions ?? []
                      setOcrPending({ sessionId: res.data.sessionId, questions: list })
                      setAiScanModalOpen(false)
                      setAiScanFileList([])
                      setAiScanProgress(0)
                      if (list.length > 0) message.success(res.message ?? `Đã nhận diện ${list.length} câu. Duyệt bên dưới rồi lưu vào đề.`)
                    })
                    .catch((err) => {
                      clearInterval(t)
                      message.error(err?.message ?? 'Quét ảnh thất bại')
                    })
                    .finally(() => setAiScanUploading(false))
                }}
              >
                Quét ảnh
              </Button>
              {aiScanUploading && (
                <div className="mt-3 flex items-center gap-2">
                  <progress
                    className="h-2 flex-1 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-primary dark:[&::-webkit-progress-bar]:bg-slate-700"
                    value={aiScanProgress}
                    max={100}
                  />
                  <span className="text-xs font-medium">{aiScanProgress}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
