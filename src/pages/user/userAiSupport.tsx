import { useCallback, useState, type ReactNode } from 'react'
import { Alert, Button, Card, Collapse, List, Modal, Spin, Tag, message } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import {
  getAiPredictScore,
  getAiStudyPlan,
  getAiStudentAnalysis,
} from '../../apis/aiExamApi'

const STUDENT_AVATAR =
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

type ModalState =
  | { open: false }
  | {
      open: true
      title: string
      loading: boolean
      content: ReactNode
    }

export default function UserAiSupport() {
  const user = getStoredUser()
  const subjectId = 1
  const studentId = user?.id ?? 2

  const [modal, setModal] = useState<ModalState>({ open: false })

  const openModal = useCallback((title: string, content: React.ReactNode, loading = false) => {
    setModal({ open: true, title, content, loading })
  }, [])

  const closeModal = useCallback(() => setModal({ open: false }), [])

  type IllustrationKind = 'analysis' | 'predict' | 'plan'

  const getIllustration = (kind: IllustrationKind) => {
    const cfg = {
      analysis: { icon: 'analytics', from: 'from-primary/10', to: 'to-emerald-500/10', color: 'text-primary' },
      predict: { icon: 'trending_up', from: 'from-violet-500/10', to: 'to-sky-500/10', color: 'text-violet-600' },
      plan: { icon: 'map', from: 'from-emerald-500/10', to: 'to-primary/10', color: 'text-emerald-600' },
    }[kind]

    return (
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-r ${cfg.from} ${cfg.to} ${cfg.color}`}
      >
        <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
      </div>
    )
  }

  type AnalysisSuggestion = { title?: string; description?: string; actionType?: string }
  type AnalysisResponse = {
    student?: { id?: number; fullName?: string; email?: string }
    summary?: {
      totalAttempts?: number
      totalPracticeSessions?: number
      averageScore?: number | null
      timePattern?: unknown
      bloomPerformance?: Record<string, unknown>
    }
    analysis?: string
    suggestions?: AnalysisSuggestion[]
    forwardToStudyPlan?: boolean
  }

  type PredictFactor = { factor: string; value: string }
  type PredictResponse = {
    predictedScore?: number | null
    confidenceRange?: { low?: number; high?: number } | null
    factors?: PredictFactor[]
    message?: string
    explanation?: string
  }

  type StudyPlanResponse = {
    title?: string
    content?: {
      title?: string
      weeks?: Array<{
        week: number
        title?: string
        tasks?: string[]
        focusArea?: string
      }>
    }
    suggestions?: Array<{ title?: string; description?: string; actionType?: string }>
    subject?: { name?: string }
  }

  const renderAnalysis = (data: AnalysisResponse) => {
    const student = data?.student ?? null
    const summary = data?.summary ?? {}
    const analysis = data?.analysis ?? ''
    const suggestions = (data?.suggestions ?? []) as AnalysisSuggestion[]
    const forwardToStudyPlan = Boolean(data?.forwardToStudyPlan)

      const totalAttempts = summary?.totalAttempts ?? 0
      const totalPracticeSessions = summary?.totalPracticeSessions ?? 0
      const avgScore = summary?.averageScore ?? null

    return (
      <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-primary/10 via-sky-500/10 to-emerald-500/10 p-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {getIllustration('analysis')}
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{student?.fullName ?? 'Học sinh'}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">Email: {student?.email ?? '—'}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tag className="rounded-full">{totalAttempts} lượt thử</Tag>
                <Tag className="rounded-full">{totalPracticeSessions} phiên luyện tập</Tag>
                <Tag color={avgScore == null ? 'default' : 'green'} className="rounded-full">
                  Điểm TB: {avgScore == null ? '—' : avgScore}
                </Tag>
              </div>
            </div>

            {analysis ? (
              <div className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{analysis}</div>
            ) : null}

            {forwardToStudyPlan ? (
              <div className="mt-4">
                <Alert
                  type="info"
                  showIcon
                  message="Gợi ý: Bạn có thể bắt đầu lộ trình học ngay."
                  action={<Button type="primary" onClick={() => fetchStudyPlan()}>Mở lộ trình học</Button>}
                />
              </div>
            ) : null}
          </div>

        {suggestions.length ? (
          <div className="space-y-3">
            <div className="text-sm font-black text-slate-900 dark:text-white">Gợi ý học tập</div>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={suggestions}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    size="small"
                    className="border border-slate-200 shadow-none dark:border-slate-800"
                    bodyStyle={{ padding: 14 }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.title ?? 'Gợi ý'}</div>
                      <Tag className="rounded-full">{item.actionType ?? 'study_plan'}</Tag>
                    </div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description ?? '—'}</div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">Chưa có gợi ý.</div>
        )}
      </div>
    )
  }

  const renderPredict = (data: PredictResponse) => {
    const predictedScore = data?.predictedScore ?? null
    const confidenceRange = data?.confidenceRange ?? null
    const factors = (data?.factors ?? []) as PredictFactor[]
    const messageText = data?.message ?? ''
    const explanation = data?.explanation ?? ''

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-violet-500/10 via-sky-500/10 to-emerald-500/10 p-5 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getIllustration('predict')}
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Dự đoán điểm thi</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Theo dữ liệu hiện có.</div>
              </div>
            </div>

            {predictedScore == null ? (
              <Tag color="orange" className="rounded-full">
                Chưa có dự đoán
              </Tag>
            ) : (
              <Tag color="green" className="rounded-full">
                Có dự đoán
              </Tag>
            )}
          </div>

          <div className="mt-4">
            {predictedScore == null ? (
              <Alert
                type="warning"
                showIcon
                message={messageText || 'Cần ít nhất 1 bài thi thử hoàn thành để dự đoán điểm.'}
              />
            ) : (
              <div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">{predictedScore}<span className="text-lg font-normal text-slate-500">/100</span></div>
                {confidenceRange ? (
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    Khoảng tin cậy: {confidenceRange.low ?? '?'} - {confidenceRange.high ?? '?'}
                  </div>
                ) : null}
                {explanation ? (
                  <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{explanation}</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {factors.length ? (
          <div className="space-y-2">
            <div className="text-sm font-black text-slate-900 dark:text-white">Các yếu tố ảnh hưởng</div>
            <div className="space-y-2">
              {factors.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{f.factor}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const renderStudyPlan = (data: StudyPlanResponse) => {
    const content = data?.content ?? {}
    const title = content?.title ?? data?.title ?? 'Lộ trình học'
    const weeks = (content?.weeks ?? []) as Array<{
      week: number
      title?: string
      tasks?: string[]
      focusArea?: string
    }>
    const suggestions = (data?.suggestions ?? []) as Array<{
      title?: string
      description?: string
      actionType?: string
    }>

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-primary/10 p-5 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getIllustration('plan')}
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Tạo lộ trình học</div>
                <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{title}</div>
              </div>
            </div>
            {data?.subject?.name ? (
              <Tag className="rounded-full" color="blue">
                {data.subject.name}
              </Tag>
            ) : null}
          </div>
        </div>

        {weeks.length ? (
          <Collapse
            accordion={false}
            defaultActiveKey={[String(weeks[0]?.week ?? 1)]}
            className="[&_.ant-collapse-header]:font-semibold [&_.ant-collapse-header]:text-slate-900 dark:[&_.ant-collapse-header]:text-white"
          >
            {weeks.map((w) => (
              <Collapse.Panel
                key={String(w.week)}
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      Tuần {w.week}: {w.title ?? '—'}
                    </span>
                    {w.focusArea ? <Tag className="rounded-full">{w.focusArea}</Tag> : null}
                  </div>
                }
              >
                <List
                  size="small"
                  bordered={false}
                  dataSource={w.tasks ?? []}
                  renderItem={(t) => <List.Item className="text-sm text-slate-700 dark:text-slate-200">{t}</List.Item>}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : (
          <Alert type="info" showIcon message="Chưa có tuần trong lộ trình." />
        )}

        {suggestions.length ? (
          <div className="space-y-3">
            <div className="text-sm font-black text-slate-900 dark:text-white">Gợi ý thêm</div>
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <Card
                  key={idx}
                  size="small"
                  className="border border-slate-200 shadow-none dark:border-slate-800"
                  bodyStyle={{ padding: 14 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-bold text-slate-900 dark:text-white">{s.title ?? 'Gợi ý'}</div>
                    {s.actionType ? <Tag className="rounded-full">{s.actionType}</Tag> : null}
                  </div>
                  {s.description ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.description}</div> : null}
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const fetchAnalysis = async () => {
    openModal('Phân tích kết quả cá nhân', <Spin />, true)
    try {
      const res = await getAiStudentAnalysis({ studentId, subjectId })
      openModal('Phân tích kết quả cá nhân', renderAnalysis((res.data ?? res) as AnalysisResponse), false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi phân tích kết quả cá nhân')
      closeModal()
    }
  }

  const fetchPredict = async () => {
    openModal('Dự đoán điểm thi', <Spin />, true)
    try {
      const res = await getAiPredictScore({ subjectId })
      openModal('Dự đoán điểm thi', renderPredict((res.data ?? res) as PredictResponse), false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi dự đoán điểm thi')
      closeModal()
    }
  }

  const fetchStudyPlan = async () => {
    openModal('Tạo lộ trình học', <Spin />, true)
    try {
      const res = await getAiStudyPlan({ subjectId })
      openModal('Tạo lộ trình học', renderStudyPlan((res.data ?? res) as StudyPlanResponse), false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tạo lộ trình học')
      closeModal()
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarStudent activeItem="ai-support" variant="exam-list" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          userName={user?.fullName ?? 'Học sinh'}
          userSubtitle="Trợ lý AI"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Trợ lý AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chọn chức năng để xem kết quả.</p>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card
                hoverable
                className="shadow-sm"
                  title={
                    <div className="flex items-center gap-3">
                      {getIllustration('analysis')}
                      <span>Phân tích kết quả cá nhân</span>
                    </div>
                  }
                  extra={<Button type="primary" onClick={fetchAnalysis}>Xem</Button>}
              >
                  <p className="text-sm text-slate-600 dark:text-slate-300">Hiển thị điểm mạnh/yếu và gợi ý cải thiện theo dữ liệu bạn đã có.</p>
              </Card>

              <Card
                hoverable
                className="shadow-sm"
                  title={
                    <div className="flex items-center gap-3">
                      {getIllustration('predict')}
                      <span>Dự đoán điểm thi</span>
                    </div>
                  }
                  extra={<Button type="primary" onClick={fetchPredict}>Xem</Button>}
              >
                  <p className="text-sm text-slate-600 dark:text-slate-300">Ước lượng điểm thi dựa trên tiến trình luyện tập.</p>
              </Card>

              <Card
                hoverable
                className="shadow-sm"
                  title={
                    <div className="flex items-center gap-3">
                      {getIllustration('plan')}
                      <span>Tạo lộ trình học</span>
                    </div>
                  }
                  extra={<Button type="primary" onClick={fetchStudyPlan}>Xem</Button>}
              >
                  <p className="text-sm text-slate-600 dark:text-slate-300">Tạo timeline theo từng tuần để bạn cải thiện hiệu quả.</p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Modal
        open={modal.open}
        onCancel={closeModal}
        footer={null}
        width={900}
        centered
        title={modal.open ? modal.title : undefined}
      >
        {modal.open ? modal.content : null}
      </Modal>
    </div>
  )
}

