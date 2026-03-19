import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, Tag, message } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import {
  getAiAssignments,
  getAiClasses,
  getAiGenerationOptions,
  getAiMe,
  getQuestionBank,
  getTeacherSubjectsFromAiBackend,
  type AiClassItem,
} from '../../apis/aiExamApi'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

const TEACHER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

type BloomAgg = Record<string, number>
type TopicAgg = Record<string, number>

const classColumns = [
  {
    title: 'Lớp học',
    dataIndex: 'name',
    key: 'name',
    render: (_: string, r: AiClassItem) => (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{r.code}</span>
      </div>
    ),
  },
  {
    title: 'Môn',
    key: 'subject',
    render: (_: unknown, r: AiClassItem) => (
      <span className="text-slate-600 dark:text-slate-300">{r.subject?.name ?? '-'}</span>
    ),
  },
  {
    title: 'Niên khoá',
    dataIndex: 'schoolYear',
    key: 'schoolYear',
    render: (v: string) => <span className="text-slate-500 dark:text-slate-400">{v}</span>,
  },
  {
    title: 'Học sinh',
    dataIndex: 'studentCount',
    key: 'studentCount',
    align: 'right' as const,
    render: (v: number) => <span className="font-semibold">{v ?? 0}</span>,
  },
  {
    title: 'Thao tác',
    key: 'action',
    align: 'right' as const,
    render: (_: unknown, r: AiClassItem) => (
      <Button
        size="small"
        className="border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:!bg-primary hover:!text-white"
        onClick={() => window.location.assign(`/lecture/classes/${r.id}`)}
      >
        Xem chi tiết
      </Button>
    ),
  },
]

