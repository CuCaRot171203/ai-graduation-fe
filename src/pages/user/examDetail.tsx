import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Modal, Progress, Spin, message } from 'antd'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
  getAiAssignmentQuestions,
  startAiAssignment,
  submitAiAssignment,
  type AssignmentAttemptQuestion,
} from '../../apis/aiExamApi'

function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function normalizeAnswer(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim().toUpperCase()
  if (!s) return null
  return s.slice(0, 1)
}

function renderKatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode })
  } catch {
    return latex
  }
}

function decorateMathInHtml(input: string): string {
  let html = String(input ?? '')
  html = html.replace(/\\\[((?:.|\n)+?)\\\]/g, (_, expr: string) => renderKatex(expr, true))
  html = html.replace(/\$\$((?:.|\n)+?)\$\$/g, (_, expr: string) => renderKatex(expr, true))
  html = html.replace(/\\\(((?:.|\n)+?)\\\)/g, (_, expr: string) => renderKatex(expr, false))
  html = html.replace(/\$([^$\n]+)\$/g, (_, expr: string) => renderKatex(expr, false))
  return html
}

function optionAsHtml(text: unknown): string {
  const raw = String(text ?? '')
  const hasLatex = /\\[a-zA-Z]+|\^|_|\{|\}/.test(raw)
  if (hasLatex) {
    return renderKatex(raw, false)
  }
  return raw
}

