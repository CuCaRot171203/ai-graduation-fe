import { useEffect, useState } from 'react'
import { Button, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link, useParams } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import { getAiAssignmentProgress, type AiAssignmentProgressStudent } from '../../apis/aiExamApi'

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

export default function LectureAssignmentProgress() {
  const { assignmentId } = useParams()
  const idNum = Number(assignmentId)

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Tiến độ bài giao')
  const [stats, setStats] = useState<{
    totalStudents: number
    completed: number
    inProgress: number
    notStarted: number
    averageScore: number | null
  } | null>(null)
  const [rows, setRows] = useState<AiAssignmentProgressStudent[]>([])

  const fetchProgress = async () => {
    if (!Number.isFinite(idNum)) return
    try {
      setLoading(true)
      const res = await getAiAssignmentProgress(idNum)
      setTitle(res.data?.assignment?.title ?? 'Tiến độ bài giao')
      setStats(res.data?.stats ?? null)
      setRows(res.data?.students ?? [])
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tải tiến độ bài giao')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum])

  const columns: ColumnsType<AiAssignmentProgressStudent> = [
    {
      title: 'HỌC SINH',
      key: 'student',
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.student?.fullName ?? `#${r.student?.id}`}</div>
          <div className="text-xs text-slate-500">{r.student?.email ?? '—'}</div>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 140,
      render: (_, r) => {
        if (!r.attempted) return <Tag>Chưa làm</Tag>
        if (r.status === 'completed') return <Tag color="green">Đã nộp</Tag>
        if (r.status === 'in_progress') return <Tag color="gold">Đang làm</Tag>
        return <Tag>{r.status ?? '—'}</Tag>
      },
    },
    {
      title: 'ĐIỂM',
      key: 'score',
      width: 90,
      align: 'center',
      render: (_, r) => (r.score != null ? Number(r.score).toFixed(2) : '—'),
    },
    {
      title: 'THỜI GIAN LÀM',
      key: 'timeSpentSeconds',
      width: 130,
      render: (_, r) => (r.timeSpentSeconds != null ? `${r.timeSpentSeconds}s` : '—'),
    },
    {
      title: 'NỘP LÚC',
      key: 'submittedAt',
      width: 170,
      render: (_, r) => (r.submittedAt ? new Date(r.submittedAt).toLocaleString('vi-VN') : '—'),
    },
  ]

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="assignments" />
      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tiến độ bài giao</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Theo dõi trạng thái làm bài của học sinh.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Assignments"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
                {stats && (
                  <p className="mt-1 text-sm text-slate-500">
                    Tổng: {stats.totalStudents} | Đã nộp: {stats.completed} | Đang làm: {stats.inProgress} | Chưa làm: {stats.notStarted} | Điểm TB:{' '}
                    {stats.averageScore != null ? Number(stats.averageScore).toFixed(2) : '—'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={fetchProgress}>Làm mới</Button>
                <Link to={`/lecture/assignments/${idNum}`}>
                  <Button>Xem chi tiết bài giao</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<AiAssignmentProgressStudent>
                rowKey={(r) => String(r.student?.id ?? Math.random())}
                columns={columns}
                dataSource={rows}
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Chưa có dữ liệu tiến độ.' }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
