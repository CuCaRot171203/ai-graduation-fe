import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, InputNumber, Modal, Select, Table, Tag, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { deleteClass, getClasses, type ClassItem } from '../../apis/classesApi'

const toast = {
  success: (description: string) =>
    notification.success({ message: 'Thành công', description, placement: 'topRight', duration: 2 }),
  error: (description: string) =>
    notification.error({ message: 'Thất bại', description, placement: 'topRight', duration: 2 }),
}

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const IS_ACTIVE_OPTIONS = [
  { value: '', label: '--' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Không hoạt động' },
]

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  teacherId: undefined as number | undefined,
  subjectId: undefined as number | undefined,
  schoolYear: '',
  isActiveFilter: '' as '' | 'true' | 'false',
}

export default function ClassList() {
  const navigate = useNavigate()
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      search: params.search.trim() || undefined,
      teacherId: params.teacherId,
      subjectId: params.subjectId,
      schoolYear: params.schoolYear.trim() || undefined,
      isActive: params.isActiveFilter === 'true' ? true : params.isActiveFilter === 'false' ? false : undefined,
    }
    getClasses(apiParams)
      .then((res) => {
        setClasses(res.data.classes ?? [])
        if (res.data.pagination) setPagination(res.data.pagination)
      })
      .catch(() => {})
  }, [params])

  const handleDeleteClass = (record: ClassItem) => {
    Modal.confirm({
      title: 'Xóa lớp học',
      content: `Bạn có chắc muốn xóa lớp "${record.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () =>
        deleteClass(record.id)
          .then(() => {
            toast.success('Đã xóa lớp học.')
            refetch()
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : 'Xóa lớp thất bại')),
    })
  }

  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      search: params.search.trim() || undefined,
      teacherId: params.teacherId,
      subjectId: params.subjectId,
      schoolYear: params.schoolYear.trim() || undefined,
      isActive: params.isActiveFilter === 'true' ? true : params.isActiveFilter === 'false' ? false : undefined,
    }

    const cancelled = { current: false }
    const tid = setTimeout(() => setLoading(true), 0)
    getClasses(apiParams)
      .then((res) => {
        if (cancelled.current) return
        setClasses(res.data.classes ?? [])
        if (res.data.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => {
        if (!cancelled.current) message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách lớp học')
      })
      .finally(() => {
        clearTimeout(tid)
        if (!cancelled.current) setLoading(false)
      })
    return () => {
      cancelled.current = true
      clearTimeout(tid)
    }
  }, [params])

  const columns: ColumnsType<ClassItem> = [
    {
      title: 'Tên lớp',
      key: 'name',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{record.name}</div>
          <div className="text-xs text-slate-400">Mã: {record.code}</div>
        </div>
      ),
    },
    {
      title: 'Môn học',
      key: 'subject',
      render: (_, record) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {record.subject?.name ?? record.subject?.code ?? '—'}
        </span>
      ),
    },
    {
      title: 'Giáo viên',
      key: 'teacher',
      render: (_, record) => {
        const name = record.teacher?.fullName ?? '—'
        const initials = name
          .split(/\s+/)
          .map((s) => s[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold dark:bg-slate-700">
              {initials || '—'}
            </div>
            <span className="text-sm">{name}</span>
          </div>
        )
      },
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      className: 'text-slate-600 dark:text-slate-400',
    },
    {
      title: 'Số học sinh',
      dataIndex: 'studentCount',
      key: 'studentCount',
      align: 'center',
      className: 'text-sm font-medium',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Hoạt động
          </Tag>
        ) : (
          <Tag className="rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Không hoạt động
          </Tag>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-sm text-slate-500 dark:text-slate-400',
      render: (v: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/class-detail?id=${record.id}`)}
            className="rounded-lg p-1.5 transition-colors hover:bg-primary/10 hover:text-primary"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/update-class?id=${record.id}`)}
            className="rounded-lg p-1.5 transition-colors hover:bg-amber-100 hover:text-amber-500 dark:hover:bg-amber-900/30"
            title="Cập nhật"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClass(record)}
            className="rounded-lg p-1.5 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
            title="Xóa lớp"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      ),
    },
  ]

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
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Danh sách lớp học
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Quản lý và theo dõi thông tin các lớp học trong hệ thống.
                </p>
              </div>
              <Link
                to="/admin/create-class"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Tạo lớp học
              </Link>
            </div>

            <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Trang</label>
                  <InputNumber
                    min={1}
                    value={params.page}
                    onChange={(v) => setParams((p) => ({ ...p, page: v ?? 1 }))}
                    className="w-20 rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Giới hạn</label>
                  <InputNumber
                    min={1}
                    max={100}
                    value={params.limit}
                    onChange={(v) => setParams((p) => ({ ...p, limit: v ?? 10 }))}
                    className="w-20 rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tìm kiếm</label>
                  <Input
                    placeholder="Tìm theo tên hoặc mã lớp"
                    value={params.search}
                    onChange={(e) => setParams((p) => ({ ...p, search: e.target.value }))}
                    onPressEnter={() => setParams((p) => ({ ...p, page: 1 }))}
                    allowClear
                    className="rounded-lg [&.ant-input]:rounded-lg"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Mã giảng viên</label>
                  <InputNumber
                    placeholder="Mã giáo viên"
                    min={1}
                    value={params.teacherId}
                    onChange={(v) => setParams((p) => ({ ...p, teacherId: v ?? undefined, page: 1 }))}
                    className="w-full rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Mã môn học</label>
                  <InputNumber
                    placeholder="Mã môn học"
                    min={1}
                    value={params.subjectId}
                    onChange={(v) => setParams((p) => ({ ...p, subjectId: v ?? undefined, page: 1 }))}
                    className="w-full rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Năm học</label>
                  <Input
                    placeholder="Năm học"
                    value={params.schoolYear}
                    onChange={(e) => setParams((p) => ({ ...p, schoolYear: e.target.value, page: 1 }))}
                    className="rounded-lg [&.ant-input]:rounded-lg"
                  />
                </div>
                <div className="w-40">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Trạng thái</label>
                  <Select
                    value={params.isActiveFilter || undefined}
                    placeholder="--"
                    options={IS_ACTIVE_OPTIONS}
                    onChange={(v) => setParams((p) => ({ ...p, isActiveFilter: (v ?? '') as '' | 'true' | 'false', page: 1 }))}
                    className="w-full [&_.ant-select-selector]:rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<ClassItem>
                columns={columns}
                dataSource={classes}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: pagination.currentPage,
                  pageSize: pagination.limit,
                  total: pagination.totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trong số ${total} lớp học`,
                  onChange: (page, pageSize) => {
                    setParams((p) => ({ ...p, page, limit: pageSize ?? p.limit }))
                  },
                  className: 'px-6 py-4',
                }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-thead>tr>th]:bg-slate-50/50 [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 dark:[&_.ant-table-thead>tr>th]:border-slate-800 dark:[&_.ant-table-thead>tr>th]:bg-slate-800/50 [&_.ant-table-tbody>tr:hover>td]:bg-slate-50/50 dark:[&_.ant-table-tbody>tr:hover>td]:bg-slate-800/50"
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tổng số lớp
                  </p>
                  <p className="text-2xl font-bold">{pagination.totalCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Lớp đang hoạt động
                  </p>
                  <p className="text-2xl font-bold">{classes.filter((c) => c.isActive).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tổng học sinh (trang)
                  </p>
                  <p className="text-2xl font-bold">{classes.reduce((a, c) => a + (c.studentCount ?? 0), 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
