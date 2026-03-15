import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getTeacherSubjects, deleteTeacherSubject } from '../../apis/teachersApi'
import type { LoginUser } from '../../apis/authApi'
import type { Subject } from '../../apis/subjectsApi'

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

export default function LectureSubjects() {
  const navigate = useNavigate()
  const [list, setList] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [unregisteringId, setUnregisteringId] = useState<number | null>(null)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  const handleUnregister = (subjectId: number) => {
    if (!teacherId) return
    setUnregisteringId(subjectId)
    deleteTeacherSubject(teacherId, subjectId)
      .then(() => {
        message.success('Đã hủy đăng ký môn học.')
        fetchSubjects()
      })
      .catch((err) => {
        message.error(err?.message ?? 'Hủy đăng ký thất bại')
      })
      .finally(() => setUnregisteringId(null))
  }

  const fetchSubjects = useCallback(() => {
    const user = getStoredUser()
    if (!user?.id) {
      message.error('Vui lòng đăng nhập lại.')
      setLoading(false)
      return
    }
    setTeacherId(user.id)
    setLoading(true)
    getTeacherSubjects(user.id)
      .then((res) => {
        setList(res.data?.subjects ?? [])
      })
      .catch((err) => {
        message.error(err?.message ?? 'Tải danh sách môn đang dạy thất bại')
      })
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<Subject> = [
    { title: 'Mã môn', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <span className="text-slate-500 dark:text-slate-400">{text || '—'}</span>
      ),
    },
    {
      title: 'Giáo viên / Học sinh',
      key: 'stats',
      width: 160,
      render: (_: unknown, record: Subject) =>
        `${record.stats?.totalTeachers ?? 0} GV / ${record.stats?.totalStudents ?? 0} HS`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Subject) => (
        <Button
          type="link"
          size="small"
          danger
          loading={unregisteringId === record.id}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => handleUnregister(record.id)}
        >
          Hủy đăng ký
        </Button>
      ),
    },
  ]

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="subjects" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchPlaceholder="Tìm kiếm môn học..."
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Môn đang dạy"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="mx-auto w-full max-w-[1200px] space-y-6 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Môn đang dạy
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Danh sách môn học bạn đã đăng ký giảng dạy.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              className="flex items-center gap-2"
              icon={<span className="material-symbols-outlined">add_circle</span>}
              onClick={() => navigate('/lecture/register-subject')}
            >
              Đăng ký môn học
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Table<Subject>
              columns={columns}
              dataSource={list.map((s) => ({ ...s, key: s.id }))}
              loading={loading}
              rowClassName={() => 'group'}
              pagination={false}
              size="middle"
              locale={{ emptyText: 'Chưa đăng ký môn nào. Nhấn "Đăng ký môn học" để thêm.' }}
              className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/50 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/30"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