export default function ExamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const assignmentId = Number(id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [questions, setQuestions] = useState<AssignmentAttemptQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string | null>>({})
  const [activeOrder, setActiveOrder] = useState(1)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [countdownReady, setCountdownReady] = useState(false)
  const [submittedSummary, setSubmittedSummary] = useState<{
    totalQuestions: number
    correctCount: number
    score: number
  } | null>(null)

  const inProgress = !loading && !submittedSummary
  const allowLeaveRef = useRef(false)
  const guardPathRef = useRef<string>('')
  const bootedRef = useRef(false)

  const activeQuestion = useMemo(
    () => questions.find((q) => q.orderNumber === activeOrder) ?? questions[0] ?? null,
    [activeOrder, questions]
  )
  const total = questions.length
  const answered = useMemo(() => Object.values(answers).filter((v) => v != null).length, [answers])
  const progress = total > 0 ? (answered / total) * 100 : 0

  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true

    if (!Number.isFinite(assignmentId) || assignmentId <= 0) {
      message.error('Assignment ID không hợp lệ')
      navigate('/user/exam-list')
      return
    }

    const boot = async () => {
      setLoading(true)
      setCountdownReady(false)
      try {
        let qs: AssignmentAttemptQuestion[] = []
        let duration = 0
        let started: string | null = null
        let attempt: number | null = null
        let statusFromQuestions: string | undefined

        try {
          const startRes = await startAiAssignment(assignmentId)
          const startData = startRes.data
          attempt = startData?.attemptId ?? null
          duration = startData?.durationMinutes ?? 0
          started = startData?.startedAt ?? null
          qs = startData?.questions ?? []
        } catch {
          // Fallback cho các trường hợp đã có attempt trước đó (hoặc start bị từ chối),
          // thử lấy trực tiếp danh sách câu hỏi để tiếp tục luồng làm bài.
        }

        if (!qs.length) {
          const qRes = await getAiAssignmentQuestions(assignmentId)
          attempt = qRes.data?.attemptId ?? attempt
          duration = qRes.data?.durationMinutes ?? duration
          qs = qRes.data?.questions ?? []
          statusFromQuestions = qRes.data?.status
        }

        setAttemptId(attempt)
        setDurationMinutes(duration)
        setStartedAt(started)

        setQuestions(qs)
        setAnswers(
          Object.fromEntries(
            qs.map((q) => [q.question.id, normalizeAnswer(q.answer?.studentAnswer)])
          )
        )
        setActiveOrder(qs[0]?.orderNumber ?? 1)

        const totalSeconds = Math.max(0, Number(duration || 0) * 60)
        if (totalSeconds > 0) {
          const startedMs = started ? new Date(started).getTime() : Date.now()
          const elapsed = Math.floor((Date.now() - startedMs) / 1000)
          setRemainingSeconds(Math.max(0, totalSeconds - elapsed))
        } else {
          // Nếu backend không trả duration hợp lệ thì không auto-submit theo đồng hồ.
          setRemainingSeconds(0)
        }
        setCountdownReady(true)

        if ((statusFromQuestions ?? '').toLowerCase() === 'completed') {
          Modal.info({
            title: 'Bài này đã được nộp trước đó',
            content: 'Bạn đã hoàn thành bài này nên không thể làm lại.',
            onOk: () => navigate('/user/exam-list'),
          })
          return
        }
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Không thể bắt đầu làm bài')
        navigate('/user/exam-list')
      } finally {
        setLoading(false)
      }
    }

    void boot()
  }, [assignmentId, navigate])

  useEffect(() => {
    if (!inProgress) return
    const startedMs = startedAt ? new Date(startedAt).getTime() : Date.now()
    const totalSeconds = Math.max(0, (durationMinutes || 0) * 60)
    if (!totalSeconds) {
      setCountdownReady(true)
      return
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedMs) / 1000)
      const remain = Math.max(0, totalSeconds - elapsed)
      setRemainingSeconds(remain)
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [durationMinutes, inProgress, startedAt])

  useEffect(() => {
    if (inProgress && countdownReady && durationMinutes > 0 && remainingSeconds === 0 && total > 0) {
      void handleSubmit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, inProgress, total, countdownReady, durationMinutes])

  useEffect(() => {
    if (!inProgress) return
    guardPathRef.current = window.location.pathname + window.location.search
    window.history.pushState({ examGuard: true }, '', guardPathRef.current)

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }

    const onPopState = () => {
      if (allowLeaveRef.current) return
      window.history.pushState({ examGuard: true }, '', guardPathRef.current)
      Modal.confirm({
        title: 'Bạn có chắc muốn thoát bài làm?',
        content: 'Bạn đang trong quá trình làm bài. Nếu thoát bây giờ, dữ liệu có thể chưa được nộp.',
        okText: 'Thoát',
        okButtonProps: { danger: true },
        cancelText: 'Ở lại làm tiếp',
        onOk: () => {
          allowLeaveRef.current = true
          navigate('/user/exam-list')
        },
      })
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('popstate', onPopState)
    }
  }, [inProgress, navigate])

  const handleSubmit = async (forcedByTimeout = false) => {
    if (submitting || !inProgress) return
    try {
      setSubmitting(true)
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.question.id,
          selectedAnswer: normalizeAnswer(answers[q.question.id]),
        })),
        timeSpentSeconds: Math.max(0, (durationMinutes || 0) * 60 - remainingSeconds),
      }
      const res = await submitAiAssignment(assignmentId, payload)
      allowLeaveRef.current = true
      setSubmittedSummary({
        totalQuestions: res.data?.totalQuestions ?? total,
        correctCount: res.data?.correctCount ?? 0,
        score: res.data?.score ?? 0,
      })
      message.success(forcedByTimeout ? 'Hết giờ, hệ thống đã tự nộp bài.' : res.message ?? 'Nộp bài thành công')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Nộp bài thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const askSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      content: `Bạn đã trả lời ${answered}/${total} câu. Bạn có muốn nộp bài ngay không?`,
      okText: 'Nộp bài',
      cancelText: 'Làm tiếp',
      onOk: () => handleSubmit(false),
    })
  }

  const askExit = () => {
    Modal.confirm({
      title: 'Bạn có chắc muốn thoát bài làm?',
      content: 'Bạn đang trong quá trình làm bài. Nếu thoát bây giờ, dữ liệu có thể chưa được nộp.',
      okText: 'Thoát',
      okButtonProps: { danger: true },
      cancelText: 'Ở lại làm tiếp',
      onOk: () => {
        allowLeaveRef.current = true
        navigate('/user/exam-list')
      },
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    )
  }

  if (submittedSummary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-primary/10 via-sky-500/10 to-violet-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Chúc mừng! Bạn đã hoàn thành bài thi
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Bài làm đã được ghi nhận thành công. Bạn có thể quay về dashboard để tiếp tục các hoạt động học tập.
            </p>
            <Button
              type="primary"
              size="large"
              className="mt-7 !h-11 !rounded-xl !px-6 !font-bold"
              onClick={() => navigate('/user/dashboard')}
            >
              Quay lại dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-bold leading-none">Bài làm #{assignmentId}</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Attempt #{attemptId ?? '—'} · {total} câu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              {fmtClock(remainingSeconds)}
            </span>
            <Button danger onClick={askExit}>
              Thoát
            </Button>
            <Button type="primary" loading={submitting} onClick={askSubmit}>
              Nộp bài
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 p-4 md:p-6 lg:p-8 lg:flex-row">
        <section className="w-full space-y-4 lg:w-[70%]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Tiến độ làm bài</span>
              <span className="font-bold text-primary">{answered} / {total} câu</span>
            </div>
            <Progress percent={progress} showInfo={false} />
          </div>

          {activeQuestion ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 text-sm font-bold text-primary">Câu {activeQuestion.orderNumber}</div>
              <div
                className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800"
                dangerouslySetInnerHTML={{ __html: decorateMathInHtml(activeQuestion.question.contentHtml ?? '') }}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.entries(activeQuestion.question.options ?? {}).map(([key, text]) => {
                  const k = String(key).toUpperCase().slice(0, 1)
                  const selected = normalizeAnswer(answers[activeQuestion.question.id]) === k
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [activeQuestion.question.id]: k }))}
                      className={
                        selected
                          ? 'rounded-xl border border-primary bg-primary/10 p-3 text-left'
                          : 'rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                      }
                    >
                      <span className="font-bold">{k}.</span>{' '}
                      <span dangerouslySetInnerHTML={{ __html: optionAsHtml(text) }} />
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  disabled={activeOrder <= 1}
                  onClick={() => setActiveOrder((v) => Math.max(1, v - 1))}
                >
                  Câu trước
                </Button>
                <Button
                  type="primary"
                  disabled={activeOrder >= total}
                  onClick={() => setActiveOrder((v) => Math.min(total, v + 1))}
                >
                  Câu sau
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Không có câu hỏi để hiển thị.
            </div>
          )}
        </section>

        <aside className="w-full lg:w-[30%]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Danh sách câu hỏi</h3>
              <span className="text-xs text-slate-400">{total} câu</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {questions.map((q) => {
                const answeredQ = normalizeAnswer(answers[q.question.id]) != null
                const activeQ = q.orderNumber === activeOrder
                return (
                  <button
                    key={`${q.orderNumber}-${q.question.id}`}
                    type="button"
                    onClick={() => setActiveOrder(q.orderNumber)}
                    className={
                      activeQ
                        ? 'rounded-lg border-2 border-primary bg-primary/10 py-2 text-xs font-black text-primary'
                        : answeredQ
                          ? 'rounded-lg bg-primary py-2 text-xs font-bold text-white'
                          : 'rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }
                  >
                    {q.orderNumber}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

