import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, InputNumber, Modal, Select, Table, Tag, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getSubjects, patchSubjectStatus, type Subject, type SubjectsParams } from '../../apis/subjectsApi'

const toast = {
  success: (description: string) =>
    notification.success({
      message: 'Thành công',
      description,
      placement: 'topRight',
      duration: 2,
    }),
  error: (description: string) =>
    notification.error({
      message: 'Thất bại',
      description,
      placement: 'topRight',
      duration: 2,
    }),
}

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDtoDe4KAOqKQR4ZkYjZLecKqShWOJZek1cA_-RjD9z-nzsBCcYXMobbAsyi6LHNdepq1te0vpJtFVaSJ-OBW_g1fwMn5Qjl0wzLWaCFdoF7nfD-K4UYvE4xXESYTj2XETTyznP3YboVFVZLiPKbk_QCO3mXoi1V5wtVvidHWMZArMrbuPmnDwd871y_PIgsfOE1PddVWrrgCU4dUCqlj2d-7COYui0zhPVpcV1K3vtgi26ptvo_XoGdNCOmz6nMeQdB7ZyM-PIlp1Z'

type SubjectRow = {
  key: number
  id: number
  code: string
  name: string
  description: string
  teachers: number
  students: number
  status: 'active' | 'hidden'
}

const SORT_BY_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
  { value: 'name', label: 'Tên môn học' },
  { value: 'code', label: 'Mã môn' },
]

const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
]

const IS_ACTIVE_OPTIONS = [
  { value: '', label: '--' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã ẩn' },
]

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  isActiveFilter: '' as '' | 'true' | 'false',
  sortBy: 'createdAt',
  sortOrder: 'desc' as 'asc' | 'desc' | '',
}

function subjectToRow(s: Subject): SubjectRow {
  return {
    key: s.id,
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description ?? '',
    teachers: s.stats?.totalTeachers ?? 0,
    students: s.stats?.totalStudents ?? 0,
    status: s.isActive ? 'active' : 'hidden',
  }
}

