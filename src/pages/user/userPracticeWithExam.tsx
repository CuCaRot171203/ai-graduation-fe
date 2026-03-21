import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, InputNumber, Modal, Select, Tag, message } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import {
  getAiTopics,
  getStepSolutionWithAi,
  getPracticeQuestions,
  getPracticeResult,
  patchPracticeProgress,
  explainQuestionWithAi,
  startPractice,
  submitPractice,
  type AiTopic,
  type PracticeSessionQuestion,
} from '../../apis/aiExamApi'
import { HtmlWithMath } from '../../components/HtmlWithMath'
import { decorateMathInHtml } from '../../utils/mathHtml'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function UserPracticeWithExam() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const subjectIdNum = Number(subjectId)

  const [topicsLoading, setTopicsLoading] = useState(true)
  const [topics, setTopics] = useState<AiTopic[]>([])
  const [topicId, setTopicId] = useState<number | null>(null)
  const [count, setCount] = useState<number>(20)
  const [starting, setStarting] = useState(false)
  const [waitOpen, setWaitOpen] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [finishLoading, setFinishLoading] = useState(false)
  const [resultData, setResultData] = useState<unknown>(null)

  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questions, setQuestions] = useState<PracticeSessionQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string | null>>({})
  const [activeOrder, setActiveOrder] = useState<number>(1)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)

  const [view, setView] = useState<'practice' | 'result'>('practice')
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiModalTitle, setAiModalTitle] = useState('')
  const [aiContentHtml, setAiContentHtml] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const fetchTopics = useCallback(() => {
    if (!Number.isFinite(subjectIdNum) || subjectIdNum <= 0) return
    setTopicsLoading(true)
    getAiTopics({ subjectId: subjectIdNum, page: 1, limit: 20 })
      .then((res) => {
        const list = res.data?.topics ?? []
        list.sort((a, b) => (a.orderNumber ?? 999) - (b.orderNumber ?? 999))
        setTopics(list)
        if (!topicId && list.length) setTopicId(list[0]!.id)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách topic'))
      .finally(() => setTopicsLoading(false))
  }, [subjectIdNum])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const start = useCallback(async () => {
    if (!Number.isFinite(subjectIdNum) || subjectIdNum <= 0) {
      message.error('SubjectId không hợp lệ')
      return
    }
    if (!topicId) {
      message.error('Vui lòng chọn topic')
      return
    }
    if (!count || count <= 0) {
      message.error('Số lượng câu hỏi phải > 0')
      return
    }
    setStarting(true)
    try {
      const startedAt = Date.now()
      setWaitOpen(true)
      setView('practice')
      const res = await startPractice({ subjectId: subjectIdNum, topicId, count })
      const sid = res.data?.sessionId
      if (!sid) throw new Error('Không nhận được sessionId')
      setSessionId(sid)

      setQuestionsLoading(true)
      const qres = await getPracticeQuestions(sid)
      const minWaitMs = 1200
      const elapsed = Date.now() - startedAt
      if (elapsed < minWaitMs) await new Promise((r) => setTimeout(r, minWaitMs - elapsed))

      const qs = qres.data?.questions ?? []
      setQuestions(qs)
      setAnswers(
        Object.fromEntries(
          qs.map((q) => [q.sessionQuestionId, (q.studentAnswer ?? null) as string | null])
        )
      )
      setActiveOrder(qs[0]?.orderNumber ?? 1)
      setSeconds(0)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
      message.success(res.message ?? 'Bắt đầu luyện tập thành công')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Tạo đề thất bại')
    } finally {
      setStarting(false)
      setQuestionsLoading(false)
      setWaitOpen(false)
    }
  }, [count, subjectIdNum, topicId])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const inSession = questions.length > 0

  const active = useMemo(() => {
    const found = questions.find((q) => q.orderNumber === activeOrder)
    return found ?? questions[0] ?? null
  }, [activeOrder, questions])

  const answeredCount = useMemo(() => Object.values(answers).filter((v) => v != null && String(v).trim() !== '').length, [answers])

  const finish = useCallback(() => {
    if (!sessionId) return

    Modal.confirm({
      title: 'Hoàn thành luyện tập?',
      content: `Bạn đã hoàn thành ${answeredCount}/${questions.length} câu.`,
      okText: 'Hoàn thành',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          if (timerRef.current) window.clearInterval(timerRef.current)
          setFinishLoading(true)

          const progressPayload = {
            answers: questions.map((q) => ({
              sessionQuestionId: q.sessionQuestionId,
              selectedAnswer: answers[q.sessionQuestionId] ?? '',
            })),
          }

          const patchRes = await patchPracticeProgress(sessionId, progressPayload)
          message.success(patchRes.message ?? 'Đã lưu tiến độ')

          const submitPayload = {
            answers: questions.map((q) => ({
              sessionQuestionId: q.sessionQuestionId,
              questionId: q.question.id,
              selectedAnswer: answers[q.sessionQuestionId] ?? '',
            })),
          }

          const submitRes = await submitPractice(sessionId, submitPayload)
          if (submitRes.message) message.success(submitRes.message)

          const resultRes = await getPracticeResult(sessionId)
          setResultData(resultRes.data)
          setView('result')
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Hoàn thành thất bại')
        } finally {
          setFinishLoading(false)
        }
      },
    })
  }, [answeredCount, answers, getPracticeResult, navigate, patchPracticeProgress, questions, sessionId])

  const topicOptions = useMemo(
    () => topics.map((t) => ({ value: t.id, label: `${t.orderNumber ? `${t.orderNumber}. ` : ''}${t.name}` })),
    [topics]
  )

  const buildAiQuestionPayload = (q: unknown) => {
    const qq = (q ?? {}) as Record<string, unknown>
    return {
      content_html: (qq.contentHtml as string) ?? (qq.content_html as string) ?? '',
      options: (qq.options as Record<string, string>) ?? {},
      correct_answer: (qq.correctAnswer as string) ?? (qq.correct_answer as string) ?? '',
      topic: (qq.topic as string) ?? undefined,
      bloom_level: (qq.bloomLevel as string) ?? (qq.bloom_level as string) ?? undefined,
    }
  }

  const asHtml = (raw: string | undefined | null): string => {
    if (!raw) return ''
    const s = String(raw)
    if (/<[a-z][\s\S]*>/i.test(s)) return s
    return s.replace(/\n/g, '<br />')
  }

  const handleExplainAi = async (question: unknown, orderLabel: string, questionId?: number) => {
    try {
      setAiModalTitle(`Giải thích với AI - ${orderLabel}`)
      setAiLoading(true)
      setAiModalOpen(true)
      setAiContentHtml('')
      const res = await explainQuestionWithAi({
        questionId,
        question: buildAiQuestionPayload(question),
      })
      setAiContentHtml(asHtml(res.data?.explanation ?? 'AI chưa trả về nội dung giải thích.'))
    } catch (err) {
      setAiContentHtml('')
      message.error(err instanceof Error ? err.message : 'Không thể lấy giải thích AI')
    } finally {
      setAiLoading(false)
    }
  }

  const handleStepSolutionAi = async (question: unknown, orderLabel: string, questionId?: number) => {
    try {
      setAiModalTitle(`Chi tiết bước giải AI - ${orderLabel}`)
      setAiLoading(true)
      setAiModalOpen(true)
      setAiContentHtml('')
      const res = await getStepSolutionWithAi({
        questionId,
        question: buildAiQuestionPayload(question),
      })
      setAiContentHtml(asHtml(res.data?.stepSolution ?? 'AI chưa trả về bước giải chi tiết.'))
    } catch (err) {
      setAiContentHtml('')
      message.error(err instanceof Error ? err.message : 'Không thể lấy bước giải AI')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarStudent activeItem="practice" variant="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          userName="Học sinh"
          userSubtitle="Luyện tập với đề"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Luyện tập với đề</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {inSession ? 'Làm bài luyện tập theo session.' : 'Chọn topic và số lượng câu để bắt đầu.'}
              </p>
            </div>
          }
        />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl">
            {view === 'result' ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Kết quả luyện tập</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {resultData ? 'Xem đáp án đúng/sai của từng câu.' : 'Đang tải kết quả...'}
                    </p>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => {
                      setView('practice')
                      navigate('/user/subject-list')
                    }}
                  >
                    Quay lại danh sách môn
                  </Button>
                </div>

                {resultData ? (
                  (() => {
                    const r = resultData as any
                    const score = r?.score
                    const status = r?.status
                    const qs = (r?.questions ?? []) as Array<any>
                    const keys = ['A', 'B', 'C', 'D'] as const
                    return (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Tag className="rounded-full">Trạng thái: {status ?? '—'}</Tag>
                          <Tag color={score == null ? 'default' : score >= 5 ? 'green' : 'red'} className="rounded-full">
                            Điểm: {score == null ? '—' : score}
                          </Tag>
                          <Tag className="rounded-full">{qs.length} câu</Tag>
                        </div>

                        <div className="space-y-3">
                          {qs.map((item) => {
                            const order = item?.orderNumber ?? 0
                            const q = item?.question ?? {}
                            const student = item?.studentAnswer ?? null
                            const correct = q?.correctAnswer ?? null
                            const isCorrect = item?.isCorrect
                            const options: Record<string, string> = q?.options ?? {}

                            return (
                              <div key={order} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="font-bold text-slate-900 dark:text-white">Câu {order}</div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {isCorrect != null ? (
                                      <Tag color={isCorrect ? 'green' : 'red'} className="rounded-full">
                                        {isCorrect ? 'Đúng' : 'Sai'}
                                      </Tag>
                                    ) : null}
                                    {student ? <Tag className="rounded-full">Bạn chọn: {student}</Tag> : <Tag className="rounded-full">Bạn chưa chọn</Tag>}
                                    {correct ? <Tag className="rounded-full">Đáp án đúng: {correct}</Tag> : null}
                                  </div>
                                </div>

                                <HtmlWithMath
                                  className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                  html={q?.contentHtml ?? ''}
                                />

                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                  {keys.map((k) => {
                                    const text = options[k] ?? ''
                                    const isCorrectOpt = correct != null && k === correct
                                    const isWrongSelected = student != null && k === student && !isCorrectOpt

                                    return (
                                      <div
                                        key={k}
                                        className={
                                          isCorrectOpt
                                            ? 'rounded-xl border border-green-400 bg-green-50 p-3 text-slate-900 dark:border-green-500 dark:bg-green-950/30'
                                            : isWrongSelected
                                              ? 'rounded-xl border border-red-400 bg-red-50 p-3 text-slate-900 dark:border-red-500 dark:bg-red-950/30'
                                              : 'rounded-xl border border-slate-200 bg-white p-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                                        }
                                      >
                                        <div className="text-sm font-black text-slate-900 dark:text-white">{k}.</div>
                                        <div
                                          className="mt-1 text-sm leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: decorateMathInHtml(String(text || '—')) }}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>

                                {q?.explanationHtml ? (
                                  <HtmlWithMath
                                    className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200 prose prose-sm max-w-none dark:prose-invert"
                                    html={q.explanationHtml}
                                  />
                                ) : null}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button
                                    type="primary"
                                    icon={<span className="material-symbols-outlined text-base">psychology</span>}
                                    className="!h-9 !rounded-full !border-0 !bg-violet-600 !px-4 !font-semibold hover:!bg-violet-700"
                                    onClick={() => handleExplainAi(q, `Câu ${order}`, q?.id)}
                                  >
                                    Giải thích với AI
                                  </Button>
                                  <Button
                                    icon={<span className="material-symbols-outlined text-base">format_list_numbered</span>}
                                    className="!h-9 !rounded-full !border-violet-300 !bg-violet-50 !px-4 !font-semibold !text-violet-700 hover:!border-violet-400 hover:!bg-violet-100 dark:!border-violet-700 dark:!bg-violet-900/30 dark:!text-violet-200"
                                    onClick={() => handleStepSolutionAi(q, `Câu ${order}`, q?.id)}
                                  >
                                    Chi tiết bước giải AI
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Đang tải kết quả...</div>
                )}
              </div>
            ) : !inSession ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="rounded-full">SubjectId: {Number.isFinite(subjectIdNum) ? subjectIdNum : '—'}</Tag>
                    <Tag className="rounded-full">{topicsLoading ? 'Đang tải topics...' : `${topics.length} topic`}</Tag>
                  </div>
                  <Button onClick={() => navigate(`/user/subjects/${subjectIdNum}/practice`)}>Quay lại</Button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Chọn topic</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lấy từ danh sách topics theo môn học.</p>
                    <div className="mt-3">
                      <Select
                        loading={topicsLoading}
                        value={topicId ?? undefined}
                        options={topicOptions}
                        onChange={(v) => setTopicId(v)}
                        className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:items-center"
                        placeholder="Chọn topic..."
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Số lượng câu hỏi</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Count = số câu trong phiên luyện tập.</p>
                    <div className="mt-3">
                      <InputNumber
                        min={1}
                        max={200}
                        value={count}
                        onChange={(v) => setCount(Number(v) || 0)}
                        className="w-full [&_.ant-input-number-input]:h-10 [&_.ant-input-number-input]:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="primary" loading={starting} onClick={start}>
                    Xác nhận & Bắt đầu
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Session #{sessionId ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tiến độ: {answeredCount}/{questions.length} · Thời gian: {fmtTime(seconds)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button danger onClick={finish}>
                          Hoàn thành
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {active ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Câu {active.orderNumber}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {active.question?.bloomLevel ? <Tag className="rounded-full">{active.question.bloomLevel}</Tag> : null}
                            {active.question?.topic ? <Tag className="rounded-full">{active.question.topic}</Tag> : null}
                          </div>
                        </div>

                        <HtmlWithMath
                          className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          html={active.question?.contentHtml ?? ''}
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                          {(['A', 'B', 'C', 'D'] as const).map((k) => {
                            const opt = active.question?.options?.[k] ?? ''
                            const selected = answers[active.sessionQuestionId] === k
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [active.sessionQuestionId]: k }))}
                                className={
                                  selected
                                    ? 'flex items-start gap-3 rounded-xl border border-primary bg-primary/5 p-4 text-left text-slate-900 shadow-sm dark:bg-primary/10 dark:text-white'
                                    : 'flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/40'
                                }
                              >
                                <span className={selected ? 'font-black text-primary' : 'font-black'}>{k}.</span>
                                <span
                                  className="text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: decorateMathInHtml(String(opt || '—')) }}
                                />
                              </button>
                            )
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            disabled={active.orderNumber <= 1}
                            onClick={() => setActiveOrder((o) => Math.max(1, o - 1))}
                          >
                            Câu trước
                          </Button>
                          <Button
                            type="primary"
                            disabled={active.orderNumber >= questions.length}
                            onClick={() => setActiveOrder((o) => Math.min(questions.length, o + 1))}
                          >
                            Câu tiếp
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {questionsLoading ? 'Đang tải câu hỏi...' : 'Không có câu hỏi.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Danh sách câu</h4>
                    <Tag className="rounded-full">{answeredCount}/{questions.length}</Tag>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                    {questions.map((q) => {
                      const selected = q.orderNumber === activeOrder
                      const answered = answers[q.sessionQuestionId] != null
                      return (
                        <button
                          key={q.sessionQuestionId}
                          type="button"
                          onClick={() => setActiveOrder(q.orderNumber)}
                          className={
                            selected
                              ? 'rounded-lg bg-primary text-white'
                              : answered
                                ? 'rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }
                        >
                          <span className="block py-2 text-xs font-bold">{q.orderNumber}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-6">
                    <Button danger className="w-full" loading={finishLoading} onClick={finish}>
                      Hoàn thành
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal open={waitOpen} footer={null} closable={false} centered width={420}>
          <div className="space-y-3 p-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">hourglass_top</span>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Chờ một chút bạn nhé</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hệ thống đang chuẩn bị câu hỏi cho bạn...</p>
            </div>
          </div>
        </Modal>

        <Modal
          open={aiModalOpen}
          title={aiModalTitle}
          onCancel={() => setAiModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setAiModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={760}
          destroyOnHidden
        >
          {aiLoading ? (
            <div className="py-8 text-center text-slate-500">AI đang phân tích câu hỏi...</div>
          ) : aiContentHtml ? (
            <HtmlWithMath
              className="prose prose-sm dark:prose-invert max-h-[60vh] max-w-none overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed dark:border-slate-700 dark:bg-slate-900"
              html={aiContentHtml}
            />
          ) : (
            <div className="py-8 text-center text-slate-500">Chưa có nội dung.</div>
          )}
        </Modal>
      </main>
    </div>
  )
}

