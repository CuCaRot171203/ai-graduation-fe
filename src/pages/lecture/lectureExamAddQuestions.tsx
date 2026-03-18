import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, Dropdown, Form, Input, Modal, Select, Table, Upload, message } from 'antd'
import type { UploadFile } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import {
  getExcelTemplates,
  downloadExcelTemplate,
  addQuestionToExam,
  importExamQuestionsFromExcel,
  importExamQuestionsFromOcr,
  reviewOcrSession,
  approveAllOcrSession,
  saveOcrSession,
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
  { value: 'phan_tich', label: 'Phân tích' },
  { value: 'danh_gia', label: 'Đánh giá' },
  { value: 'sang_tao', label: 'Sáng tạo' },
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
    const questionType = (r.questionType ?? r.question_type ?? 'trac_nghiem') as string
    const id = (r.id as number | undefined) ?? undefined
    // note: generated questions might not have id yet
    return {
      ...(id ? { id } : {}),
      order_number: (r.orderNumber as number | undefined) ?? (r.order_number as number | undefined) ?? index + 1,
      contentHtml,
      options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
      correctAnswer,
      bloomLevel,
      topic,
      questionType,
      explanationHtml,
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
        return {
          ...q,
          contentHtml: (aiGenPreviewDraft.contentHtml ?? '') as string,
          options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
          correctAnswer: (aiGenPreviewDraft as { correctAnswer?: string }).correctAnswer ?? (q.correctAnswer ?? q.correct_answer),
          bloomLevel: (aiGenPreviewDraft as { bloomLevel?: string }).bloomLevel ?? (q.bloomLevel ?? q.bloom_level),
          topic: (aiGenPreviewDraft.topic as string) ?? (q.topic as string),
          explanationHtml: (aiGenPreviewDraft as { explanationHtml?: string }).explanationHtml ?? (q.explanationHtml ?? q.explanation_html),
          questionType: (aiGenPreviewDraft as { questionType?: string }).questionType ?? (q as { questionType?: string }).questionType ?? 'trac_nghiem',
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
        const body = {
          content_html: ((q.contentHtml ?? q.content_html) ?? '') as string,
          options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
          question_type: ((q as { questionType?: string; question_type?: string }).questionType ??
            (q as { question_type?: string }).question_type ??
            'trac_nghiem') as string,
          topic: (q.topic ?? '') as string,
          bloom_level: ((q.bloomLevel ?? (q as { bloom_level?: string }).bloom_level) ?? '') as string,
          correct_answer: ((q.correctAnswer ?? q.correct_answer) ?? '') as string,
          explanation_html: ((q.explanationHtml ?? (q as { explanation_html?: string }).explanation_html) ?? '') as string,
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
      await updateAiQuestion(editingQuestionId, {
        content_html: (editDraft.contentHtml ?? '') as string,
        options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
        question_type: ((editDraft as { questionType?: string }).questionType ?? 'trac_nghiem') as string,
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
              Chọn một trong ba phương thức bên dưới để thêm câu hỏi vào đề thi.
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
                <span className="text-lg font-bold text-slate-900 dark:text-white">Import câu hỏi từ Excel</span>
                <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">.xlsx, .xls, .csv — tối đa 10MB</span>
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
                        const content = stripHtmlFull((record.contentHtml ?? record.content_html) as string)
                        const options = (record.options ?? {}) as Record<string, string>
                        const correct = (record.correct_answer ?? record.correctAnswer) as string
                        return (
                          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="mb-3 font-medium text-slate-700 dark:text-slate-200">{content}</p>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                              {['A', 'B', 'C', 'D'].map((letter) => {
                                const text = options[letter] ?? '—'
                                const isCorrect = correct === letter
                                return (
                                  <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                    <span className="font-medium">{letter}.</span> {text}
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
                      { title: 'Nội dung', key: 'content', ellipsis: true, render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string) },
                      {
                        title: 'Đáp án đúng',
                        key: 'correct',
                        width: 110,
                        render: (_: unknown, r: ExamQuestion, i: number) => (
                          <Select
                            size="small"
                            className="w-full"
                            value={(r.correct_answer ?? r.correctAnswer) ?? undefined}
                            onChange={(v) => updateOcrQuestion(i, 'correct_answer', v)}
                            options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                          />
                        ),
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
                      const letters = ['A', 'B', 'C', 'D']
                      const id = (record as { id?: number }).id ?? null
                      const isEditing = id != null && id === editingQuestionId && !!editDraft
                      const draft = isEditing ? (editDraft as ExamQuestion) : record
                      return (
                        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-slate-700 dark:text-slate-200">
                              <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                              {isEditing ? null : content}
                            </p>
                            <div className="flex items-center gap-2">
                              {!isEditing ? (
                                <Button size="small" onClick={() => startEdit(record)} icon={<span className="material-symbols-outlined text-base">edit</span>}>
                                  Sửa
                                </Button>
                              ) : (
                                <>
                                  <Button size="small" type="primary" onClick={saveEdit} icon={<span className="material-symbols-outlined text-base">save</span>}>
                                    Lưu
                                  </Button>
                                  <Button size="small" onClick={cancelEdit}>Hủy</Button>
                                </>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <div className="mb-3 space-y-3">
                              <Input.TextArea
                                rows={3}
                                value={(draft.contentHtml ?? '') as string}
                                onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, contentHtml: e.target.value } : prev))}
                                placeholder="contentHtml"
                              />
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {(['A', 'B', 'C', 'D'] as const).map((k) => (
                                  <Input
                                    key={k}
                                    value={((draft.options ?? {}) as Record<string, string>)[k] ?? ''}
                                    onChange={(e) =>
                                      setEditDraft((prev) => {
                                        if (!prev) return prev
                                        const nextOpt = { ...((prev.options ?? {}) as Record<string, string>), [k]: e.target.value }
                                        return { ...prev, options: nextOpt }
                                      })
                                    }
                                    placeholder={`Đáp án ${k}`}
                                  />
                                ))}
                              </div>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                <Select
                                  value={((draft as { correctAnswer?: string }).correctAnswer ?? '') as string}
                                  onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, correctAnswer: v } : prev))}
                                  options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                                  placeholder="Đáp án đúng"
                                />
                                <Select
                                  value={((draft as { bloomLevel?: string }).bloomLevel ?? '') as string}
                                  onChange={(v) => setEditDraft((prev) => (prev ? { ...prev, bloomLevel: v } : prev))}
                                  options={BLOOM_LEVEL_OPTIONS}
                                  placeholder="Bloom"
                                />
                                <Input
                                  value={(draft.topic as string) ?? ''}
                                  onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, topic: e.target.value } : prev))}
                                  placeholder="Topic"
                                />
                              </div>
                              <Input.TextArea
                                rows={2}
                                value={((draft as { explanationHtml?: string }).explanationHtml ?? '') as string}
                                onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, explanationHtml: e.target.value } : prev))}
                                placeholder="explanationHtml (HTML)"
                              />
                            </div>
                          )}
                          <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            {letters.map((letter) => {
                              const text = (isEditing ? (((draft.options ?? {}) as Record<string, string>)[letter] ?? '—') : (options[letter] ?? '—'))
                              const isCorrect = (isEditing ? ((draft as { correctAnswer?: string }).correctAnswer === letter) : (correct === letter))
                              return (
                                <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                  <span className="font-medium">{letter}.</span> {text}
                                  {isCorrect && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                                </li>
                              )
                            })}
                          </ul>
                          <p className="mt-2 text-xs text-slate-500">
                            Bloom: {(draft.bloomLevel ?? (draft as { bloom_level?: string }).bloom_level) ?? '—'} · Topic: {formatTopic(draft.topic as string)}
                          </p>
                          {(draft.explanationHtml ?? (draft as { explanation_html?: string }).explanation_html) ? (
                            <div className="mt-3 rounded border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Lời giải
                              </p>
                              <div
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: ((draft.explanationHtml ?? (draft as { explanation_html?: string }).explanation_html) as string) }}
                              />
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
                    { title: 'Đáp án đúng', key: 'correct', width: 100, render: (_: unknown, r: ExamQuestion) => (r.correctAnswer ?? r.correct_answer) ?? '—' },
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
                return (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Mức độ khó: {(draft.bloomLevel ?? (draft as { bloom_level?: string }).bloom_level) ?? '—'} · Topic: {topicLabelVi((draft.topic as string) ?? '')}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button size="small" onClick={cancelEditAiPreview}>
                              Hủy
                            </Button>
                            <Button size="small" type="primary" onClick={saveEditAiPreview}>
                              Lưu
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="small"
                              onClick={() => startEditAiPreview(record, key)}
                              icon={<span className="material-symbols-outlined text-lg">edit</span>}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() => {
                                cancelEditAiPreview()
                                setAiGenPreviewQuestions((prev) => prev.filter((_, i) => i !== index))
                              }}
                              icon={<span className="material-symbols-outlined text-lg">delete</span>}
                            >
                              Xóa
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      {isEditing ? (
                        <Input.TextArea
                          rows={3}
                          value={(draft.contentHtml ?? '') as string}
                          onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), contentHtml: e.target.value }))}
                        />
                      ) : (
                        <div className="font-medium text-slate-800 dark:text-slate-200">{stripHtmlFull((record.contentHtml ?? record.content_html) as string)}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {['A', 'B', 'C', 'D'].map((k) => (
                        <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/30">
                          <div className="mb-1 text-xs font-semibold text-slate-500">{k}</div>
                          {isEditing ? (
                            <Input
                              value={options[k] ?? ''}
                              onChange={(e) =>
                                setAiGenPreviewDraft((d) => ({
                                  ...(d ?? {}),
                                  options: { ...(((d?.options ?? {}) as Record<string, string>) ?? {}), [k]: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            <div className={correct === k ? 'font-semibold text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}>
                              {options[k] ?? '—'}
                              {correct === k && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án đúng</div>
                        {isEditing ? (
                          <Select
                            value={(draft.correctAnswer ?? '') as string}
                            onChange={(v) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), correctAnswer: v }))}
                            options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                          />
                        ) : (
                          <div className="text-slate-700 dark:text-slate-200">{correct || '—'}</div>
                        )}
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Giải thích</div>
                        {isEditing ? (
                          <Input.TextArea
                            rows={2}
                            value={(draft.explanationHtml ?? '') as string}
                            onChange={(e) => setAiGenPreviewDraft((d) => ({ ...(d ?? {}), explanationHtml: e.target.value }))}
                          />
                        ) : (
                          <div className="text-slate-700 dark:text-slate-200">
                            {stripHtmlFull((record.explanationHtml ?? record.explanation_html) as string) || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              },
            }}
            columns={[
              { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
              { title: 'Nội dung', key: 'content', ellipsis: true, render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string) },
              { title: 'Đáp án đúng', key: 'correct', width: 110, render: (_: unknown, r: ExamQuestion) => (r.correctAnswer ?? r.correct_answer) ?? '—' },
              { title: 'Mức độ khó', key: 'bloom', width: 120, render: (_: unknown, r: ExamQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—' },
              { title: 'Topic', key: 'topic', width: 160, render: (_: unknown, r: ExamQuestion) => topicLabelVi(r.topic as string) },
            ]}
          />
        </div>
      </Modal>

      {/* Modal Thêm câu hỏi thủ công */}
      <Modal title="Thêm câu hỏi mới" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields() }} footer={null} width={640} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (!examIdNum) return
            setAddLoading(true)
            const body = {
              content_html: values.contentHtml ?? '',
              options: {
                A: values.option_A ?? '',
                B: values.option_B ?? '',
                C: values.option_C ?? '',
                D: values.option_D ?? '',
              },
              question_type: 'trac_nghiem',
              topic: values.topic ?? '',
              bloom_level: values.bloomLevel ?? '',
              correct_answer: values.correctAnswer ?? '',
              explanation_html: values.explanationHtml ?? '',
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
          <Form.Item name="contentHtml" label="Nội dung câu hỏi *" rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}>
            <Input.TextArea rows={4} placeholder="Nhập nội dung câu hỏi tại đây..." />
          </Form.Item>
          <Form.Item label="Danh sách đáp án">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <Form.Item key={letter} name={`option_${letter}`} noStyle>
                <Input placeholder={`Nhập đáp án ${letter}`} className="mb-2" />
              </Form.Item>
            ))}
          </Form.Item>
          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}>
              <Select placeholder="Chọn đáp án" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]} />
            </Form.Item>
            <Form.Item name="bloomLevel" label="Bloom level" rules={[{ required: true }]}>
              <Select placeholder="Chọn cấp độ" options={BLOOM_LEVEL_OPTIONS} />
            </Form.Item>
            <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
              <Select placeholder="Chọn chủ đề" options={[{ value: 'dao_dong_co', label: 'Dao động cơ' }, { value: 'dien_xoay_chieu', label: 'Điện xoay chiều' }]} />
            </Form.Item>
          </div>
          <Form.Item name="explanationHtml" label="Giải thích (tùy chọn)">
            <Input.TextArea rows={2} placeholder="Giải thích đáp án..." />
          </Form.Item>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => { setAddModalOpen(false); form.resetFields() }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={addLoading} icon={<span className="material-symbols-outlined">save</span>}>Lưu câu hỏi</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Import Excel - API trả về { data: { imported, errors, templateUsed } } */}
      <Modal
        title="Tải tập tin lên"
        open={importModalOpen}
        onCancel={() => { setImportModalOpen(false); setExcelFileList([]) }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <p className="mb-4 text-sm text-slate-500">Hỗ trợ .xls, .xlsx, .csv. Vui lòng sử dụng file mẫu để tránh lỗi định dạng.</p>
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium">Chọn template</span>
          <Select
            className="w-full"
            placeholder="Chọn template"
            value={selectedTemplateId || undefined}
            onChange={setSelectedTemplateId}
            options={excelTemplates.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
        <Upload.Dragger accept=".xlsx,.xls,.csv" fileList={excelFileList} maxCount={1} beforeUpload={() => false} onChange={({ fileList }) => setExcelFileList(fileList)}>
          <p className="py-8"><span className="material-symbols-outlined text-5xl text-primary">upload_file</span></p>
          <p className="text-sm font-medium">Kéo file Excel vào đây hoặc chọn file</p>
          <p className="mt-1 text-xs text-slate-500">Dung lượng tối đa 10MB</p>
        </Upload.Dragger>
        <div className="mt-6 flex items-center justify-between">
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
          <div className="flex gap-2">
            <Button onClick={() => { setImportModalOpen(false); setExcelFileList([]) }}>Hủy</Button>
            <Button
              type="primary"
              loading={importLoading}
              disabled={excelFileList.length === 0 || !selectedTemplateId}
              onClick={() => {
                const file = excelFileList[0]?.originFileObj
                if (!file || !examIdNum || !selectedTemplateId) return
                setImportLoading(true)
                importExamQuestionsFromExcel(examIdNum, file as File, selectedTemplateId)
                  .then((res) => {
                    const msg = res.message ?? `Import thành công ${res.data?.imported ?? 0} câu hỏi`
                    message.success(msg)
                    setImportModalOpen(false)
                    setExcelFileList([])
                    fetchExamQuestions()
                    if (Array.isArray(res.data?.errors) && res.data.errors.length > 0) {
                      message.warning(`Có ${res.data.errors.length} lỗi: ${res.data.errors.slice(0, 3).join(', ')}`)
                    }
                  })
                  .catch((err) => message.error(err?.message ?? 'Import thất bại'))
                  .finally(() => setImportLoading(false))
                }}
              >
                Upload file
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
