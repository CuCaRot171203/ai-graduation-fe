import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Modal, Select, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import {
  getAdminExams,
  getAdminExamsPending,
  getAdminExamReview,
  approveAdminExam,
  rejectAdminExam,
  type AdminExam,
  type AdminExamsPagination,
  type AdminExamReviewResponse,
  type AdminReviewQuestion,
} from '../../apis/adminApi'
import { getSubjects } from '../../apis/subjectsApi'
import type { Subject } from '../../apis/subjectsApi'

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

function stripHtml(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || '—'
}

function stripHtmlFull(html: string | undefined): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

function formatTopic(topic: string | undefined): string {
  if (!topic) return '—'
  return topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const DEFAULT_ALL_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  status: '',
  subjectId: undefined as number | undefined,
}
const DEFAULT_PENDING_PARAMS = { page: 1, limit: 10, subjectId: undefined as number | undefined }

export default function ExamDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [allParams, setAllParams] = useState(DEFAULT_ALL_PARAMS)
  const [pendingParams, setPendingParams] = useState(DEFAULT_PENDING_PARAMS)
  const [exams, setExams] = useState<AdminExam[]>([])
  const [pagination, setPagination] = useState<AdminExamsPagination>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewData, setReviewData] = useState<AdminExamReviewResponse['data'] | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [expandedReviewKeys, setExpandedReviewKeys] = useState<(string | number)[]>([])

  useEffect(() => {
    getSubjects({ limit: 100 })
      .then((res) => setSubjects(res.data?.subjects ?? []))
      .catch(() => {})
  }, [])

  const fetchAll = useCallback(() => {
    setLoading(true)
    getAdminExams({
      page: allParams.page,
      limit: allParams.limit,
      search: allParams.search || undefined,
      status: allParams.status || undefined,
      subjectId: allParams.subjectId,
    })
      .then((res) => {
        setExams(res.data?.exams ?? [])
        if (res.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách đề thi'))
      .finally(() => setLoading(false))
  }, [allParams.page, allParams.limit, allParams.search, allParams.status, allParams.subjectId])

  const fetchPending = useCallback(() => {
    setLoading(true)
    getAdminExamsPending({
      page: pendingParams.page,
      limit: pendingParams.limit,
      subjectId: pendingParams.subjectId,
    })
      .then((res) => {
        setExams(res.data?.exams ?? [])
        if (res.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải đề chờ duyệt'))
      .finally(() => setLoading(false))
  }, [pendingParams.page, pendingParams.limit, pendingParams.subjectId])

  useEffect(() => {
    if (activeTab === 'all') fetchAll()
    else fetchPending()
  }, [activeTab, fetchAll, fetchPending])

  const openReview = (examId: number) => {
    setReviewModalOpen(true)
    setReviewData(null)
    setReviewLoading(true)
    setExpandedReviewKeys([])
    getAdminExamReview(examId)
      .then((res) => setReviewData(res.data))
      .catch((err) => {
        message.error(err?.message ?? 'Không tải được chi tiết đề')
        setReviewModalOpen(false)
      })
      .finally(() => setReviewLoading(false))
  }

  const handleApprove = () => {
    if (!reviewData?.exam?.id) return
    setApproveLoading(true)
    approveAdminExam(reviewData.exam.id)
      .then(() => {
        message.success('Đã duyệt đề thi.')
        setReviewModalOpen(false)
        setReviewData(null)
        if (activeTab === 'pending') fetchPending()
        else fetchAll()
      })
      .catch((err) => message.error(err?.message ?? 'Duyệt thất bại'))
      .finally(() => setApproveLoading(false))
  }

  const openRejectModal = () => setRejectModalOpen(true)
  const handleRejectSubmit = () => {
    const reason = rejectReason.trim()
    if (reason.length < 3) {
      message.warning('Lý do từ chối phải có ít nhất 3 ký tự.')
      return
    }
    if (!reviewData?.exam?.id) return
    setRejectLoading(true)
    rejectAdminExam(reviewData.exam.id, { reason })
      .then(() => {
        message.success('Đã từ chối đề thi.')
        setRejectModalOpen(false)
        setRejectReason('')
        setReviewModalOpen(false)
        setReviewData(null)
        if (activeTab === 'pending') fetchPending()
        else fetchAll()
      })
      .catch((err) => message.error(err?.message ?? 'Từ chối thất bại'))
      .finally(() => setRejectLoading(false))
  }

  const renderStatus = (status: string | undefined) => {
    if (!status) return <Tag>—</Tag>
    const config = STATUS_TAG[status] ?? { color: 'default', label: status }
    return <Tag color={config.color}>{config.label}</Tag>
  }

  const getCreatorName = (record: AdminExam) => {
    const raw = record.creator ?? (record as { createdBy?: { fullName?: string } }).createdBy
    if (typeof raw === 'string') return raw
    return (raw && typeof raw === 'object' && 'fullName' in raw ? (raw as { fullName?: string }).fullName : undefined) ?? '—'
  }

  const columns: ColumnsType<AdminExam> = [
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
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Mã đề: {record.code}</div>
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
          {record.subject?.name ?? record.subject?.code ?? (record.subjectId ? `#${record.subjectId}` : '—')}
        </span>
      ),
    },
    {
      title: 'SỐ CÂU',
      key: 'questions',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const n = record.totalQuestions ?? record.questionCount ?? (record as { questionCount?: number }).questionCount
        return <span className="text-slate-600 dark:text-slate-300">{n != null ? n : '—'}</span>
      },
    },
    {
      title: 'NGƯỜI TẠO',
      key: 'creator',
      width: 140,
      render: (_, record) => {
        const name = getCreatorName(record)
        const initial = (typeof name === 'string' && name && name !== '—' ? name[0] : '?').toUpperCase()
        return (
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              {initial}
            </span>
            {name}
          </span>
        )
      },
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 110,
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
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          className="gap-1"
          icon={<span className="material-symbols-outlined text-lg">visibility</span>}
          onClick={() => openReview(record.id)}
        >
          {activeTab === 'pending' ? 'Duyệt' : 'Xem'}
        </Button>
      ),
    },
  ]

  const currentParams = activeTab === 'all' ? allParams : pendingParams
  const setCurrentParams = activeTab === 'all' ? setAllParams : setPendingParams
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Quản lý đề thi
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Xem tất cả đề thi và duyệt đề chờ phê duyệt.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Tất cả đề thi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Đề chờ duyệt
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {activeTab === 'all' && (
                <Input
                  placeholder="Tìm kiếm đề thi..."
                  value={allParams.search}
                  onChange={(e) => setAllParams((p) => ({ ...p, search: e.target.value }))}
                  onPressEnter={() => setAllParams((p) => ({ ...p, page: 1 }))}
                  allowClear
                  className="max-w-xs rounded-lg"
                  prefix={<span className="material-symbols-outlined text-slate-400">search</span>}
                />
              )}
              <Select
                placeholder="Môn học"
                value={currentParams.subjectId ?? undefined}
                onChange={(v) => setCurrentParams((p) => ({ ...p, subjectId: v, page: 1 }))}
                options={[{ value: undefined, label: 'Tất cả môn' }, ...subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))]}
                className="w-48 [&_.ant-select-selector]:rounded-lg"
                allowClear
              />
              {activeTab === 'all' && (
                <Select
                  placeholder="Trạng thái"
                  value={allParams.status || undefined}
                  onChange={(v) => setAllParams((p) => ({ ...p, status: v ?? '', page: 1 }))}
                  options={STATUS_OPTIONS}
                  className="w-36 [&_.ant-select-selector]:rounded-lg"
                />
              )}
              <Button
                type="text"
                size="middle"
                className="!text-slate-500 hover:!text-slate-700 dark:hover:!text-slate-300"
                icon={<span className="material-symbols-outlined">refresh</span>}
                onClick={activeTab === 'all' ? fetchAll : fetchPending}
                title="Làm mới"
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<AdminExam>
                columns={columns}
                dataSource={exams.map((e) => ({ ...e, key: e.id }))}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="middle"
                scroll={{ x: 1000 }}
                locale={{ emptyText: activeTab === 'pending' ? 'Không có đề chờ duyệt.' : 'Chưa có đề thi nào.' }}
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
                  onClick={() => setCurrentParams((p) => ({ ...p, page: p.page - 1 }))}
                />
                {Array.from({ length: Math.min(5, Math.max(1, pagination.totalPages)) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      type={pagination.currentPage === page ? 'primary' : 'text'}
                      size="small"
                      className="min-w-8"
                      onClick={() => setCurrentParams((p) => ({ ...p, page }))}
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
                      onClick={() => setCurrentParams((p) => ({ ...p, page: pagination.totalPages }))}
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
                  onClick={() => setCurrentParams((p) => ({ ...p, page: p.page + 1 }))}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal xem chi tiết / duyệt đề */}
      <Modal
        title={reviewData ? `Chi tiết đề: ${reviewData.exam?.title ?? reviewData.exam?.code ?? ''}` : 'Chi tiết đề thi'}
        open={reviewModalOpen}
        onCancel={() => { setReviewModalOpen(false); setReviewData(null); setRejectModalOpen(false); setRejectReason('') }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {reviewLoading ? (
          <div className="py-12 text-center text-slate-500">Đang tải...</div>
        ) : reviewData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><span className="font-medium text-slate-500 w-24 inline-block">Mã đề:</span> {reviewData.exam?.code ?? '—'}</p>
              <p><span className="font-medium text-slate-500 w-24 inline-block">Tên:</span> {reviewData.exam?.title ?? reviewData.exam?.name ?? '—'}</p>
              <p><span className="font-medium text-slate-500 w-24 inline-block">Môn:</span> {reviewData.exam?.subject?.name ?? '—'}</p>
              <p><span className="font-medium text-slate-500 w-24 inline-block">Số câu:</span> {reviewData.stats?.totalQuestions ?? reviewData.exam?.totalQuestions ?? '—'}</p>
              <p><span className="font-medium text-slate-500 w-24 inline-block">Thời gian:</span> {reviewData.exam?.durationMinutes != null ? `${reviewData.exam.durationMinutes} phút` : '—'}</p>
              <p><span className="font-medium text-slate-500 w-24 inline-block">Người tạo:</span> {getCreatorName(reviewData.exam)}</p>
            </div>
            {reviewData.stats && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                <p className="font-medium text-slate-700 dark:text-slate-300">Thống kê</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Bloom: {Object.entries(reviewData.stats.byBloomLevel ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}</p>
                <p className="text-slate-600 dark:text-slate-400">Topic: {Object.entries(reviewData.stats.byTopic ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}</p>
                {reviewData.stats.aiGenerated != null && <p className="text-slate-600 dark:text-slate-400">Câu AI: {reviewData.stats.aiGenerated}</p>}
              </div>
            )}
            <div>
              <p className="mb-2 font-medium text-slate-700 dark:text-slate-300">Danh sách câu hỏi ({reviewData.exam?.questions?.length ?? 0})</p>
              {reviewData.exam?.questions && reviewData.exam.questions.length > 0 ? (
                <div className="max-h-72 overflow-y-auto rounded border border-slate-200 dark:border-slate-700">
                  <Table<AdminReviewQuestion>
                    size="small"
                    rowKey="id"
                    dataSource={reviewData.exam.questions}
                    pagination={false}
                    expandable={{
                      expandedRowKeys: expandedReviewKeys,
                      onExpand: (expanded, record) => {
                        setExpandedReviewKeys((prev) =>
                          expanded ? [...prev, record.id] : prev.filter((k) => k !== record.id)
                        )
                      },
                      expandedRowRender: (record: AdminReviewQuestion) => {
                        const content = stripHtmlFull(record.contentHtml)
                        const options = record.options ?? {}
                        const correct = record.correctAnswer
                        return (
                          <div className="rounded border border-slate-200 bg-slate-50/80 p-3 text-left text-sm dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="mb-2 font-medium text-slate-700 dark:text-slate-200">{content}</p>
                            {['A', 'B', 'C', 'D'].map((letter) => {
                              const text = options[letter] ?? '—'
                              const isCorrect = correct === letter
                              return (
                                <p key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                  {letter}. {text} {isCorrect && '(Đáp án đúng)'}
                                </p>
                              )
                            })}
                          </div>
                        )
                      },
                    }}
                    columns={[
                      { title: 'STT', key: 'stt', width: 50, render: (_, __, i) => i + 1 },
                      { title: 'Nội dung', key: 'content', ellipsis: true, render: (_, r) => stripHtml(r.contentHtml) },
                      { title: 'Đáp án', key: 'correct', width: 70, render: (_, r) => r.correctAnswer },
                      { title: 'Bloom', key: 'bloom', width: 90, render: (_, r) => r.bloomLevel },
                      { title: 'Topic', key: 'topic', width: 100, render: (_, r) => formatTopic(r.topic) },
                    ]}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">Chưa có câu hỏi.</p>
              )}
            </div>
            {reviewData.exam?.status === 'pending' && (
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button danger onClick={openRejectModal} icon={<span className="material-symbols-outlined">close</span>}>
                  Từ chối
                </Button>
                <Button type="primary" loading={approveLoading} onClick={handleApprove} icon={<span className="material-symbols-outlined">check_circle</span>}>
                  Duyệt đề
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Modal nhập lý do từ chối */}
      <Modal
        title="Từ chối đề thi"
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => { setRejectModalOpen(false); setRejectReason('') }}
        okText="Gửi từ chối"
        cancelText="Hủy"
        confirmLoading={rejectLoading}
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Nhập lý do từ chối (tối thiểu 3 ký tự):</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ví dụ: Nội dung chưa phù hợp chương trình, thiếu câu hỏi vận dụng..."
          minLength={3}
          showCount
        />
      </Modal>
    </div>
  )
}
