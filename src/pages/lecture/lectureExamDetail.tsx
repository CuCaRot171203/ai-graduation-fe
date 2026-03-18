import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getExamById, getExamQuestions, submitExam, updateExam, type Exam, type ExamQuestion } from '../../apis/examsApi'
import { deleteAiQuestion, updateAiQuestion } from '../../apis/aiExamApi'
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

function stripHtml(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || '—'
}

function stripHtmlFull(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  approved: { color: 'green', label: 'Đã duyệt' },
  Approved: { color: 'green', label: 'Đã duyệt' },
  pending: { color: 'gold', label: 'Chờ duyệt' },
  Pending: { color: 'gold', label: 'Chờ duyệt' },
  draft: { color: 'default', label: 'Nháp' },
  Draft: { color: 'default', label: 'Nháp' },
  rejected: { color: 'red', label: 'Từ chối' },
  Rejected: { color: 'red', label: 'Từ chối' },
}

function renderStatus(status: string | undefined) {
  if (!status) return <Tag>—</Tag>
  const config = STATUS_TAG[status] ?? { color: 'default', label: status }
  return <Tag color={config.color}>{config.label}</Tag>
}

export default function LectureExamDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const examId = Number(params.examId)

  const [exam, setExam] = useState<Exam | null>(null)
  const [examLoading, setExamLoading] = useState(true)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm] = Form.useForm<{ title: string; description?: string; durationMinutes: number }>()

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<ExamQuestion> | null>(null)
  const [confirming, setConfirming] = useState(false)

  const fetchAll = useCallback(() => {
    if (!Number.isFinite(examId)) return
    setExamLoading(true)
    setQuestionsLoading(true)
    setExam(null)
    setQuestions([])

    getExamById(examId)
      .then((res) => {
        const e = res.data
        setExam(e)
        const embedded = (e as { questions?: ExamQuestion[] }).questions
        if (Array.isArray(embedded) && embedded.length >= 0) {
          setQuestions(embedded)
          setQuestionsLoading(false)
          return
        }
        return getExamQuestions(examId, { page: 1, limit: 200 })
          .then((qRes) => {
            const raw = qRes.data as { questions?: ExamQuestion[]; items?: ExamQuestion[] } | undefined
            const list = raw?.questions ?? raw?.items ?? []
            setQuestions(Array.isArray(list) ? list : [])
          })
          .finally(() => setQuestionsLoading(false))
      })
      .catch((err) => {
        message.error(err?.message ?? 'Không tải được chi tiết đề thi')
        setQuestionsLoading(false)
      })
      .finally(() => setExamLoading(false))
  }, [examId])

  const openEdit = () => {
    if (!exam) return
    editForm.setFieldsValue({
      title: (exam.title ?? exam.name ?? '').toString(),
      description: ((exam as { description?: string }).description ?? '').toString(),
      durationMinutes: ((exam as { durationMinutes?: number }).durationMinutes ?? 60) as number,
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields()
      setEditSaving(true)
      await updateExam(examId, {
        title: values.title,
        description: values.description,
        durationMinutes: values.durationMinutes,
      })
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật đề thi.',
        placement: 'topRight',
        duration: 1.2,
      })
      setEditOpen(false)
      fetchAll()
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error(err instanceof Error ? err.message : 'Cập nhật đề thi thất bại')
    } finally {
      setEditSaving(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const examStatus = (exam?.status ?? '') as string
  const canModify = ['draft', 'pending'].includes(examStatus.toLowerCase())

  const startEditQuestion = (q: ExamQuestion) => {
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
    })
  }

  const cancelEditQuestion = () => {
    setEditingQuestionId(null)
    setEditDraft(null)
  }

  const saveEditQuestion = async () => {
    if (!editingQuestionId || !editDraft) return
    try {
      const options = (editDraft.options ?? {}) as Record<string, string>
      await updateAiQuestion(editingQuestionId, {
        content_html: (editDraft.contentHtml ?? '') as string,
        options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
        question_type: ((editDraft as { questionType?: string }).questionType ?? 'trac_nghiem') as string,
        topic: (editDraft.topic ?? '') as string,
        bloom_level: ((editDraft as { bloomLevel?: string }).bloomLevel ?? '') as string,
        correct_answer: ((editDraft as { correctAnswer?: string }).correctAnswer ?? '') as string,
        explanation_html: ((editDraft as { explanationHtml?: string }).explanationHtml ?? '') as string,
      })
      message.success('Đã cập nhật câu hỏi.')
      setQuestions((prev) =>
        prev.map((q) => {
          if ((q as { id?: number }).id !== editingQuestionId) return q
          return {
            ...q,
            contentHtml: (editDraft.contentHtml ?? '') as string,
            options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
            correctAnswer: ((editDraft as { correctAnswer?: string }).correctAnswer ?? '') as string,
            bloomLevel: ((editDraft as { bloomLevel?: string }).bloomLevel ?? '') as string,
            topic: (editDraft.topic ?? '') as string,
            explanationHtml: ((editDraft as { explanationHtml?: string }).explanationHtml ?? '') as string,
          } as ExamQuestion
        })
      )
      cancelEditQuestion()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Cập nhật câu hỏi thất bại')
    }
  }

  const questionColumns: ColumnsType<ExamQuestion> = useMemo(
    () => [
      { title: 'STT', key: 'stt', width: 56, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
      {
        title: 'Nội dung',
        key: 'content',
        ellipsis: true,
        render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string),
      },
      {
        title: 'Đáp án',
        key: 'correct',
        width: 86,
        render: (_: unknown, r: ExamQuestion) => (r.correctAnswer ?? r.correct_answer) ?? '—',
      },
      {
        title: 'Mức độ',
        key: 'bloom',
        width: 120,
        render: (_: unknown, r: ExamQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—',
      },
      {
        title: 'Topic',
        key: 'topic',
        width: 140,
        render: (_: unknown, r: ExamQuestion) => (r.topic as string) ?? '—',
      },
    ],
    []
  )

  if (!Number.isFinite(examId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-slate-500">ExamId không hợp lệ.</p>
      </div>
    )
  }

  const title = exam?.title ?? exam?.name ?? `Đề #${examId}`
  const description = (exam as { description?: string } | null)?.description
  const duration = (exam as { durationMinutes?: number } | null)?.durationMinutes
  const totalQ = exam?.totalQuestions ?? exam?.questionCount ?? questions.length

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="exams" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Chi tiết đề thi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xem thông tin đề và danh sách câu hỏi.
              </p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Quản lý đề"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="text"
                className="inline-flex items-center gap-2 text-slate-600 hover:!text-slate-900 dark:text-slate-400 dark:hover:!text-white [&_.ant-btn-icon]:flex [&_.ant-btn-icon]:items-center"
                icon={<span className="material-symbols-outlined text-xl leading-none">arrow_back</span>}
                onClick={() => navigate('/lecture/exams')}
              >
                Quay lại danh sách
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  icon={<span className="material-symbols-outlined">refresh</span>}
                  onClick={() => {
                    setExpandedKeys([])
                    cancelEditQuestion()
                    fetchAll()
                  }}
                >
                  Làm mới
                </Button>
                <Button
                  onClick={openEdit}
                  disabled={!exam || examLoading || !canModify}
                  icon={<span className="material-symbols-outlined">edit</span>}
                >
                  Sửa đề
                </Button>
                <Button
                  type="primary"
                  icon={<span className="material-symbols-outlined">add_circle</span>}
                  onClick={() => navigate(`/lecture/exams/${examId}/add-questions`)}
                  disabled={!canModify}
                >
                  Thêm câu hỏi
                </Button>
                <Button
                  icon={<span className="material-symbols-outlined">task_alt</span>}
                  disabled={!exam || examLoading || !canModify || confirming || examStatus.toLowerCase() !== 'draft'}
                  loading={confirming}
                  onClick={async () => {
                    try {
                      setConfirming(true)
                      await submitExam(examId)
                      notification.success({
                        message: 'Thành công',
                        description: 'Đã xác nhận và gửi đề thi chờ duyệt.',
                        placement: 'topRight',
                        duration: 1.2,
                      })
                      fetchAll()
                    } catch (err) {
                      message.error(err instanceof Error ? err.message : 'Xác nhận đề thất bại')
                    } finally {
                      setConfirming(false)
                    }
                  }}
                >
                  Xác nhận đề
                </Button>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {examLoading ? (
                <div className="py-6 text-center text-slate-500">Đang tải thông tin đề...</div>
              ) : exam ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {title}
                    </h1>
                    {renderStatus(exam.status)}
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Mã đề:</span> {exam.code ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Môn học:</span> {exam.subject?.name ?? exam.subject?.code ?? (exam.subjectId ? `#${exam.subjectId}` : '—')}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Số câu:</span> {totalQ ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Thời gian:</span> {duration != null ? `${duration} phút` : '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Ngày tạo:</span> {exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Cập nhật:</span> {exam.updatedAt ? new Date(exam.updatedAt).toLocaleString('vi-VN') : '—'}</p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-500">Mô tả: </span>
                    {description ?? '—'}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500">Không có dữ liệu.</div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Danh sách câu hỏi
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tổng: {questions.length}
                  </span>
                </div>
              </div>
              <Table<ExamQuestion>
                columns={questionColumns}
                dataSource={questions.map((q, i) => ({ ...q, key: (q.id ?? `q-${i}`) as unknown as string }))}
                loading={questionsLoading}
                pagination={false}
                rowKey={(r, i) => String(r.id ?? `q-${i}`)}
                expandable={{
                  expandedRowKeys: expandedKeys,
                  onExpand: (expanded, record) => {
                    const keyStr = String(record.id ?? `q-${questions.indexOf(record)}`)
                    setExpandedKeys((prev) => (expanded ? [...prev, keyStr] : prev.filter((k) => k !== keyStr)))
                  },
                  expandedRowRender: (record: ExamQuestion) => {
                    const content = stripHtmlFull((record.contentHtml ?? record.content_html) as string)
                    const options = (record.options ?? {}) as Record<string, string>
                    const correct = (record.correctAnswer ?? record.correct_answer) as string
                    const explanation = (record.explanationHtml ?? record.explanation_html) as string | undefined
                    const letters = ['A', 'B', 'C', 'D']
                    const id = (record as { id?: number }).id
                    const isEditing = !!id && editingQuestionId === id
                    const draft = isEditing ? (editDraft as ExamQuestion) : record
                    const draftOptions = ((draft.options ?? {}) as Record<string, string>) ?? {}
                    const draftCorrect = (draft.correctAnswer ?? (draft as { correct_answer?: string }).correct_answer) as string
                    return (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                        {canModify && id ? (
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs text-slate-500">
                              Mức độ: {(draft.bloomLevel ?? (draft as { bloom_level?: string }).bloom_level) ?? '—'} · Topic:{' '}
                              {(draft.topic as string) ?? '—'}
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <Button size="small" onClick={cancelEditQuestion}>
                                    Hủy
                                  </Button>
                                  <Button size="small" type="primary" onClick={saveEditQuestion}>
                                    Lưu
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="small"
                                    icon={<span className="material-symbols-outlined text-lg">edit</span>}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      startEditQuestion(record)
                                    }}
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    size="small"
                                    danger
                                    icon={<span className="material-symbols-outlined text-lg">delete</span>}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      Modal.confirm({
                                        title: 'Xóa câu hỏi',
                                        content: 'Bạn có chắc muốn xóa câu hỏi này?',
                                        okText: 'Xóa',
                                        okType: 'danger',
                                        cancelText: 'Hủy',
                                        onOk: async () => {
                                          await deleteAiQuestion(id)
                                          message.success('Đã xóa câu hỏi.')
                                          setQuestions((prev) => prev.filter((q) => (q as { id?: number }).id !== id))
                                          setExpandedKeys((prev) => prev.filter((k) => String(k) !== String(id)))
                                          if (editingQuestionId === id) cancelEditQuestion()
                                        },
                                      })
                                    }}
                                  >
                                    Xóa
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : null}

                        <p className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                          <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                          {isEditing ? (
                            <Input.TextArea
                              rows={3}
                              value={(draft.contentHtml ?? '') as string}
                              onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), contentHtml: e.target.value }))}
                            />
                          ) : (
                            content
                          )}
                        </p>
                        <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                        {isEditing ? (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {letters.map((letter) => (
                              <div key={letter} className="flex items-center gap-2">
                                <span className="w-6 text-sm font-semibold text-slate-600">{letter}.</span>
                                <Input
                                  value={draftOptions[letter] ?? ''}
                                  onChange={(e) =>
                                    setEditDraft((d) => ({
                                      ...(d ?? {}),
                                      options: { ...(((d?.options ?? {}) as Record<string, string>) ?? {}), [letter]: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
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
                        )}

                        {isEditing ? (
                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                              <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án đúng</div>
                              <Select
                                value={(draftCorrect ?? '') as string}
                                onChange={(v) => setEditDraft((d) => ({ ...(d ?? {}), correctAnswer: v }))}
                                options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                              />
                            </div>
                            <div>
                              <div className="mb-1 text-xs font-semibold text-slate-500">Mức độ</div>
                              <Input
                                value={((draft as { bloomLevel?: string }).bloomLevel ?? '') as string}
                                onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), bloomLevel: e.target.value }))}
                                placeholder="VD: van_dung"
                              />
                            </div>
                            <div>
                              <div className="mb-1 text-xs font-semibold text-slate-500">Topic</div>
                              <Input
                                value={((draft.topic as string) ?? '') as string}
                                onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), topic: e.target.value }))}
                                placeholder="VD: dao_dong_co"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500">
                            Mức độ: {(record.bloomLevel ?? record.bloom_level) ?? '—'} · Topic: {(record.topic as string) ?? '—'}
                          </p>
                        )}
                        {explanation ? (
                          <div className="mt-3 rounded border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Lời giải
                            </p>
                            {isEditing ? (
                              <Input.TextArea
                                rows={3}
                                value={((draft.explanationHtml ?? (draft as { explanation_html?: string }).explanation_html) ?? '') as string}
                                onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), explanationHtml: e.target.value }))}
                              />
                            ) : (
                              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: explanation }} />
                            )}
                          </div>
                        ) : null}
                      </div>
                    )
                  },
                }}
                onRow={(record, index) => ({
                  onClick: () => {
                    const keyStr = String(record.id ?? `q-${index ?? 0}`)
                    setExpandedKeys((prev) => (prev.includes(keyStr) ? prev.filter((k) => k !== keyStr) : [...prev, keyStr]))
                  },
                })}
                rowClassName={() => 'cursor-pointer'}
                size="middle"
                locale={{ emptyText: 'Chưa có câu hỏi nào.' }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:px-4 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-4 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-700 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/80 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </section>

            <Modal
              title="Cập nhật đề thi"
              open={editOpen}
              onCancel={() => setEditOpen(false)}
              onOk={handleEditSubmit}
              okText="Lưu"
              cancelText="Hủy"
              confirmLoading={editSaving}
              width={520}
              destroyOnHidden
            >
              <Form form={editForm} layout="vertical" className="mt-4">
                <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Nhập tên đề thi' }]}>
                  <Input placeholder="Tên đề thi" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={3} placeholder="Mô tả" />
                </Form.Item>
                <Form.Item
                  name="durationMinutes"
                  label="Thời gian (phút)"
                  rules={[{ required: true, message: 'Nhập thời gian' }]}
                  initialValue={60}
                >
                  <InputNumber min={1} className="w-full" placeholder="60" />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </main>
    </div>
  )
}

