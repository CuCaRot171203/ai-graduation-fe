import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getSubjects, type Subject, type SubjectsPagination } from '../../apis/subjectsApi'
import { getTeacherSubjects, registerTeacherSubject, deleteTeacherSubject } from '../../apis/teachersApi'
import type { LoginUser } from '../../apis/authApi'

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

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
}

export default function RegisterSubject() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [pagination, setPagination] = useState<SubjectsPagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [loading, setLoading] = useState(true)
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set())
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [unregisteringId, setUnregisteringId] = useState<number | null>(null)
  const teacherId = getStoredUser()?.id ?? null

  const fetchTeacherSubjects = useCallback(() => {
    if (!teacherId) return
    getTeacherSubjects(teacherId)
      .then((res) => {
        const ids = new Set((res.data?.subjects ?? []).map((s) => s.id))
        setRegisteredIds(ids)
      })
      .catch(() => {})
  }, [teacherId])

  const fetchSubjects = useCallback(() => {
    setLoading(true)
    getSubjects({
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })
      .then((res) => {
        setSubjects(res.data?.subjects ?? [])
        if (res.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => {
        message.error(err?.message ?? 'Tải danh sách môn học thất bại')
      })
      .finally(() => setLoading(false))
  }, [params.page, params.limit, params.sortBy, params.sortOrder])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchTeacherSubjects()
  }, [fetchTeacherSubjects])

  const handleRegister = (subjectId: number) => {
    if (!teacherId) {
      message.error('Vui lòng đăng nhập lại.')
      return
    }
    setRegisteringId(subjectId)
    registerTeacherSubject(teacherId, subjectId)
      .then(() => {
        message.success('Đăng ký môn học thành công.')
        fetchTeacherSubjects()
      })
      .catch((err) => {
        message.error(err?.message ?? 'Đăng ký thất bại')
      })
      .finally(() => setRegisteringId(null))
  }

  const handleUnregister = (subjectId: number) => {
    if (!teacherId) return
    setUnregisteringId(subjectId)
    deleteTeacherSubject(teacherId, subjectId)
      .then(() => {
        message.success('Đã hủy đăng ký môn học.')
        fetchTeacherSubjects()
      })
      .catch((err) => {
        message.error(err?.message ?? 'Hủy đăng ký thất bại')
      })
      .finally(() => setUnregisteringId(null))
  }

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
      title: 'Thống kê',
      key: 'stats',
      width: 140,
      render: (_: unknown, record: Subject) => (
        <span className="text-slate-500 dark:text-slate-400">
          {record.stats?.totalTeachers ?? 0} GV / {record.stats?.totalStudents ?? 0} HS
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Subject) => {
        const registered = registeredIds.has(record.id)
        if (registered) {
          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-base align-middle">check_circle</span>
                Đã đăng ký
              </span>
              <Button
                type="link"
                size="small"
                danger
                loading={unregisteringId === record.id}
                className="!px-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleUnregister(record.id)}
              >
                Hủy đăng ký
              </Button>
            </div>
          )
        }
        return (
          <Button
            type="primary"
            size="small"
            loading={registeringId === record.id}
            className="inline-flex items-center justify-center gap-1.5"
            icon={<span className="material-symbols-outlined text-base align-middle">add_circle</span>}
            onClick={() => handleRegister(record.id)}
          >
            Đăng ký dạy
          </Button>
        )
      },
    },
  ]

  if (!teacherId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-slate-500">Vui lòng đăng nhập với tài khoản giáo viên.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <TheHeader
        variant="lecture"
        searchSlot={
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Đăng ký môn giảng dạy
          </h2>
        }
        userName={getStoredUser()?.fullName ?? 'Giảng viên'}
        userSubtitle="Chọn môn học để đăng ký"
        avatarUrl={TEACHER_AVATAR}
        avatarAlt="Teacher"
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        <SidebarLecture variant="register-teach" activeItem="registerTeach" />

        <main className="ml-64 flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <Button
                type="text"
                className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:!text-slate-900 dark:text-slate-400 dark:hover:!text-white [&_.ant-btn-icon]:flex [&_.ant-btn-icon]:items-center"
                icon={<span className="material-symbols-outlined text-xl leading-none">arrow_back</span>}
                onClick={() => navigate('/lecture/subjects')}
              >
                Quay lại
              </Button>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Đăng ký môn giảng dạy
              </h1>
              <p className="max-w-2xl text-slate-500 dark:text-slate-400">
                Chọn môn học bạn có chuyên môn để đăng ký giảng dạy. Dữ liệu lấy từ hệ thống.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<Subject>
                columns={columns}
                dataSource={subjects.map((s) => ({ ...s, key: s.id }))}
                loading={loading}
                rowClassName={() => 'group'}
                pagination={{
                  current: pagination.currentPage,
                  total: pagination.totalCount,
                  pageSize: pagination.limit,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} môn`,
                  onChange: (page) => setParams((p) => ({ ...p, page })),
                }}
                size="middle"
                locale={{ emptyText: 'Chưa có môn học nào.' }}
                className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/50 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/30"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
