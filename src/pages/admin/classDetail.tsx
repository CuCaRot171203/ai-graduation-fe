import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Modal, Spin, Table, Tabs, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { deleteClass, getClassById, type ClassDetailItem } from '../../apis/classesApi'

const toast = {
  success: (description: string) =>
    notification.success({ message: 'Thành công', description, placement: 'topRight', duration: 2 }),
  error: (description: string) =>
    notification.error({ message: 'Thất bại', description, placement: 'topRight', duration: 2 }),
}

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const CLASS_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrBWrzX27n9nX2YsJfibfaZ6fcuzd9kEvs6pZ2TY-jURPY3GZKiup0sAEYjYByheyMsmuVUxBSfHDTktfwpWRA1ABKfRVDWJ22UgvGOGU5lJy5SXcsmL1KMsDSiIaS1Y0zzVK8179amCBLp6_zB5HFGR4wUP8xHq9ZON8ARkjTQ73cZeXMXGtXe8-TQQ7Bk7CcHz4wPBRbqJ0m2kzW3TM4ZFjTB-7ZoilN0tGt8uqSbyPrxIV40TH9v4VhC65pWsZWo4qJjjcrf0xD'

type StudentRow = {
  key: number
  id: number
  fullName: string
  email: string
  joinDate?: string
}

function parseStudents(list: unknown[]): StudentRow[] {
  return list.map((s: unknown, i: number) => {
    const o = s as Record<string, unknown>
    return {
      key: (o.id as number) ?? i,
      id: (o.id as number) ?? i,
      fullName: (o.fullName as string) ?? (o.name as string) ?? '—',
      email: (o.email as string) ?? '—',
      joinDate: (o.joinDate as string) ?? (o.createdAt as string) ?? undefined,
    }
  })
}

export default function ClassDetail() {
  const [searchParams] = useSearchParams()
  const idParam = searchParams.get('id')
  const classId = idParam ? parseInt(idParam, 10) : null
  const navigate = useNavigate()

  const [detail, setDetail] = useState<ClassDetailItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (classId == null || Number.isNaN(classId)) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getClassById(classId)
      .then((res) => {
        if (!cancelled) setDetail(res.data)
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Không tải được chi tiết lớp học')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [classId])

  const studentList = detail?.students ? parseStudents(detail.students) : []
  const studentColumns: ColumnsType<StudentRow> = [
    {
      title: 'Tên học sinh',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => <span className="text-sm font-bold text-slate-900 dark:text-white">{name}</span>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', className: 'text-sm text-slate-500 dark:text-slate-400' },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinDate',
      key: 'joinDate',
      className: 'text-sm text-slate-500 dark:text-slate-400',
      render: (v: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    )
  }

  if (!classId || Number.isNaN(classId) || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Không tìm thấy lớp học.</p>
          <Link to="/admin/list-of-class" className="mt-4 inline-block text-primary hover:underline">
            Quay lại danh sách lớp học
          </Link>
        </div>
      </div>
    )
  }

  const teacherName = detail.teacher?.fullName ?? '—'
  const subjectName = detail.subject?.name ?? detail.subject?.code ?? '—'

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/list-of-class"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Chi tiết lớp học
                </h1>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col p-6 md:flex-row md:gap-6">
                <div className="relative size-32 shrink-0 overflow-hidden rounded-xl">
                  <img alt="Lớp học" className="h-full w-full object-cover" src={CLASS_IMAGE} />
                  <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Niên khóa {detail.schoolYear || '—'}
                        </span>
                        <span
                          className={
                            detail.isActive
                              ? 'rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }
                        >
                          {detail.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{detail.name}</h2>
                      {detail.code && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mã lớp: {detail.code}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        icon={<span className="material-symbols-outlined text-sm">edit</span>}
                        className="flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
                        onClick={() => navigate(`/admin/update-class?id=${detail.id}`)}
                      >
                        Cập nhật lớp
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          Modal.confirm({
                            title: 'Xóa lớp học',
                            content: `Bạn có chắc muốn xóa lớp "${detail.name}"? Hành động này không thể hoàn tác.`,
                            okText: 'Xóa',
                            okType: 'danger',
                            cancelText: 'Hủy',
                            onOk: () =>
                              deleteClass(detail.id)
                                .then(() => {
                                  toast.success('Đã xóa lớp học.')
                                  navigate('/admin/list-of-class')
                                })
                                .catch((err) => toast.error(err instanceof Error ? err.message : 'Xóa lớp thất bại')),
                          })
                        }}
                        className="flex items-center justify-center rounded-xl p-2 text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Xóa lớp"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                  {detail.description && (
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{detail.description}</p>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Môn học</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{subjectName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Giáo viên phụ trách
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{teacherName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Số học sinh
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                        {detail.studentCount ?? 0} học sinh
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Ngày tạo</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                        {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Tabs
                defaultActiveKey="students"
                className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav]:border-b [&_.ant-tabs-nav]:border-slate-200 dark:[&_.ant-tabs-nav]:border-slate-800"
                items={[
                  {
                    key: 'students',
                    label: (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">group</span>
                        Danh sách học sinh ({studentList.length})
                      </span>
                    ),
                    children: (
                      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                          <h3 className="font-bold">Học sinh trong lớp</h3>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Thêm học sinh
                          </button>
                        </div>
                        <Table
                          columns={studentColumns}
                          dataSource={studentList}
                          rowKey="id"
                          pagination={
                            studentList.length > 10
                              ? { pageSize: 10, showTotal: (total) => `Tổng ${total} học sinh` }
                              : false
                          }
                          locale={{ emptyText: 'Chưa có học sinh trong lớp.' }}
                          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-[10px] [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 dark:[&_.ant-table-thead>tr>th]:bg-slate-800/50 [&_.ant-table-tbody>tr:hover>td]:bg-slate-50 dark:[&_.ant-table-tbody>tr:hover>td]:bg-slate-800/30"
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'results',
                    label: (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">bar_chart</span>
                        Kết quả học tập
                      </span>
                    ),
                    children: (
                      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="mb-4 text-sm text-slate-500">
                          Xem báo cáo kết quả thi và phân bố điểm của lớp.
                        </p>
                        <Link
                          to={`/admin/class-result?id=${detail.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                          <span className="material-symbols-outlined text-sm">bar_chart</span>
                          Xem kết quả học tập
                        </Link>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
