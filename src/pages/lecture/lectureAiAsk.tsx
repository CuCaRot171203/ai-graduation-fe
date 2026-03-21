import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { createAiQuestion, generateAiQuestion, getAiGenerationOptions, getTeacherSubjectsFromAiBackend, type AiGenerationOptions } from '../../apis/aiExamApi'
import type { LoginUser } from '../../apis/authApi'
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

function formatTopicVi(topic: string): string {
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
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type PreviewQuestion = {
  id?: number
  contentHtml?: string
  content_html?: string
  options?: Record<string, string>
  correctAnswer?: string
  correct_answer?: string
  explanationHtml?: string
  explanation_html?: string
  topic?: string
  bloomLevel?: string
  bloom_level?: string
  questionType?: string
  question_type?: string
}

export default function LectureAiAsk() {
  const user = getStoredUser()
  const navigate = useNavigate()
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [options, setOptions] = useState<AiGenerationOptions | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([])
  const [form] = Form.useForm()
  const [teacherSubjectsLoading, setTeacherSubjectsLoading] = useState(false)
  const [teacherSubjects, setTeacherSubjects] = useState<Array<{ id: number; code: string; name: string }>>([])
  const [acceptedQuestions, setAcceptedQuestions] = useState<PreviewQuestion[]>([])
  const [savingToBank, setSavingToBank] = useState(false)
  const [editingKey, setEditingKey] = useState<string | number | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<PreviewQuestion> | null>(null)
  const [editingTarget, setEditingTarget] = useState<'preview' | 'accepted' | null>(null)

  const suggestions = useMemo(
    () => [
      { subjectCode: 'PHYS12', topic: 'dao_dong_co', bloom: 'van_dung', type: 'trac_nghiem', count: 5 },
      { subjectCode: 'MATH12', topic: 'song_co', bloom: 'thong_hieu', type: 'trac_nghiem', count: 5 },
    ],
    []
  )

  const fetchOptions = useCallback(() => {
    setOptionsLoading(true)
    getAiGenerationOptions()
      .then((res) => setOptions(res.data))
      .catch((err) => message.error(err?.message ?? 'Không tải được generation options'))
      .finally(() => setOptionsLoading(false))
  }, [])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  const fetchTeacherSubjects = useCallback(() => {
    const teacherId = user?.id
    if (!teacherId) return
    setTeacherSubjectsLoading(true)
    getTeacherSubjectsFromAiBackend(teacherId)
      .then((res) => {
        const subs = res.data?.subjects ?? []
        setTeacherSubjects(subs.map((s) => ({ id: s.id, code: s.code, name: s.name })))
        // auto select if only one
        if (subs.length === 1) form.setFieldsValue({ subjectId: subs[0].id })
      })
      .catch((err) => message.error(err?.message ?? 'Không tải được môn đã đăng ký'))
      .finally(() => setTeacherSubjectsLoading(false))
  }, [user?.id, form])

  useEffect(() => {
    fetchTeacherSubjects()
  }, [fetchTeacherSubjects])

  const startEdit = useCallback((q: PreviewQuestion, key: string | number, target: 'preview' | 'accepted') => {
    setEditingKey(key)
    setEditingTarget(target)
    setEditDraft({
      contentHtml: (q.contentHtml ?? q.content_html ?? '') as string,
      options: (q.options ?? {}) as Record<string, string>,
      correctAnswer: (q.correctAnswer ?? q.correct_answer ?? '') as string,
      explanationHtml: (q.explanationHtml ?? q.explanation_html ?? '') as string,
      bloomLevel: (q.bloomLevel ?? q.bloom_level ?? '') as string,
      topic: (q.topic ?? '') as string,
      questionType: (q.questionType ?? q.question_type ?? 'trac_nghiem') as string,
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingKey(null)
    setEditingTarget(null)
    setEditDraft(null)
  }, [])

  const saveEdit = useCallback(() => {
    if (editingKey == null || !editDraft || !editingTarget) return
    const apply = (prev: PreviewQuestion[]) =>
      prev.map((q, i) => {
        const key = q.id ?? `q-${i}`
        if (String(key) !== String(editingKey)) return q
        const options = (editDraft.options ?? {}) as Record<string, string>
        return {
          ...q,
          contentHtml: (editDraft.contentHtml ?? '') as string,
          options: { A: options.A ?? '', B: options.B ?? '', C: options.C ?? '', D: options.D ?? '' },
          correctAnswer: (editDraft.correctAnswer ?? '') as string,
          explanationHtml: (editDraft.explanationHtml ?? '') as string,
          bloomLevel: (editDraft.bloomLevel ?? '') as string,
          topic: (editDraft.topic ?? '') as string,
          questionType: (editDraft.questionType ?? 'trac_nghiem') as string,
        }
      })

    if (editingTarget === 'preview') setPreviewQuestions(apply)
    if (editingTarget === 'accepted') setAcceptedQuestions(apply)
    message.success('Đã cập nhật câu hỏi.')
    cancelEdit()
  }, [editingKey, editDraft, editingTarget, cancelEdit])

  const makeColumns = useCallback(
    (target: 'preview' | 'accepted'): ColumnsType<PreviewQuestion> => [
      { title: 'STT', key: 'stt', width: 60, render: (_: unknown, __: PreviewQuestion, i: number) => i + 1 },
      {
        title: 'Nội dung',
        key: 'content',
        ellipsis: false,
        render: (_: unknown, r: PreviewQuestion) => (
          <QuestionHtmlPreview html={(r.contentHtml ?? r.content_html ?? '') as string} lineClamp={2} />
        ),
      },
      { title: 'Đáp án', key: 'correct', width: 100, render: (_: unknown, r: PreviewQuestion) => (r.correctAnswer ?? r.correct_answer) ?? '—' },
      { title: 'Mức độ khó', key: 'bloom', width: 130, render: (_: unknown, r: PreviewQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—' },
      { title: 'Topic', key: 'topic', width: 160, render: (_: unknown, r: PreviewQuestion) => formatTopicVi((r.topic as string) ?? '') },
      {
        title: 'Hành động',
        key: 'action',
        width: 170,
        render: (_: unknown, r: PreviewQuestion, idx: number) => {
          const key = r.id ?? `q-${idx}`
          const isEditing = String(editingKey) === String(key) && editingTarget === target
          return (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="small" onClick={cancelEdit}>
                    Hủy
                  </Button>
                  <Button size="small" type="primary" onClick={saveEdit}>
                    Lưu
                  </Button>
                </>
              ) : (
                <>
                  <Button size="small" onClick={() => startEdit(r, key, target)} icon={<span className="material-symbols-outlined text-lg">edit</span>}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      cancelEdit()
                      if (target === 'preview') setPreviewQuestions((prev) => prev.filter((_, i) => i !== idx))
                      if (target === 'accepted') setAcceptedQuestions((prev) => prev.filter((_, i) => i !== idx))
                    }}
                    icon={<span className="material-symbols-outlined text-lg">delete</span>}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [editingKey, editingTarget, startEdit, cancelEdit, saveEdit]
  )

  const previewColumns = useMemo(() => makeColumns('preview'), [makeColumns])
  const acceptedColumns = useMemo(() => makeColumns('accepted'), [makeColumns])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="ai-support" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Hỏi AI (Sinh câu hỏi)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tạo câu hỏi bằng AI qua API generate-question.
              </p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="AI"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Teacher"
        />

        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 p-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">Sinh câu hỏi</div>
                  <div className="text-xs text-slate-500">Dùng `generation-options` + `generate-question`.</div>
                </div>
                <Button icon={<span className="material-symbols-outlined">refresh</span>} onClick={fetchOptions} loading={optionsLoading}>
                  Làm mới options
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Gợi ý nhanh</div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const subjectId = options?.subjects?.find((x) => x.code === s.subjectCode)?.id
                        form.setFieldsValue({
                          subjectId,
                          topic: s.topic,
                          bloomLevel: s.bloom,
                          questionType: s.type,
                          count: s.count,
                        })
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <div className="font-semibold">{s.subjectCode}</div>
                      <div className="text-xs text-slate-500">
                        {formatTopicVi(s.topic)} · {s.bloom} · {s.type} · {s.count} câu
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                initialValues={{ questionType: 'trac_nghiem', count: 5 }}
                onFinish={async (values) => {
                  const subjectId = Number(values.subjectId)
                  const topic = String(values.topic ?? '').trim()
                  const bloomLevel = String(values.bloomLevel ?? '').trim()
                  const questionType = String(values.questionType ?? '').trim()
                  const count = Number(values.count ?? 1)
                  if (!subjectId || !topic || !bloomLevel || !questionType || !count) {
                    message.error('Vui lòng nhập đủ thông tin.')
                    return
                  }
                  try {
                    setGenLoading(true)
                    const res = await generateAiQuestion({ subjectId, topic, bloomLevel, questionType, count })
                    const qs = (res.data?.questions ?? []) as unknown[]
                    setPreviewQuestions(Array.isArray(qs) ? (qs as PreviewQuestion[]) : [])
                    setPreviewOpen(true)
                    message.success(res.message ?? 'Tạo câu hỏi AI thành công.')
                  } catch (err) {
                    message.error(err instanceof Error ? err.message : 'Tạo câu hỏi AI thất bại')
                  } finally {
                    setGenLoading(false)
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Form.Item label="Môn học" name="subjectId" rules={[{ required: true, message: 'Chọn môn học' }]}>
                    <Select
                      loading={teacherSubjectsLoading}
                      placeholder="Chọn môn"
                      showSearch
                      optionFilterProp="label"
                      options={teacherSubjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                      onChange={() => form.setFieldsValue({ topic: undefined })}
                    />
                  </Form.Item>

                  <Form.Item label="Topic" name="topic" rules={[{ required: true, message: 'Chọn topic' }]}>
                    <Select
                      loading={optionsLoading}
                      placeholder="Chọn topic"
                      showSearch
                      optionFilterProp="label"
                      options={(() => {
                        const sid = Number(form.getFieldValue('subjectId'))
                        const subj = (options?.subjects ?? []).find((s) => s.id === sid)
                        const byTopic = subj?.questionStats?.byTopic ?? {}
                        const fromStats = Object.keys(byTopic)
                        const fromDefault = options?.defaultTopics ?? []
                        const unique = Array.from(new Set([...fromStats, ...fromDefault])).filter(Boolean)
                        return unique.map((t) => ({
                          value: t,
                          label: `${formatTopicVi(t)}${byTopic[t] != null ? ` (${byTopic[t]})` : ''}`,
                        }))
                      })()}
                    />
                  </Form.Item>

                  <Form.Item label="Mức độ khó" name="bloomLevel" rules={[{ required: true, message: 'Chọn mức độ' }]}>
                    <Select
                      loading={optionsLoading}
                      placeholder="Chọn mức độ"
                      options={(options?.bloomLevels ?? []).map((b) => ({
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
                      loading={optionsLoading}
                      placeholder="Chọn loại"
                      options={(options?.questionTypes ?? []).map((t) => ({ value: t.value, label: t.label }))}
                    />
                  </Form.Item>

                  <Form.Item label="Số lượng câu hỏi" name="count" rules={[{ required: true, message: 'Nhập số lượng' }]}>
                    <InputNumber min={1} max={50} className="w-full" placeholder="VD: 5" />
                  </Form.Item>
                </div>

                <div className="mt-2 flex justify-end">
                  <Button type="primary" htmlType="submit" loading={genLoading} icon={<span className="material-symbols-outlined">smart_toy</span>}>
                    Tạo câu hỏi
                  </Button>
                </div>
              </Form>

              {acceptedQuestions.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">Câu hỏi đã xác nhận</div>
                      <div className="text-xs text-slate-500">Sẵn sàng thêm vào ngân hàng câu hỏi.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setAcceptedQuestions([])
                          message.info('Đã hủy danh sách câu hỏi.')
                        }}
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        type="primary"
                        loading={savingToBank}
                        onClick={async () => {
                          const subjectId = Number(form.getFieldValue('subjectId'))
                          if (!subjectId) {
                            message.error('Vui lòng chọn môn học trước.')
                            return
                          }
                          try {
                            setSavingToBank(true)
                            await Promise.all(
                              acceptedQuestions.map((q) =>
                                createAiQuestion({
                                  subjectId,
                                  topic: String(q.topic ?? ''),
                                  bloomLevel: String(q.bloomLevel ?? q.bloom_level ?? ''),
                                  questionType: String(q.questionType ?? q.question_type ?? 'trac_nghiem'),
                                  contentHtml: String(q.contentHtml ?? q.content_html ?? ''),
                                  options: (q.options ?? {}) as Record<string, string>,
                                  correctAnswer: String(q.correctAnswer ?? q.correct_answer ?? ''),
                                  explanationHtml: (q.explanationHtml ?? q.explanation_html ?? null) as string | null,
                                  isAiGenerated: true,
                                })
                              )
                            )
                            notification.success({
                              message: 'Thành công',
                              description: `Đã thêm ${acceptedQuestions.length} câu hỏi vào ngân hàng.`,
                              placement: 'topRight',
                              duration: 1.2,
                            })
                            setAcceptedQuestions([])
                            navigate('/lecture/question-bank')
                          } catch (err) {
                            message.error(err instanceof Error ? err.message : 'Thêm vào ngân hàng thất bại')
                          } finally {
                            setSavingToBank(false)
                          }
                        }}
                      >
                        Xác nhận thêm vào ngân hàng câu hỏi
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Table<PreviewQuestion>
                      columns={acceptedColumns}
                      dataSource={acceptedQuestions.map((q, i) => ({ ...q, key: q.id ?? `a-${i}` }))}
                      pagination={{ pageSize: 5 }}
                      rowKey={(r, i) => String(r.id ?? `a-${i}`)}
                      size="small"
                      expandable={{
                        expandedRowRender: (r: PreviewQuestion, index) => {
                          const key = r.id ?? `a-${index}`
                          const isEditing = String(editingKey) === String(key) && editingTarget === 'accepted'
                          const draft = isEditing ? (editDraft as PreviewQuestion) : r
                          const options = (draft.options ?? r.options ?? {}) as Record<string, string>
                          const correct = (draft.correctAnswer ?? r.correctAnswer ?? r.correct_answer ?? '') as string
                          return (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                              <div className="mb-2 text-xs text-slate-500">
                                Mức độ khó: {(draft.bloomLevel ?? r.bloomLevel ?? r.bloom_level) ?? '—'} · Topic:{' '}
                                {formatTopicVi(((draft.topic ?? r.topic) as string) ?? '')}
                              </div>
                              {isEditing ? (
                                <Input.TextArea
                                  rows={3}
                                  value={String(draft.contentHtml ?? '')}
                                  onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), contentHtml: e.target.value }))}
                                />
                              ) : (
                                <HtmlWithMath
                                  className="mb-3 font-medium text-slate-800 dark:text-slate-200 prose prose-sm max-w-none dark:prose-invert"
                                  html={(r.contentHtml ?? r.content_html ?? '') as string}
                                />
                              )}
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {['A', 'B', 'C', 'D'].map((k) => (
                                  <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900/30">
                                    <span className="font-semibold">{k}.</span>{' '}
                                    {isEditing ? (
                                      <Input
                                        value={options[k] ?? ''}
                                        onChange={(e) =>
                                          setEditDraft((d) => ({
                                            ...(d ?? {}),
                                            options: { ...(((d?.options ?? {}) as Record<string, string>) ?? {}), [k]: e.target.value },
                                          }))
                                        }
                                      />
                                    ) : (
                                      <>
                                        <span
                                          className={correct === k ? 'font-semibold text-green-600 dark:text-green-400' : ''}
                                          dangerouslySetInnerHTML={{ __html: decorateMathInHtml(String(options[k] ?? '—')) }}
                                        />
                                        {correct === k ? <span className="ml-2 text-xs">(Đúng)</span> : null}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {isEditing ? (
                                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div>
                                    <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án đúng</div>
                                    <Select
                                      value={String(correct ?? '')}
                                      onChange={(v) => setEditDraft((d) => ({ ...(d ?? {}), correctAnswer: v }))}
                                      options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                                    />
                                  </div>
                                  <div>
                                    <div className="mb-1 text-xs font-semibold text-slate-500">Mức độ khó</div>
                                    <Input value={String(draft.bloomLevel ?? '')} onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), bloomLevel: e.target.value }))} />
                                  </div>
                                  <div>
                                    <div className="mb-1 text-xs font-semibold text-slate-500">Topic</div>
                                    <Input value={String(draft.topic ?? '')} onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), topic: e.target.value }))} />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Modal
        title={`Câu hỏi đã tạo (${previewQuestions.length})`}
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false)
          cancelEdit()
        }}
        footer={[
          <Button key="cancel" onClick={() => { setPreviewOpen(false); cancelEdit() }}>
            Đóng
          </Button>,
          <Button
            key="accept"
            type="primary"
            onClick={() => {
              setAcceptedQuestions(previewQuestions)
              setPreviewOpen(false)
              cancelEdit()
              message.success('Đã xác nhận câu hỏi. Bạn có thể thêm vào ngân hàng bên dưới.')
            }}
          >
            Xác nhận câu hỏi
          </Button>,
        ]}
        width={980}
        destroyOnHidden
      >
        <Table<PreviewQuestion>
          columns={previewColumns}
          dataSource={previewQuestions.map((q, i) => ({ ...q, key: q.id ?? `q-${i}` }))}
          pagination={{ pageSize: 8 }}
          expandable={{
            expandedRowRender: (r: PreviewQuestion) => {
              const options = (r.options ?? {}) as Record<string, string>
              const correct = (r.correctAnswer ?? r.correct_answer) as string
              const explanation = (r.explanationHtml ?? r.explanation_html) as string
              const idx = previewQuestions.indexOf(r)
              const key = r.id ?? `q-${idx}`
              const isEditing = String(editingKey) === String(key)
              const draft = isEditing ? (editDraft as PreviewQuestion) : r
              const dOptions = (draft?.options ?? options) as Record<string, string>
              const dCorrect = (draft?.correctAnswer ?? correct) as string
              return (
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="mb-2 text-xs text-slate-500">
                    Mức độ khó: {(draft?.bloomLevel ?? r.bloomLevel ?? r.bloom_level) ?? '—'} · Topic:{' '}
                    {formatTopicVi(((draft?.topic ?? r.topic) as string) ?? '')}
                  </div>
                  {isEditing ? (
                    <Input.TextArea
                      rows={3}
                      value={String(draft?.contentHtml ?? '')}
                      onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), contentHtml: e.target.value }))}
                    />
                  ) : (
                    <HtmlWithMath
                      className="mb-3 font-medium text-slate-800 dark:text-slate-200 prose prose-sm max-w-none dark:prose-invert"
                      html={(r.contentHtml ?? r.content_html ?? '') as string}
                    />
                  )}
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {['A', 'B', 'C', 'D'].map((k) => (
                      <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900/30">
                        <span className="font-semibold">{k}.</span>{' '}
                        {isEditing ? (
                          <Input
                            value={dOptions[k] ?? ''}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...(d ?? {}),
                                options: { ...(((d?.options ?? {}) as Record<string, string>) ?? {}), [k]: e.target.value },
                              }))
                            }
                          />
                        ) : (
                          <>
                            <span
                              className={correct === k ? 'font-semibold text-green-600 dark:text-green-400' : ''}
                              dangerouslySetInnerHTML={{ __html: decorateMathInHtml(String(options[k] ?? '—')) }}
                            />
                            {correct === k ? <span className="ml-2 text-xs">(Đúng)</span> : null}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing ? (
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Đáp án đúng</div>
                        <Select
                          value={String(dCorrect ?? '')}
                          onChange={(v) => setEditDraft((d) => ({ ...(d ?? {}), correctAnswer: v }))}
                          options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }]}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Mức độ khó</div>
                        <Input value={String(draft?.bloomLevel ?? '')} onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), bloomLevel: e.target.value }))} />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-500">Topic</div>
                        <Input value={String(draft?.topic ?? '')} onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), topic: e.target.value }))} />
                      </div>
                    </div>
                  ) : null}
                  {explanation ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900/30">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Lời giải</div>
                      {isEditing ? (
                        <Input.TextArea
                          rows={3}
                          value={String(draft?.explanationHtml ?? '')}
                          onChange={(e) => setEditDraft((d) => ({ ...(d ?? {}), explanationHtml: e.target.value }))}
                        />
                      ) : (
                        <HtmlWithMath className="prose prose-sm max-w-none dark:prose-invert" html={explanation} />
                      )}
                    </div>
                  ) : null}
                </div>
              )
            },
          }}
          rowKey={(r, i) => String(r.id ?? `q-${i}`)}
          size="middle"
          locale={{ emptyText: 'Chưa có câu hỏi.' }}
        />
      </Modal>
    </div>
  )
}