export default function AllSubjects() {
  const navigate = useNavigate()
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    const apiParams: SubjectsParams = {
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }
    if (params.search.trim()) apiParams.search = params.search.trim()
    if (params.isActiveFilter === 'true') apiParams.isActive = true
    if (params.isActiveFilter === 'false') apiParams.isActive = false
    getSubjects(apiParams)
      .then((res) => {
        setSubjects((res.data.subjects ?? []).map(subjectToRow))
        if (res.data.pagination) setPagination(res.data.pagination)
      })
      .catch(() => {})
  }, [params])

  const handleChangeStatus = (record: SubjectRow, isActive: boolean) => {
    const action = isActive ? 'hiện' : 'ẩn'
    Modal.confirm({
      title: isActive ? 'Hiện môn học' : 'Ẩn môn học',
      content: `Bạn có chắc muốn ${action} môn học "${record.name}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        return patchSubjectStatus(record.id, isActive)
          .then(() => {
            toast.success(isActive ? 'Đã hiện môn học.' : 'Đã ẩn môn học.')
            refetch()
          })
          .catch((err) => {
            toast.error(err instanceof Error ? err.message : 'Thay đổi trạng thái thất bại.')
          })
      },
    })
  }

  useEffect(() => {
    const apiParams: SubjectsParams = {
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }
    if (params.search.trim()) apiParams.search = params.search.trim()
    if (params.isActiveFilter === 'true') apiParams.isActive = true
    if (params.isActiveFilter === 'false') apiParams.isActive = false

    const cancelled = { current: false }
    const tid = setTimeout(() => setLoading(true), 0)
    getSubjects(apiParams)
      .then((res) => {
        if (cancelled.current) return
        setSubjects((res.data.subjects ?? []).map(subjectToRow))
        if (res.data.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => {
        if (!cancelled.current) message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách môn học')
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

  const columns: ColumnsType<SubjectRow> = [
    {
      title: 'Mã môn',
      dataIndex: 'code',
      key: 'code',
      className: 'font-medium text-slate-900 dark:text-slate-200',
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      className: 'font-bold text-slate-900 dark:text-white',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      className: 'max-w-[200px] truncate text-slate-500 dark:text-slate-400',
    },
    {
      title: 'GV',
      dataIndex: 'teachers',
      key: 'teachers',
      align: 'center',
      className: 'text-slate-600 dark:text-slate-300',
    },
    {
      title: 'HS',
      dataIndex: 'students',
      key: 'students',
      align: 'center',
      className: 'text-slate-600 dark:text-slate-300',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: SubjectRow['status']) =>
        status === 'active' ? (
          <Tag className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Đang hoạt động
          </Tag>
        ) : (
          <Tag className="rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Đã ẩn
          </Tag>
        ),
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/detail-subject?id=${record.id}`)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/update-subject?id=${record.id}`)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          {record.status === 'active' ? (
            <button
              type="button"
              onClick={() => handleChangeStatus(record, false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              title="Ẩn môn học"
            >
              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleChangeStatus(record, true)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20"
              title="Hiện môn học"
            >
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          )}
        </div>
      ),
    },
  ]

  const stats = [
    {
      label: 'Tổng số môn',
      value: String(pagination.totalCount),
      icon: 'book',
      iconColor: 'text-primary',
      sub: 'Trong hệ thống',
      subColor: 'text-slate-400',
    },
    {
      label: 'Đang hoạt động',
      value: String(subjects.filter((s) => s.status === 'active').length),
      icon: 'check_circle',
      iconColor: 'text-green-500',
      sub: `Trang hiện tại`,
      subColor: 'text-slate-400',
    },
    {
      label: 'Tổng giảng viên',
      value: String(subjects.reduce((a, s) => a + s.teachers, 0)),
      icon: 'group',
      iconColor: 'text-purple-500',
      sub: 'Trang hiện tại',
      subColor: 'text-slate-400',
    },
    {
      label: 'Tổng sinh viên',
      value: String(subjects.reduce((a, s) => a + s.students, 0)),
      icon: 'school',
      iconColor: 'text-orange-500',
      sub: 'Trang hiện tại',
      subColor: 'text-slate-400',
    },
  ]

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarAdmin activeItem="subjects" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Danh sách môn học
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Quản lý và cập nhật danh sách các môn học trong hệ thống thi tốt nghiệp.
                </p>
              </div>
              <Link to="/admin/create-subject">
                <Button
                  type="primary"
                  className="flex items-center justify-center gap-2 shadow-sm"
                  icon={<span className="material-symbols-outlined text-[20px]">add</span>}
                >
                  Thêm môn học
                </Button>
              </Link>
            </div>

            <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    page
                  </label>
                  <InputNumber
                    min={1}
                    value={params.page}
                    onChange={(v) => setParams((p) => ({ ...p, page: v ?? 1 }))}
                    className="w-20 rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    limit
                  </label>
                  <InputNumber
                    min={1}
                    max={100}
                    value={params.limit}
                    onChange={(v) => setParams((p) => ({ ...p, limit: v ?? 10 }))}
                    className="w-20 rounded-lg [&_.ant-input-number-input]:rounded-lg"
                  />
                </div>
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    search
                  </label>
                  <Input
                    placeholder="Tìm theo tên, mã, mô tả"
                    value={params.search}
                    onChange={(e) => setParams((p) => ({ ...p, search: e.target.value }))}
                    onPressEnter={() => setParams((p) => ({ ...p, page: 1 }))}
                    allowClear
                    className="rounded-lg border-slate-200 dark:border-slate-700 [&.ant-input]:rounded-lg"
                  />
                </div>
                <div className="w-44">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Lọc theo trạng thái
                  </label>
                  <Select
                    value={params.isActiveFilter || undefined}
                    placeholder="--"
                    options={IS_ACTIVE_OPTIONS}
                    onChange={(v) => setParams((p) => ({ ...p, isActiveFilter: (v ?? '') as '' | 'true' | 'false', page: 1 }))}
                    className="w-full [&_.ant-select-selector]:rounded-lg"
                  />
                </div>
                <div className="w-36">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    sortBy
                  </label>
                  <Select
                    value={params.sortBy}
                    options={SORT_BY_OPTIONS}
                    onChange={(v) => setParams((p) => ({ ...p, sortBy: v ?? 'createdAt' }))}
                    className="w-full [&_.ant-select-selector]:rounded-lg"
                  />
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    sortOrder
                  </label>
                  <Select
                    value={params.sortOrder}
                    options={SORT_ORDER_OPTIONS}
                    onChange={(v) => setParams((p) => ({ ...p, sortOrder: (v ?? 'desc') as 'asc' | 'desc' }))}
                    className="w-full [&_.ant-select-selector]:rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<SubjectRow>
                columns={columns}
                dataSource={subjects}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: pagination.currentPage,
                  pageSize: pagination.limit,
                  total: pagination.totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]} đến ${range[1]} của ${total} kết quả`,
                  onChange: (page, pageSize) => {
                    setParams((p) => ({ ...p, page, limit: pageSize ?? p.limit }))
                  },
                  className: 'px-6 py-4',
                }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50/50 [&_.ant-table-thead>tr>th]:px-6 [&_.ant-table-thead>tr>th]:py-4 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-6 [&_.ant-table-tbody>tr>td]:py-4 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-800 dark:[&_.ant-table-thead>tr>th]:bg-slate-800/50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <span className={`material-symbols-outlined text-xl ${stat.iconColor}`}>
                      {stat.icon}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className={`mt-2 flex items-center gap-1 text-xs ${stat.subColor}`}>
                    <span>{stat.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
