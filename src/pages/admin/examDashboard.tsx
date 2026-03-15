import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Select, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getExams, type Exam, type ExamsPagination } from '../../apis/examsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDtoDe4KAOqKQR4ZkYjZLecKqShWOJZek1cA_-RjD9z-nzsBCcYXMobbAsyi6LHNdepq1te0vpJtFVaSJ-OBW_g1fwMn5Qjl0wzLWaCFdoF7nfD-K4UYvE4xXESYTj2XETTyznP3YboVFVZLiPKbk_QCO3mXoi1V5wtVvidHWMZArMrbuPmnDwd871y_PIgsfOE1PddVWrrgCU4dUCqlj2d-7COYui0zhPVpcV1K3vtgi26ptvo_XoGdNCOmz6nMeQdB7ZyM-PIlp1Z'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'draft', label: 'Nháp' },
  { value: 'rejected', label: 'Từ chối' },
]

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  approved: { color: 'green', label: 'Đã duyệt' },
  Approved: { color: 'green', label: 'Đã duyệt' },
  pending: { color: 'gold', label: 'Chờ duyệt' },
  Pending: { color: 'gold', label: 'Chờ duyệt' },
  draft: { color: 'default', label: 'Nháp' },
  Draft: { color: 'default', label: 'Nháp' },
  rejected: { color: 'red', label: 'Từ chối' },
  Rejected: { color: 'red', label: 'Từ chối' },
}

const DEFAULT_PARAMS = { page: 1, limit: 10, search: '', status: '', subjectId: undefined as number | undefined }

export default function ExamDashboard() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [exams, setExams] = useState<Exam[]>([])
  const [pagination, setPagination] = useState<ExamsPagination>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)

  const fetchExams = useCallback(() => {
    setLoading(true)
    getExams({ page: params.page, limit: params.limit })
      .then((res) => {
        setExams(res.data?.exams ?? [])
        if (res.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => {
        message.error(err?.message ?? 'Lỗi tải danh sách đề thi')
      })
      .finally(() => setLoading(false))
  }, [params.page, params.limit])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const renderStatus = (status: string | undefined) => {
    if (!status) return <Tag>—</Tag>
    const config = STATUS_TAG[status] ?? { color: 'default', label: status }
    return <Tag color={config.color}>{config.label}</Tag>
  }

  const columns: ColumnsType<Exam> = [
    {
      title: 'TÊN ĐỀ',
      key: 'title',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {record.title ?? record.name ?? `Đề #${record.id}`}
          </div>
          {record.code && (
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Mã đề: #{record.code}</div>
          )}
        </div>
      ),
    },
    {
      title: 'MÔN HỌC',
      key: 'subject',
      width: 120,
      render: (_, record) => (
        <span className="text-slate-600 dark:text-slate-300">
          {record.subject?.name ?? record.subject?.code ?? (record.subjectId ? `Môn #${record.subjectId}` : '—')}
        </span>
      ),
    },
    {
      title: 'SỐ CÂU HỎI',
      key: 'questions',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const n = record.totalQuestions ?? record.questionCount ?? (record as { totalQuestions?: number }).totalQuestions
        return <span className="text-slate-600 dark:text-slate-300">{n != null ? `${n} câu` : '—'}</span>
      },
    },
    {
      title: 'NGƯỜI TẠO',
      key: 'creator',
      width: 160,
      render: (_, record) => {
        const raw = record.creator ?? (record as { createdBy?: string | { id?: number; fullName?: string } }).createdBy
        const name =
          typeof raw === 'string'
            ? raw
            : (raw && typeof raw === 'object' && 'fullName' in raw
                ? (raw as { fullName?: string }).fullName
                : undefined) ?? '—'
        const initial = (typeof name === 'string' && name && name !== '—' ? name[0] : '?').toUpperCase()
        return (
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              {initial}
            </span>
            {name || '—'}
          </span>
        )
      },
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 120,
      render: (_, record) => renderStatus(record.status),
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => (
        <span className="text-slate-500 dark:text-slate-400">
          {v ? new Date(v).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">visibility</span>}
            title="Xem"
          />
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">edit</span>}
            title="Sửa"
          />
          <Button
            type="text"
            size="small"
            danger
            className="!text-slate-500 hover:!text-red-500"
            icon={<span className="material-symbols-outlined text-lg">delete</span>}
            title="Xóa"
          />
        </div>
      ),
    },
  ]

  const total = pagination.totalCount
  const from = total === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1
  const to = Math.min(pagination.currentPage * pagination.limit, total)

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarAdmin activeItem="exams" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          searchPlaceholder="Tìm kiếm hệ thống..."
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {/* Title & description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Danh sách đề thi
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Quản lý và tổ chức các bộ đề thi tốt nghiệp của bạn.
              </p>
            </div>

            {/* Filters & actions */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Input
                placeholder="Tìm kiếm đề thi..."
                value={params.search}
                onChange={(e) => setParams((p) => ({ ...p, search: e.target.value }))}
                onPressEnter={() => setParams((p) => ({ ...p, page: 1 }))}
                allowClear
                className="max-w-xs rounded-lg"
                prefix={<span className="material-symbols-outlined text-slate-400">search</span>}
              />
              <Select
                placeholder="Môn học"
                value={params.subjectId ?? undefined}
                onChange={(v) => setParams((p) => ({ ...p, subjectId: v, page: 1 }))}
                options={[]}
                className="w-40 [&_.ant-select-selector]:rounded-lg"
                allowClear
              />
              <Select
                placeholder="Trạng thái"
                value={params.status || undefined}
                onChange={(v) => setParams((p) => ({ ...p, status: v ?? '', page: 1 }))}
                options={STATUS_OPTIONS}
                className="w-36 [&_.ant-select-selector]:rounded-lg"
              />
              <Button
                type="text"
                size="middle"
                className="!text-slate-500 hover:!text-slate-700 dark:hover:!text-slate-300"
                icon={<span className="material-symbols-outlined">tune</span>}
                title="Bộ lọc"
              />
              <Button
                type="text"
                size="middle"
                className="!text-slate-500 hover:!text-slate-700 dark:hover:!text-slate-300"
                icon={<span className="material-symbols-outlined">refresh</span>}
                onClick={fetchExams}
                title="Làm mới"
              />
              <Button
                type="primary"
                className="ml-auto flex items-center gap-2 rounded-lg"
                icon={<span className="material-symbols-outlined text-xl">add</span>}
              >
                Tạo đề mới
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<Exam>
                columns={columns}
                dataSource={exams.map((e) => ({ ...e, key: e.id }))}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="middle"
                scroll={{ x: 1000 }}
                locale={{ emptyText: 'Chưa có đề thi nào.' }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:px-4 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-4 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-700 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/80 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hiển thị {from}-{to} trong số {total} đề thi
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="text"
                  size="small"
                  disabled={pagination.currentPage <= 1}
                  icon={<span className="material-symbols-outlined text-lg">chevron_left</span>}
                  onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                />
                {Array.from({ length: Math.min(5, Math.max(1, pagination.totalPages)) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      type={pagination.currentPage === page ? 'primary' : 'text'}
                      size="small"
                      className="min-w-8"
                      onClick={() => setParams((p) => ({ ...p, page }))}
                    >
                      {page}
                    </Button>
                  )
                })}
                {pagination.totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <Button
                      type="text"
                      size="small"
                      className="min-w-8"
                      onClick={() => setParams((p) => ({ ...p, page: pagination.totalPages }))}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
                <Button
                  type="text"
                  size="small"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  icon={<span className="material-symbols-outlined text-lg">chevron_right</span>}
                  onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
