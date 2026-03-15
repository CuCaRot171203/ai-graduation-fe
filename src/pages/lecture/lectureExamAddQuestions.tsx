import { useCallback, useEffect, useState } from 'react'
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
  getExamQuestions,
  type ExcelTemplate,
  type ExamQuestion,
} from '../../apis/examsApi'
import type { LoginUser } from '../../apis/authApi'

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALND6k2_wy0lcBZ1j7RmE8Do8IuT--SRJy0g-QEcbRwoRxGEFeGYXr8MVBf99ndf82s3AlqodutH8JIxd8TSx2oeBeNhd5cDAB2D6aCcknWAHXZJGJTWR3UO0sHznK4YPny6riiqomREFPRtOkevZx6eCPg64U5knKp4EYqR-gYZ-IBR7DMpVvxiCcbTMIlwH2qyFVIwOcnsSN2Fdsse0tsXpWiN21AJPxcBwx7JmDwmMgaB3hknDCsier31MNE2OUTyzbrIaSNmNt'

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

  const fetchExamQuestions = useCallback(() => {
    if (!examIdNum) return
    setLoadingQuestions(true)
    getExamQuestions(examIdNum, { page: 1, limit: 100 })
      .then((res) => setExamQuestions(res.data?.questions ?? []))
      .catch(() => setExamQuestions([]))
      .finally(() => setLoadingQuestions(false))
  }, [examIdNum])

  useEffect(() => {
    if (!examIdNum) return
    let cancelled = false
    const tid = setTimeout(() => { if (!cancelled) setLoadingQuestions(true) }, 0)
    getExamQuestions(examIdNum, { page: 1, limit: 100 })
      .then((res) => { if (!cancelled) setExamQuestions(res.data?.questions ?? []) })
      .catch(() => { if (!cancelled) setExamQuestions([]) })
      .finally(() => { if (!cancelled) setLoadingQuestions(false) })
    return () => { cancelled = true; clearTimeout(tid) }
  }, [examIdNum])

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
          searchPlaceholder="Tìm kiếm..."
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

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
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
                      style: { cursor: 'pointer' },
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
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
                <Table
                  rowKey={(r) => String((r as ExamQuestion).id ?? examQuestions.indexOf(r as ExamQuestion))}
                  loading={loadingQuestions}
                  dataSource={examQuestions}
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
                      return (
                        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                            <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                            {content}
                          </p>
                          <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            {letters.map((letter) => {
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
                          <p className="mt-2 text-xs text-slate-500">
                            Bloom: {(record.bloomLevel ?? record.bloom_level) ?? '—'} · Topic: {formatTopic(record.topic as string)}
                          </p>
                        </div>
                      )
                    },
                  }}
                  onRow={(record, index) => ({
                    onClick: () => {
                      const key = String((record as ExamQuestion).id ?? index ?? examQuestions.indexOf(record as ExamQuestion))
                      setExpandedExamQuestionKeys((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    },
                    style: { cursor: 'pointer' },
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
              <Button type="primary" size="large" icon={<span className="material-symbols-outlined">check_circle</span>} onClick={() => navigate('/lecture/exams')}>
                Xác nhận và quay lại danh sách đề
              </Button>
            </div>
          </div>
        </div>
      </main>

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
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-primary transition-all" style={{ width: `${aiScanProgress}%` }} />
                  </div>
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
