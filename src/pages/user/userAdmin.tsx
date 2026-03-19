import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Spin, Tag, message } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import {
  getAiAssignments,
  getAiMe,
  getMyEnrollments,
  getPracticeHistory,
  type AiAssignmentDetail,
  type EnrollmentItem,
  type PracticeHistoryItem,
} from '../../apis/aiExamApi'

const USER_DASHBOARD_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA_CYgB6LIMa6G-_Uwi09br1namMI790E7A5O26R5uaZZd9UFQkXLpRVPZnSwg-HLjGJxgBFhFkIkv575hDLVnLUVYrV1_sHXbrtZ_QzPRZjEpKwtlQiukoEPFhlAmCJO875oOxhaVrhud6ejubHm1sWav1EfGGoflJLsPc6h37X2VgSSVpGYECJ7zd6JkuGh09AqztGdmw331FhlgKhcybtpe7kuQ8zwcJQGg_juHnWRtI6NZiwejwnYNhZkW9veAe3sEgJELRfh3K'

export default function UserAdmin() {
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('Học sinh')
  const [email, setEmail] = useState('')
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [assignments, setAssignments] = useState<AiAssignmentDetail[]>([])
  const [history, setHistory] = useState<PracticeHistoryItem[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      try {
        const [meRes, enrollmentRes, assignmentRes, historyRes] = await Promise.all([
          getAiMe(),
          getMyEnrollments(),
          getAiAssignments({ page: 1, limit: 8 }),
          getPracticeHistory({ page: 1, limit: 8 }),
        ])
        setFullName(meRes.data?.fullName ?? 'Học sinh')
        setEmail(meRes.data?.email ?? '')
        setEnrollments(enrollmentRes.data?.enrollments ?? [])
        setAssignments(assignmentRes.data?.assignments ?? [])
        setHistory(historyRes.data?.sessions ?? [])
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Không thể tải dashboard')
      } finally {
        setLoading(false)
      }
    }
    void fetchDashboard()
  }, [])

  const activeEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'active'), [enrollments])
  const pendingEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'pending'), [enrollments])
  const completedCount = useMemo(() => assignments.filter((a) => a.myAttempt?.status === 'completed').length, [assignments])
  const avgScore = useMemo(() => {
    const scores = history.map((h) => (h.score == null ? null : Number(h.score))).filter((s): s is number => s != null)
    if (!scores.length) return null
    return Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2))
  }, [history])

  const recentActivities = useMemo(() => history.slice(0, 5), [history])

  return (
    <div className="flex h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarStudent variant="dashboard" activeItem="overview" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          searchPlaceholder="Tìm kiếm bài thi..."
          userName={fullName}
          userSubtitle={email || 'Tài khoản học sinh'}
          avatarUrl={USER_DASHBOARD_AVATAR}
          avatarAlt="User Profile"
          searchAreaClassName="!w-full max-w-md"
        />

        <div className="flex-1 overflow-y-auto space-y-8 p-8">
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chào mừng quay lại, {fullName}! 👋</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Theo dõi nhanh tiến độ học tập và các bài thi bạn có thể làm ngay.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag color="blue">Lớp hoạt động: {activeEnrollments.length}</Tag>
                  <Tag color="gold">Yêu cầu chờ duyệt: {pendingEnrollments.length}</Tag>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bài được giao</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{assignments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Đã hoàn thành</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{completedCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lượt luyện tập</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{history.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Điểm trung bình</p>
                  <p className="mt-1 text-2xl font-bold text-orange-500">{avgScore == null ? '—' : avgScore}</p>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <section className="space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Bài thi có thể làm</h3>
                    <Link to="/user/exam-list" className="text-sm font-semibold text-primary hover:underline">Xem tất cả</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {assignments.slice(0, 4).map((a) => (
                      <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between">
                          <Tag color={a.assignmentType === 'fixed_exam' ? 'cyan' : 'purple'}>
                            {a.assignmentType === 'fixed_exam' ? 'Đề cố định' : 'Thi thử random'}
                          </Tag>
                          <span className="text-xs text-slate-400">{a.durationMinutes ?? 60} phút</span>
                        </div>
                        <h4 className="line-clamp-1 font-bold text-slate-900 dark:text-white">{a.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{a.description || a.exam?.title || 'Bài thi đã được giao'}</p>
                        <Button
                          type="primary"
                          className="mt-4 w-full"
                          disabled={a.myAttempt?.status === 'completed'}
                          onClick={() => (window.location.href = `/user/exam-practice/${a.id}`)}
                        >
                          {a.myAttempt?.status === 'completed' ? 'Đã làm bài' : 'Làm bài ngay'}
                        </Button>
                      </div>
                    ))}
                    {assignments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        Chưa có bài thi nào được giao.
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 text-lg font-bold">Hoạt động gần đây</h3>
                  <div className="space-y-4">
                    {recentActivities.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.subject?.name ?? 'Luyện tập'}
                          </div>
                          <Tag color={item.status === 'completed' ? 'green' : 'blue'}>
                            {item.status === 'completed' ? 'Đã xong' : 'Đang làm'}
                          </Tag>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Topic: {item.topic?.name ?? '—'} · Điểm: {item.score == null ? '—' : item.score}
                        </p>
                      </div>
                    ))}
                    {recentActivities.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có hoạt động gần đây.</p>
                    ) : null}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

