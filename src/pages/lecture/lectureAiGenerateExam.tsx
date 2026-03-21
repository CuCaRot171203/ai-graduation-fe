import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Input, Modal, Popconfirm, Select, Table, Tag, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import {
  generateExamWithAi,
  getQuestionBank,
  getTeacherSubjectsFromAiBackend,
  saveGeneratedExam,
  type QuestionBankItem,
} from '../../apis/aiExamApi'
import type { Subject } from '../../apis/subjectsApi'
import { useNavigate } from 'react-router-dom'
import { HtmlWithMath } from '../../components/HtmlWithMath'
import { QuestionHtmlPreview } from '../../components/QuestionHtmlPreview'
import { decorateMathInHtml } from '../../utils/mathHtml'

const TEACHER_AVATAR =
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

type PreviewQuestion = {
  id: string
  contentHtml: string
  explanationHtml: string
  options: { A: string; B: string; C: string; D: string }
  correctAnswer: 'A' | 'B' | 'C' | 'D' | ''
  level: string
}

type PreviewExam = {
  title: string
  description: string
  subjectId: number | null
  durationMinutes: number
  questions: PreviewQuestion[]
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function normalizeOptions(v: unknown): { A: string; B: string; C: string; D: string } | null {
  const obj = asRecord(v)
  if (obj) {
    const A = typeof obj.A === 'string' ? obj.A : typeof obj.a === 'string' ? (obj.a as string) : ''
    const B = typeof obj.B === 'string' ? obj.B : typeof obj.b === 'string' ? (obj.b as string) : ''
    const C = typeof obj.C === 'string' ? obj.C : typeof obj.c === 'string' ? (obj.c as string) : ''
    const D = typeof obj.D === 'string' ? obj.D : typeof obj.d === 'string' ? (obj.d as string) : ''
    return { A, B, C, D }
  }
  if (Array.isArray(v)) {
    const arr = v as unknown[]
    const A = typeof arr[0] === 'string' ? (arr[0] as string) : ''
    const B = typeof arr[1] === 'string' ? (arr[1] as string) : ''
    const C = typeof arr[2] === 'string' ? (arr[2] as string) : ''
    const D = typeof arr[3] === 'string' ? (arr[3] as string) : ''
    return { A, B, C, D }
  }
  return null
}

function normalizeCorrect(v: unknown): 'A' | 'B' | 'C' | 'D' | '' {
  const raw = (typeof v === 'string' ? v : '').trim().toUpperCase()
  if (raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D') return raw
  return ''
}

function normalizeLevel(v: unknown): string {
  const raw = (typeof v === 'string' ? v : '').trim()
  return raw || 'Chưa gán'
}

function levelColor(level: string): string {
  const t = (level || '').toLowerCase()
  if (t.includes('van_dung_cao') || t.includes('vận dụng cao') || t.includes('nâng cao') || t.includes('hard')) return 'purple'
  if (t.includes('van_dung') || t.includes('vận dụng') || t.includes('apply')) return 'green'
  if (t.includes('thong_hieu') || t.includes('thông hiểu') || t.includes('understand')) return 'blue'
  if (t.includes('nhan_biet') || t.includes('nhận biết') || t.includes('co_ban') || t.includes('cơ bản') || t.includes('easy')) return 'default'
  return 'gold'
}

function tryParseExamFromResult(result: unknown): PreviewExam | null {
  const root = asRecord(result)
  const data = root ? (root.data as unknown) : null

  // common shapes: { data: { exam: { title, durationMinutes, questions: [...] } } } OR { data: { questions: [...] } }
  const dataRec = asRecord(data)
  const examRec = dataRec ? asRecord(dataRec.exam) : null
  const candidateQuestions =
    (examRec && Array.isArray(examRec.questions) ? (examRec.questions as unknown[]) : null) ??
    (dataRec && Array.isArray(dataRec.questions) ? (dataRec.questions as unknown[]) : null)

  const buildFromQuestions = (qs: unknown[], meta?: Record<string, unknown> | null): PreviewExam | null => {
    const normalized: PreviewQuestion[] = []
    qs.forEach((q, idx) => {
      const qRec = asRecord(q)
      if (!qRec) return
      const contentHtml =
        (typeof qRec.content_html === 'string' && (qRec.content_html as string)) ||
        (typeof qRec.contentHtml === 'string' && (qRec.contentHtml as string)) ||
        (typeof qRec.contentHTML === 'string' && (qRec.contentHTML as string)) ||
        (typeof qRec.content === 'string' && (qRec.content as string)) ||
        (typeof qRec.question === 'string' && (qRec.question as string)) ||
        (typeof qRec.text === 'string' && (qRec.text as string)) ||
        ''
      const explanationHtml =
        (typeof qRec.explanation_html === 'string' && (qRec.explanation_html as string)) ||
        (typeof qRec.explanationHtml === 'string' && (qRec.explanationHtml as string)) ||
        ''
      const options =
        normalizeOptions(qRec.options) ??
        normalizeOptions(qRec.answers) ??
        normalizeOptions(qRec.choices) ??
        { A: '', B: '', C: '', D: '' }
      const correct = normalizeCorrect(
        qRec.correct_answer ?? qRec.correctAnswer ?? qRec.correct ?? qRec.answer
      )
      const level = normalizeLevel(qRec.bloom_level ?? qRec.bloomLevel ?? qRec.level)

      // require at least some signal
      if (!contentHtml && !options.A && !options.B && !options.C && !options.D) return

      normalized.push({
        id: (typeof qRec.id === 'string' ? (qRec.id as string) : typeof qRec.id === 'number' ? String(qRec.id) : `q${idx + 1}`),
        contentHtml,
        explanationHtml,
        options,
        correctAnswer: correct,
        level,
      })
    })
    if (normalized.length === 0) return null
    const title =
      (meta && typeof meta.title === 'string' ? (meta.title as string) : undefined) ??
      (meta && typeof meta.name === 'string' ? (meta.name as string) : undefined) ??
      'Đề thi (AI)'
    const description =
      (meta && typeof meta.description === 'string' ? (meta.description as string) : undefined) ??
      (meta && typeof meta.ai_reasoning === 'string' ? (meta.ai_reasoning as string) : undefined) ??
      ''
    const subjectId =
      meta && typeof meta.subject_id === 'number'
        ? (meta.subject_id as number)
        : meta && typeof meta.subjectId === 'number'
          ? (meta.subjectId as number)
          : null
    const durationMinutes =
      meta && typeof meta.durationMinutes === 'number'
        ? (meta.durationMinutes as number)
        : meta && typeof meta.duration_minutes === 'number'
          ? (meta.duration_minutes as number)
          : meta && typeof meta.duration === 'number'
            ? (meta.duration as number)
            : 60
    return { title, description, subjectId, durationMinutes, questions: normalized }
  }

  if (candidateQuestions) return buildFromQuestions(candidateQuestions, examRec ?? dataRec)

  // fallback: deep search first array that looks like questions
  const visited = new Set<unknown>()
  const queue: unknown[] = [result]
  while (queue.length) {
    const node = queue.shift()
    if (!node || typeof node !== 'object') continue
    if (visited.has(node)) continue
    visited.add(node)

    if (Array.isArray(node)) {
      const maybeExam = buildFromQuestions(node)
      if (maybeExam) return maybeExam
      node.forEach((x) => queue.push(x))
      continue
    }

    const rec = node as Record<string, unknown>
    Object.values(rec).forEach((v) => queue.push(v))
  }

  return null
}

export default function LectureAiGenerateExam() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const teacherId = user?.id ?? null

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [requestText, setRequestText] = useState('Tạo đề thi Vật Lý 12 minh họa kỳ thi tốt nghiệp THPT, 40 câu, 60 phút')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [previewExam, setPreviewExam] = useState<PreviewExam | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [draftQuestion, setDraftQuestion] = useState<PreviewQuestion | null>(null)
  const [saving, setSaving] = useState(false)

  // Question bank modal
  const [bankOpen, setBankOpen] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankRows, setBankRows] = useState<QuestionBankItem[]>([])
  const [bankPage, setBankPage] = useState(1)
  const [bankLimit, setBankLimit] = useState(20)
  const [bankTotal, setBankTotal] = useState(0)
  const [bankSubjectId, setBankSubjectId] = useState<number | undefined>(undefined)
  const [bankTopic, setBankTopic] = useState('')
  const [bankBloom, setBankBloom] = useState<string | undefined>(undefined)
  const [bankIsAi, setBankIsAi] = useState<boolean | undefined>(undefined)
  const [bankSearch, setBankSearch] = useState('')
  const [bankSelectedIds, setBankSelectedIds] = useState<React.Key[]>([])

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
    [subjects]
  )

  const levelStats = useMemo(() => {
    const qs = previewExam?.questions ?? []
    const stats = new Map<string, number>()
    qs.forEach((q) => {
      const key = normalizeLevel(q.level)
      stats.set(key, (stats.get(key) ?? 0) + 1)
    })
    const entries = Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
    return { total: qs.length, entries }
  }, [previewExam])

  const fetchBank = useCallback(() => {
    if (!bankOpen) return
    setBankLoading(true)
    getQuestionBank({
      page: bankPage,
      limit: bankLimit,
      subjectId: bankSubjectId,
      topic: bankTopic.trim() || undefined,
      bloom_level: bankBloom,
      is_ai_generated: bankIsAi,
      search: bankSearch.trim() || undefined,
    })
      .then((res) => {
        setBankRows(res.data?.questions ?? [])
        setBankTotal(res.data?.pagination?.total ?? 0)
      })
      .catch((err) => message.error(err?.message ?? 'Không tải được ngân hàng câu hỏi'))
      .finally(() => setBankLoading(false))
  }, [bankOpen, bankPage, bankLimit, bankSubjectId, bankTopic, bankBloom, bankIsAi, bankSearch])

  useEffect(() => {
    fetchBank()
  }, [fetchBank])

  const bankColumns: ColumnsType<QuestionBankItem> = useMemo(
    () => [
      {
        title: 'Nội dung',
        key: 'content',
        render: (_, r) => (
          <div className="max-w-[520px]">
            <QuestionHtmlPreview
              html={(r.contentHtml || r.content_html || '') as string}
              lineClamp={2}
              className="text-sm text-slate-800 dark:text-slate-200"
            />
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {r.subject?.code && <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{r.subject.code}</span>}
              {r.topic && <span>topic: {r.topic}</span>}
              {(r.bloomLevel || r.bloom_level) && <span>mức độ: {r.bloomLevel || r.bloom_level}</span>}
              {typeof (r.isAiGenerated ?? r.is_ai_generated) === 'boolean' && (
                <span>{(r.isAiGenerated ?? r.is_ai_generated) ? 'AI' : 'Bank'}</span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Đáp án',
        key: 'correct',
        width: 90,
        render: (_, r) => (
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {r.correctAnswer || r.correct_answer || '—'}
          </span>
        ),
      },
      {
        title: 'Người tạo',
        key: 'createdBy',
        width: 140,
        render: (_, r) => <span className="text-slate-600 dark:text-slate-300">{r.createdBy?.fullName ?? '—'}</span>,
      },
    ],
    []
  )

  const addManualQuestion = () => {
    const newQ: PreviewQuestion = {
      id: `new-${Date.now()}`,
      contentHtml: '',
      explanationHtml: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: '',
      level: 'nhan_biet',
    }
    setPreviewExam((prev) => {
      if (!prev) return prev
      return { ...prev, questions: [...prev.questions, newQ] }
    })
    setEditingQuestionId(newQ.id)
    setDraftQuestion(newQ)
  }

  const addFromBank = () => {
    const selected = new Set(bankSelectedIds.map(String))
    const picked = bankRows.filter((r) => selected.has(String(r.id)))
    if (!picked.length) {
      message.warning('Chọn ít nhất 1 câu hỏi.')
      return
    }
    setPreviewExam((prev) => {
      if (!prev) return prev
      const existing = new Set(prev.questions.map((q) => q.id))
      const mapped: PreviewQuestion[] = picked.map((r) => ({
        id: `bank-${r.id}`,
        contentHtml: (r.contentHtml || r.content_html || '').toString(),
        explanationHtml: (r.explanationHtml || r.explanation_html || '')?.toString?.() ?? '',
        options: {
          A: r.options?.A ?? '',
          B: r.options?.B ?? '',
          C: r.options?.C ?? '',
          D: r.options?.D ?? '',
        },
        correctAnswer: normalizeCorrect(r.correctAnswer || r.correct_answer),
        level: normalizeLevel(r.bloomLevel || r.bloom_level),
      }))
      const unique = mapped.filter((q) => !existing.has(q.id))
      return { ...prev, questions: [...prev.questions, ...unique] }
    })
    message.success('Đã thêm câu hỏi từ ngân hàng.')
    setBankOpen(false)
    setBankSelectedIds([])
  }

  const handleSaveExam = async () => {
    if (!previewExam) return
    const title = (previewExam.title || '').trim()
    if (!title) {
      message.error('Vui lòng nhập tiêu đề đề thi.')
      return
    }
    const sid = previewExam.subjectId ?? subjectId
    if (!sid) {
      message.error('Vui lòng chọn môn học (subject_id).')
      return
    }
    try {
      setSaving(true)
      await saveGeneratedExam({
        exam: {
          title,
          subject_id: sid,
          duration_minutes: Number(previewExam.durationMinutes) || 60,
          description: (previewExam.description || '').trim(),
        },
        questions: previewExam.questions.map((q, i) => ({
          order_number: i + 1,
          content_html: q.contentHtml,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation_html: q.explanationHtml || null,
          bloom_level: q.level,
        })),
      })
      notification.success({
        message: 'Thành công',
        description: 'Đã lưu đề thi. Đang chuyển sang danh sách đề...',
        placement: 'topRight',
        duration: 1.2,
      })
      navigate('/lecture/exams')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lưu đề thi thất bại')
    } finally {
      setSaving(false)
    }
  }

  const fetchSubjects = useCallback(() => {
    if (!teacherId) return
    setSubjectsLoading(true)
    getTeacherSubjectsFromAiBackend(teacherId)
      .then((res) => {
        const list = res.data?.subjects ?? []
        setSubjects(list)
        if (!subjectId && list.length > 0) setSubjectId(list[0].id)
      })
      .catch((err) => {
        message.error(err?.message ?? 'Không tải được danh sách môn học')
      })
      .finally(() => setSubjectsLoading(false))
  }, [teacherId, subjectId])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const canSubmit = !!teacherId && !!subjectId && requestText.trim().length >= 10 && !submitting

  const handleSubmit = async () => {
    if (!teacherId) {
      message.error('Vui lòng đăng nhập với tài khoản giáo viên.')
      return
    }
    if (!subjectId) {
      message.error('Vui lòng chọn môn học.')
      return
    }
    const req = requestText.trim()
    if (req.length < 10) {
      message.warning('Yêu cầu đề thi cần chi tiết hơn (ít nhất 10 ký tự).')
      return
    }

    try {
      setSubmitting(true)
      setResult(null)
      setPreviewExam(null)
      setEditingQuestionId(null)
      setDraftQuestion(null)
      const res = await generateExamWithAi({ request: req, subjectId })
      setResult(res)
      const parsed = tryParseExamFromResult(res)
      if (parsed && !parsed.subjectId) parsed.subjectId = subjectId
      setPreviewExam(parsed)
      message.success('AI đã xử lý xong yêu cầu.')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Tạo đề với AI thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (!teacherId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-slate-500">Vui lòng đăng nhập với tài khoản giáo viên.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="ai-support" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Tạo đề với AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập yêu cầu và chọn môn để AI tạo đề.
              </p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="AI Generate Exam"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Teacher"
        />

        <div className="mx-auto w-full max-w-[1200px] flex-1 space-y-6 p-8">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thông tin yêu cầu
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  AI sẽ dựa trên mô tả để tạo đề. Bạn nên ghi rõ số câu, thời gian, mức độ, chủ đề.
                </p>

                <div className="mt-5 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Môn học
                    </label>
                    <Select
                      value={subjectId ?? undefined}
                      onChange={(v) => setSubjectId(v)}
                      options={subjectOptions}
                      loading={subjectsLoading}
                      className="w-full [&_.ant-select-selector]:rounded-xl"
                      placeholder="Chọn môn học"
                      showSearch
                      optionFilterProp="label"
                      allowClear
                    />
                    <div className="mt-2">
                      <Button
                        type="text"
                        size="small"
                        onClick={fetchSubjects}
                        className="!px-0 !text-slate-500 hover:!text-slate-800 dark:hover:!text-slate-200"
                        icon={<span className="material-symbols-outlined text-lg">refresh</span>}
                      >
                        Tải lại danh sách môn
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Yêu cầu đề thi
                    </label>
                    <textarea
                      rows={7}
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      placeholder="Ví dụ: Tạo đề thi Vật Lý 12 minh họa kỳ thi tốt nghiệp THPT, 40 câu, 60 phút"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800/40"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Gợi ý: “môn + khối/lớp + số câu + thời gian + mức độ + phân bổ chủ đề”.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {submitting ? 'hourglass_top' : 'auto_awesome'}
                    </span>
                    {submitting ? 'Đang tạo đề...' : 'Tạo đề với AI'}
                  </button>
                </div>
              </div>

            </div>

            <div className="lg:col-span-3">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Kết quả trả về
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Xem trước đề, chỉnh sửa / thêm / xóa từng câu.
                    </p>
                  </div>
                  {previewExam && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Thống kê theo mức độ:
                      </span>
                      {levelStats.entries.map(([lvl, count]) => (
                        <Tag key={lvl} color={levelColor(lvl)} className="rounded-full">
                          {lvl}: {count}
                        </Tag>
                      ))}
                      <Tag className="rounded-full">Tổng: {levelStats.total}</Tag>
                    </div>
                  )}
                </div>

                {previewExam ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/30">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Tiêu đề
                          </span>
                          <Input
                            value={previewExam.title}
                            onChange={(e) => setPreviewExam((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                            className="max-w-[640px] rounded-xl"
                            placeholder="Nhập tiêu đề đề thi"
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {previewExam.durationMinutes} phút • {previewExam.questions.length} câu
                          </span>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Mô tả
                          </div>
                          <Input.TextArea
                            value={previewExam.description}
                            onChange={(e) => setPreviewExam((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                            rows={3}
                            className="rounded-xl"
                            placeholder="Mô tả đề thi (mặc định lấy từ AI, có thể chỉnh sửa)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {previewExam.questions.map((q, idx) => {
                        const isEditing = editingQuestionId === q.id && !!draftQuestion
                        const view = isEditing ? (draftQuestion as PreviewQuestion) : q
                        return (
                          <div
                            key={q.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    Câu {idx + 1}
                                  </span>
                                  <Tag color={levelColor(view.level)} className="rounded-full">
                                    Mức độ: {view.level || 'Chưa gán'}
                                  </Tag>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    • {view.correctAnswer ? `Đáp án: ${view.correctAnswer}` : 'Chưa chọn đáp án'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {!isEditing && (
                                  <>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setEditingQuestionId(q.id)
                                        setDraftQuestion({ ...q, options: { ...q.options } })
                                      }}
                                      className="rounded-lg"
                                      icon={<span className="material-symbols-outlined text-base">edit</span>}
                                    >
                                      Sửa
                                    </Button>
                                    <Popconfirm
                                      title="Xóa câu hỏi này?"
                                      description="Thao tác này chỉ xóa trong bản xem trước (chưa gửi lên server)."
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      okButtonProps={{ danger: true }}
                                      onConfirm={() => {
                                        setPreviewExam((prev) => {
                                          if (!prev) return prev
                                          return { ...prev, questions: prev.questions.filter((x) => x.id !== q.id) }
                                        })
                                        if (editingQuestionId === q.id) {
                                          setEditingQuestionId(null)
                                          setDraftQuestion(null)
                                        }
                                        message.success('Đã xóa câu hỏi khỏi bản xem trước.')
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        danger
                                        className="rounded-lg"
                                        icon={<span className="material-symbols-outlined text-base">delete</span>}
                                      >
                                        Xóa
                                      </Button>
                                    </Popconfirm>
                                  </>
                                )}
                                {isEditing && (
                                  <>
                                    <Button
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        if (!draftQuestion) return
                                        setPreviewExam((prev) => {
                                          if (!prev) return prev
                                          return {
                                            ...prev,
                                            questions: prev.questions.map((x) => (x.id === q.id ? draftQuestion : x)),
                                          }
                                        })
                                        setEditingQuestionId(null)
                                        setDraftQuestion(null)
                                        message.success('Đã lưu chỉnh sửa câu hỏi.')
                                      }}
                                      className="rounded-lg"
                                      icon={<span className="material-symbols-outlined text-base">save</span>}
                                    >
                                      Lưu
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setEditingQuestionId(null)
                                        setDraftQuestion(null)
                                      }}
                                      className="rounded-lg"
                                    >
                                      Hủy
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Nội dung
                                </div>
                                {isEditing ? (
                                  <Input.TextArea
                                    value={view.contentHtml}
                                    onChange={(e) =>
                                      setDraftQuestion((prev) => (prev ? { ...prev, contentHtml: e.target.value } : prev))
                                    }
                                    rows={3}
                                    className="rounded-xl"
                                  />
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                                    {view.contentHtml ? (
                                      <HtmlWithMath className="prose prose-sm max-w-none dark:prose-invert" html={view.contentHtml} />
                                    ) : (
                                      '—'
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {(['A', 'B', 'C', 'D'] as const).map((k) => (
                                  <div key={k} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Đáp án {k}
                                    </div>
                                    {isEditing ? (
                                      <Input.TextArea
                                        value={view.options[k]}
                                        onChange={(e) =>
                                          setDraftQuestion((prev) =>
                                            prev ? { ...prev, options: { ...prev.options, [k]: e.target.value } } : prev
                                          )
                                        }
                                        rows={2}
                                        className="rounded-lg"
                                      />
                                    ) : (
                                      <div
                                        className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200"
                                        dangerouslySetInnerHTML={{
                                          __html: decorateMathInHtml(String(view.options[k] || '—')),
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Đáp án đúng
                                  </div>
                                  {isEditing ? (
                                    <Select
                                      value={view.correctAnswer || undefined}
                                      onChange={(v) =>
                                        setDraftQuestion((prev) => (prev ? { ...prev, correctAnswer: v } : prev))
                                      }
                                      options={[
                                        { value: 'A', label: 'A' },
                                        { value: 'B', label: 'B' },
                                        { value: 'C', label: 'C' },
                                        { value: 'D', label: 'D' },
                                      ]}
                                      className="w-full [&_.ant-select-selector]:rounded-xl"
                                      placeholder="Chọn đáp án đúng"
                                      allowClear
                                    />
                                  ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                                      {view.correctAnswer || '—'}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Mức độ
                                  </div>
                                  {isEditing ? (
                                    <Input
                                      value={view.level}
                                      onChange={(e) =>
                                        setDraftQuestion((prev) => (prev ? { ...prev, level: e.target.value } : prev))
                                      }
                                      placeholder="Ví dụ: nhan_biet / thong_hieu / van_dung / van_dung_cao"
                                      className="rounded-xl"
                                    />
                                  ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                                      {view.level || 'Chưa gán'}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Giải thích (nếu có)
                                </div>
                                {isEditing ? (
                                  <Input.TextArea
                                    value={view.explanationHtml}
                                    onChange={(e) =>
                                      setDraftQuestion((prev) => (prev ? { ...prev, explanationHtml: e.target.value } : prev))
                                    }
                                    rows={3}
                                    className="rounded-xl"
                                    placeholder="Nhập explanation_html (có thể là HTML) ..."
                                  />
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                                    {view.explanationHtml ? (
                                      <HtmlWithMath
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        html={view.explanationHtml}
                                      />
                                    ) : (
                                      '—'
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-2">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={addManualQuestion}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <span className="material-symbols-outlined">add_circle</span>
                          Thêm câu hỏi mới
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBankOpen(true)
                            setBankPage(1)
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <span className="material-symbols-outlined">database</span>
                          Lấy từ ngân hàng
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleSaveExam}
                        disabled={saving || (previewExam.questions?.length ?? 0) === 0}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {saving ? 'hourglass_top' : 'save'}
                        </span>
                        {saving ? 'Đang lưu đề...' : 'Lưu đề'}
                      </button>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Lưu sẽ gọi API <span className="font-mono">POST /api/ai/save-generated-exam</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30">
                    <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                      {result ? JSON.stringify(result, null, 2) : 'Chưa có dữ liệu. Hãy nhập yêu cầu và bấm “Tạo đề với AI”.'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Modal
            title="Ngân hàng câu hỏi"
            open={bankOpen}
            onCancel={() => {
              setBankOpen(false)
              setBankSelectedIds([])
            }}
            onOk={addFromBank}
            okText="Thêm vào đề"
            cancelText="Đóng"
            width={980}
            destroyOnHidden
          >
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Môn học</div>
                <Select
                  value={bankSubjectId}
                  onChange={(v) => {
                    setBankSubjectId(v)
                    setBankPage(1)
                  }}
                  options={subjectOptions.map((o) => ({ value: o.value, label: o.label }))}
                  allowClear
                  placeholder="subjectId"
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Topic</div>
                <Input
                  value={bankTopic}
                  onChange={(e) => setBankTopic(e.target.value)}
                  placeholder="topic"
                  className="rounded-xl"
                  onPressEnter={() => setBankPage(1)}
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Mức độ</div>
                <Select
                  value={bankBloom}
                  onChange={(v) => {
                    setBankBloom(v)
                    setBankPage(1)
                  }}
                  allowClear
                  placeholder="bloom_level"
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                  options={[
                    { value: 'nhan_biet', label: 'nhan_biet' },
                    { value: 'thong_hieu', label: 'thong_hieu' },
                    { value: 'van_dung', label: 'van_dung' },
                    { value: 'van_dung_cao', label: 'van_dung_cao' },
                  ]}
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">AI generated</div>
                <Select
                  value={bankIsAi as unknown as string | undefined}
                  onChange={(v) => {
                    if (v === undefined) setBankIsAi(undefined)
                    else setBankIsAi(v === 'true')
                    setBankPage(1)
                  }}
                  allowClear
                  placeholder="is_ai_generated"
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                  options={[
                    { value: 'true', label: 'true' },
                    { value: 'false', label: 'false' },
                  ]}
                />
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tìm kiếm</div>
                <Input
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="search"
                  className="rounded-xl"
                  onPressEnter={() => setBankPage(1)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => {
                    setBankPage(1)
                    fetchBank()
                  }}
                  icon={<span className="material-symbols-outlined">search</span>}
                  className="rounded-xl"
                >
                  Lọc
                </Button>
                <Button
                  type="text"
                  onClick={() => {
                    setBankSubjectId(undefined)
                    setBankTopic('')
                    setBankBloom(undefined)
                    setBankIsAi(undefined)
                    setBankSearch('')
                    setBankPage(1)
                  }}
                  className="rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            <Table<QuestionBankItem>
              rowKey="id"
              columns={bankColumns}
              dataSource={bankRows}
              loading={bankLoading}
              pagination={{
                current: bankPage,
                pageSize: bankLimit,
                total: bankTotal,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                onChange: (p, ps) => {
                  setBankPage(p)
                  if (ps !== bankLimit) {
                    setBankLimit(ps)
                    setBankPage(1)
                  }
                },
              }}
              rowSelection={{
                selectedRowKeys: bankSelectedIds,
                onChange: (keys) => setBankSelectedIds(keys),
              }}
              size="middle"
              scroll={{ x: 900, y: 420 }}
              locale={{ emptyText: 'Không có câu hỏi phù hợp.' }}
            />
          </Modal>
        </div>
      </main>
    </div>
  )
}