export default function LectureDashboard() {
  const navigate = useNavigate()
  const teacher = getStoredUser()
  const teacherId = teacher?.id ?? null

  const [loading, setLoading] = useState(true)
  const [meName, setMeName] = useState<string>(teacher?.fullName ?? 'Giảng viên')
  const [meRoleSubtitle, setMeRoleSubtitle] = useState<string>('Giảng viên')
  const [statsExamsCreated, setStatsExamsCreated] = useState<number>(0)
  const [statsAssignments, setStatsAssignments] = useState<number>(0)
  const [statsClasses, setStatsClasses] = useState<number>(0)
  const [statsQuestionBank, setStatsQuestionBank] = useState<number>(0)
  const [topClasses, setTopClasses] = useState<AiClassItem[]>([])
  const [bloomAgg, setBloomAgg] = useState<BloomAgg>({})
  const [topicAgg, setTopicAgg] = useState<TopicAgg>({})

  const sortedBloom = useMemo(() => {
    const entries = Object.entries(bloomAgg)
    entries.sort((a, b) => b[1] - a[1])
    return entries
  }, [bloomAgg])

  const sortedTopics = useMemo(() => {
    const entries = Object.entries(topicAgg)
    entries.sort((a, b) => b[1] - a[1])
    return entries.slice(0, 6)
  }, [topicAgg])

  const fetchAll = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    try {
      const [meRes, classesRes, assignmentsRes, teacherSubjectsRes, genOptsRes] = await Promise.all([
        getAiMe(),
        getAiClasses({ page: 1, limit: 5, teacherId }),
        getAiAssignments({ page: 1, limit: 1 }),
        getTeacherSubjectsFromAiBackend(teacherId),
        getAiGenerationOptions(),
      ])

      setMeName(meRes.data?.fullName ?? meName)
      setMeRoleSubtitle(meRes.data?.role === 'teacher' ? 'Giảng viên' : meRes.data?.role ?? 'Giảng viên')
      setStatsExamsCreated(meRes.data?.stats?.totalExamsCreated ?? 0)

      setTopClasses(classesRes.data?.classes ?? [])
      setStatsClasses(classesRes.data?.pagination?.totalCount ?? 0)
      setStatsAssignments(assignmentsRes.data?.pagination?.total ?? 0)

      const subjectIds = (teacherSubjectsRes.data?.subjects ?? []).map((s) => s.id).filter(Boolean)
      if (subjectIds.length) {
        const totals = await Promise.all(subjectIds.map((id) => getQuestionBank({ page: 1, limit: 1, subjectId: id })))
        const qTotal = totals.reduce((sum, r) => sum + (r.data?.pagination?.total ?? 0), 0)
        setStatsQuestionBank(qTotal)
      } else {
        setStatsQuestionBank(0)
      }

      const bloom: BloomAgg = {}
      const topics: TopicAgg = {}
      const allow = new Set(subjectIds)
      const allSubjects = genOptsRes.data?.subjects ?? []
      allSubjects
        .filter((s) => (allow.size ? allow.has(s.id) : true))
        .forEach((s) => {
          const byBloom = s.questionStats?.byBloomLevel ?? {}
          Object.entries(byBloom).forEach(([k, v]) => {
            bloom[k] = (bloom[k] ?? 0) + (v ?? 0)
          })
          const byTopic = s.questionStats?.byTopic ?? {}
          Object.entries(byTopic).forEach(([k, v]) => {
            topics[k] = (topics[k] ?? 0) + (v ?? 0)
          })
        })
      setBloomAgg(bloom)
      setTopicAgg(topics)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tải dashboard')
    } finally {
      setLoading(false)
    }
  }, [teacherId, meName])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tổng quan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bảng điều khiển giảng viên.</p>
            </div>
          }
          userName={meName}
          userSubtitle={meRoleSubtitle}
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Avatar"
        />

        {/* Body */}
        <div className="mx-auto w-full max-w-[1400px] space-y-8 p-8">
          {/* Welcome */}
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Chào mừng {meName} quay lại
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Hôm nay bạn muốn quản lý lớp học hay soạn đề mới?
              </p>
            </div>
            <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Đề đã tạo
                </p>
                <p className="text-lg font-bold text-primary">{loading ? '-' : statsExamsCreated}</p>
              </div>
              <div className="my-2 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lớp đang quản lý
                </p>
                <p className="text-lg font-bold text-primary">{loading ? '-' : statsClasses}</p>
              </div>
              <div className="my-2 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Câu hỏi (bank)
                </p>
                <p className="text-lg font-bold text-primary">{loading ? '-' : statsQuestionBank}</p>
              </div>
            </div>
          </section>

          {/* Stat cards */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +12%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">{loading ? '-' : statsExamsCreated}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng đề thi đã soạn
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20">
                  <span className="material-symbols-outlined">task</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +5%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">{loading ? '-' : statsAssignments}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng bài đã giao
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <Tag className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400 dark:bg-slate-800">
                  0%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">{loading ? '-' : statsClasses}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Số lớp đang quản lý
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +28%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">{loading ? '-' : statsQuestionBank}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng câu hỏi trong ngân hàng
                </p>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              className="group flex flex-col items-center justify-center rounded-xl bg-primary p-6 text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-700"
              onClick={() => navigate('/lecture/ai-support/generate-exam')}
            >
              <span className="material-symbols-outlined mb-2 text-3xl transition-transform group-hover:scale-110">
                add_circle
              </span>
              <span className="font-bold">Soạn đề mới</span>
            </button>
            <button
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900"
              onClick={() => navigate('/lecture/exams')}
            >
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                library_books
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Danh sách đề thi
              </span>
            </button>
            <button
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900"
              onClick={() => navigate('/lecture/assignments')}
            >
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                forward_to_inbox
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Giao bài cho lớp
              </span>
            </button>
            <button
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900"
              onClick={() => navigate('/lecture/question-bank')}
            >
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                analytics
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Ngân hàng câu hỏi
              </span>
            </button>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent classes table */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Lớp học gần đây</h3>
                <button className="text-sm font-semibold text-primary hover:underline" onClick={() => navigate('/lecture/classes')}>
                  Xem tất cả
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Table
                  columns={classColumns}
                  dataSource={topClasses}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/30"
                />
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Phân tích câu hỏi</h3>
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-4 text-sm font-bold">Phân bố theo mức độ (Bloom)</h4>
                  {sortedBloom.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {loading ? 'Đang tải...' : 'Chưa có dữ liệu thống kê.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sortedBloom.map(([k, v]) => {
                        const total = sortedBloom.reduce((s, [, n]) => s + n, 0) || 1
                        const pct = Math.round((v / total) * 100)
                        return (
                          <div key={k} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{k}</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {v} ({pct}%)
                              </span>
                            </div>
                            <progress
                              className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-primary dark:[&::-webkit-progress-bar]:bg-slate-800"
                              value={pct}
                              max={100}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-4 text-sm font-bold">Top chủ đề (topic)</h4>
                  {sortedTopics.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {loading ? 'Đang tải...' : 'Chưa có dữ liệu thống kê.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sortedTopics.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{k}</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{v}</span>
                        </div>
                      ))}
                      <div className="pt-2">
                        <Button size="small" className="w-full" onClick={() => navigate('/lecture/question-bank')}>
                          Mở ngân hàng câu hỏi
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

