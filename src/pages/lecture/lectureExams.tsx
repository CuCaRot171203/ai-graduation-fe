import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import {
  getExams,
  getExcelTemplates,
  downloadExcelTemplate,
  createExam,
  getExamById,
  getExamQuestions,
  updateExam,
  deleteExam,
  submitExam,
  type Exam,
  type ExamQuestion,
  type ExamsPagination,
  type ExcelTemplate,
} from '../../apis/examsApi'
import { getSubjects } from '../../apis/subjectsApi'
import type { Subject } from '../../apis/subjectsApi'
import type { LoginUser } from '../../apis/authApi'

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

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'draft', label: 'Nháp' },
  { value: 'rejected', label: 'Từ chối' },
]

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

export default function LectureExams() {
  const navigate = useNavigate()
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [exams, setExams] = useState<Exam[]>([])
  const [pagination, setPagination] = useState<ExamsPagination>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templates, setTemplates] = useState<ExcelTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailExam, setDetailExam] = useState<Exam | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailQuestions, setDetailQuestions] = useState<ExamQuestion[]>([])
  const [detailQuestionsLoading, setDetailQuestionsLoading] = useState(false)
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false)
  const [expandedQuestionKeys, setExpandedQuestionKeys] = useState<React.Key[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [submitLoadingId, setSubmitLoadingId] = useState<number | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const openTemplateModal = useCallback(() => {
    setTemplateModalOpen(true)
    setTemplatesLoading(true)
    getExcelTemplates()
      .then((res) => setTemplates(res.data ?? []))
      .catch((err) => message.error(err?.message ?? 'Không tải được danh sách template'))
      .finally(() => setTemplatesLoading(false))
  }, [])

  const handleDownloadTemplate = (templateId: string) => {
    setDownloadingId(templateId)
    downloadExcelTemplate(templateId)
      .then(() => message.success('Đã tải template xuống.'))
      .catch((err) => message.error(err?.message ?? 'Tải template thất bại'))
      .finally(() => setDownloadingId(null))
  }

  useEffect(() => {
    getSubjects({ limit: 100 })
      .then((res) => setSubjects(res.data?.subjects ?? []))
      .catch(() => {})
  }, [])

  const openDetailModal = (examId: number) => {
    setDetailModalOpen(true)
    setDetailExam(null)
    setDetailQuestions([])
    setDetailLoading(true)
    setDetailQuestionsLoading(true)
    getExamById(examId)
      .then((res) => {
        const exam = res.data
        setDetailExam(exam)
        const embeddedQuestions = (exam as { questions?: ExamQuestion[] }).questions
        if (Array.isArray(embeddedQuestions) && embeddedQuestions.length >= 0) {
          setDetailQuestions(embeddedQuestions)
          setDetailQuestionsLoading(false)
          return
        }
        getExamQuestions(examId, { page: 1, limit: 50 })
          .then((qRes) => {
            const raw = qRes.data as { questions?: ExamQuestion[]; items?: ExamQuestion[] } | undefined
            const list = raw?.questions ?? raw?.items ?? []
            setDetailQuestions(Array.isArray(list) ? list : [])
          })
          .catch(() => setDetailQuestions([]))
          .finally(() => setDetailQuestionsLoading(false))
      })
      .catch((err) => {
        message.error(err?.message ?? 'Không tải được chi tiết đề thi')
        setDetailQuestionsLoading(false)
      })
      .finally(() => setDetailLoading(false))
  }

  const openEditModal = (record: Exam) => {
    setEditingExam(record)
    setEditModalOpen(true)
    editForm.setFieldsValue({
      title: record.title ?? record.name ?? '',
      description: (record as { description?: string }).description ?? '',
      durationMinutes: (record as { durationMinutes?: number }).durationMinutes ?? 45,
    })
  }

  const handleCreateSubmit = () => {
    createForm.validateFields().then((values) => {
      setCreateLoading(true)
      createExam({
        code: values.code,
        title: values.title,
        description: values.description,
        subjectId: values.subjectId,
        durationMinutes: values.durationMinutes,
      })
        .then(() => {
          message.success('Tạo đề thi thành công.')
          setCreateModalOpen(false)
          createForm.resetFields()
          fetchExams()
        })
        .catch((err) => message.error(err?.message ?? 'Tạo đề thi thất bại'))
        .finally(() => setCreateLoading(false))
    })
  }

  const handleEditSubmit = () => {
    if (!editingExam) return
    editForm.validateFields().then((values) => {
      setEditLoading(true)
      updateExam(editingExam.id, {
        title: values.title,
        description: values.description,
        durationMinutes: values.durationMinutes,
      })
        .then(() => {
          message.success('Cập nhật đề thi thành công.')
          setEditModalOpen(false)
          setEditingExam(null)
          fetchExams()
          if (detailExam?.id === editingExam.id) setDetailExam(null)
        })
        .catch((err) => message.error(err?.message ?? 'Cập nhật thất bại'))
        .finally(() => setEditLoading(false))
    })
  }

  const handleDelete = (record: Exam, onSuccess?: () => void) => {
    Modal.confirm({
      title: 'Xóa đề thi',
      content: `Bạn có chắc muốn xóa đề "${record.title ?? record.name ?? record.code ?? record.id}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () =>
        deleteExam(record.id)
          .then(() => {
            message.success('Đã xóa đề thi.')
            fetchExams()
            onSuccess?.()
          })
          .catch((err) => message.error(err?.message ?? 'Xóa thất bại')),
    })
  }

  const handleSubmitExam = (record: Exam) => {
    setSubmitLoadingId(record.id)
    submitExam(record.id)
      .then(() => {
        message.success('Đã gửi đề thi chờ duyệt.')
        fetchExams()
        if (detailExam?.id === record.id) getExamById(record.id).then((res) => setDetailExam(res.data))
      })
      .catch((err) => message.error(err?.message ?? 'Gửi duyệt thất bại'))
      .finally(() => setSubmitLoadingId(null))
  }

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
        const n = record.totalQuestions ?? record.questionCount
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
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">visibility</span>}
            title="Xem"
            onClick={() => openDetailModal(record.id)}
          />
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">edit</span>}
            title="Sửa"
            onClick={() => openEditModal(record)}
          />
          {(record.status === 'draft' || record.status === 'Draft') && (
            <Button
              type="text"
              size="small"
              className="!text-slate-500 hover:!text-green-600"
              icon={<span className="material-symbols-outlined text-lg">send</span>}
              title="Gửi duyệt"
              loading={submitLoadingId === record.id}
              onClick={() => handleSubmitExam(record)}
            />
          )}
          <Button
            type="text"
            size="small"
            danger
            className="!text-slate-500 hover:!text-red-500"
            icon={<span className="material-symbols-outlined text-lg">delete</span>}
            title="Xóa"
            onClick={() => handleDelete(record)}
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
      <SidebarLecture activeItem="exams" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchPlaceholder="Tìm kiếm đề thi, tài liệu..."
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Quản lý đề"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Danh sách đề thi
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Quản lý và tổ chức các bộ đề thi bạn được quyền truy cập.
              </p>
            </div>

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
                className="ml-auto flex items-center gap-2 rounded-lg"
                icon={<span className="material-symbols-outlined">download</span>}
                onClick={openTemplateModal}
              >
                Tải template
              </Button>
              <Button
                className="flex items-center gap-2 rounded-lg"
                icon={<span className="material-symbols-outlined">upload_file</span>}
              >
                Upload excel
              </Button>
              <Button
                type="primary"
                className="flex items-center gap-2 rounded-lg"
                icon={<span className="material-symbols-outlined text-xl">add</span>}
                onClick={() => setCreateModalOpen(true)}
              >
                Tạo đề mới
              </Button>
            </div>

            {/* Modal Tạo đề mới */}
            <Modal
              title="Tạo đề thi mới"
              open={createModalOpen}
              onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
              onOk={handleCreateSubmit}
              confirmLoading={createLoading}
              okText="Tạo đề"
              width={480}
              destroyOnHidden
            >
              <Form form={createForm} layout="vertical" className="mt-4">
                <Form.Item name="code" label="Mã đề" rules={[{ required: true, message: 'Nhập mã đề' }]}>
                  <Input placeholder="VD: VL12-001" />
                </Form.Item>
                <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Nhập tên đề thi' }]}>
                  <Input placeholder="VD: Đề kiểm tra Vật Lý 12 - Chương 1" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={2} placeholder="Mô tả ngắn về đề thi" />
                </Form.Item>
                <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Chọn môn học' }]}>
                  <Select
                    placeholder="Chọn môn học"
                    options={subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
                <Form.Item
                  name="durationMinutes"
                  label="Thời gian (phút)"
                  rules={[{ required: true, message: 'Nhập thời gian' }]}
                  initialValue={45}
                >
                  <InputNumber min={1} className="w-full" placeholder="45" />
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal Xem chi tiết đề thi */}
            <Modal
              title="Chi tiết đề thi"
              open={detailModalOpen}
              onCancel={() => { setDetailModalOpen(false); setDetailExam(null); setDetailQuestions([]) }}
              footer={
                detailExam ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                      danger
                      onClick={() => handleDelete(detailExam, () => setDetailModalOpen(false))}
                    >
                      Xóa
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                      {(detailExam.status === 'draft' || detailExam.status === 'Draft') && (
                        <Button
                          type="primary"
                          size="large"
                          className="!bg-green-600 hover:!bg-green-700"
                          loading={submitLoadingId === detailExam.id}
                          icon={<span className="material-symbols-outlined">send</span>}
                          onClick={() => handleSubmitExam(detailExam)}
                        >
                          Gửi duyệt đề
                        </Button>
                      )}
                      <Button onClick={() => { setDetailModalOpen(false); openEditModal(detailExam) }}>
                        Cập nhật
                      </Button>
                      <Button type="primary" onClick={() => setDetailModalOpen(false)}>
                        Đóng
                      </Button>
                    </div>
                  </div>
                ) : null
              }
              width={680}
              destroyOnHidden
            >
              {detailLoading ? (
                <div className="py-8 text-center text-slate-500">Đang tải...</div>
              ) : detailExam ? (
                <div className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Mã đề:</span> {detailExam.code ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Tên đề:</span> {detailExam.title ?? detailExam.name ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Mô tả:</span> {(detailExam as { description?: string }).description ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Môn học:</span> {detailExam.subject?.name ?? detailExam.subject?.code ?? (detailExam.subjectId ? `#${detailExam.subjectId}` : '—')}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Số câu:</span> {detailExam.totalQuestions ?? detailExam.questionCount ?? '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Thời gian:</span> {(detailExam as { durationMinutes?: number }).durationMinutes != null ? `${(detailExam as { durationMinutes?: number }).durationMinutes} phút` : '—'}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Trạng thái:</span> {renderStatus(detailExam.status)}</p>
                    <p><span className="font-medium text-slate-500 w-28 inline-block">Ngày tạo:</span> {detailExam.createdAt ? new Date(detailExam.createdAt).toLocaleString('vi-VN') : '—'}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    {detailQuestionsLoading ? (
                      <p className="text-sm text-slate-500">Đang tải câu hỏi...</p>
                    ) : detailQuestions.length === 0 ? (
                      <p className="text-sm text-slate-500">Chưa có câu hỏi nào.</p>
                    ) : (
                      <Button
                        type="default"
                        className="w-full gap-2"
                        icon={<span className="material-symbols-outlined">list</span>}
                        onClick={() => setQuestionsModalOpen(true)}
                      >
                        Xem danh sách câu hỏi ({detailQuestions.length})
                      </Button>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Button
                      type="primary"
                      size="large"
                      className="w-full gap-2 !py-4 text-base font-semibold"
                      icon={<span className="material-symbols-outlined text-2xl">add_circle</span>}
                      onClick={() => { setDetailModalOpen(false); navigate(`/lecture/exams/${detailExam.id}/add-questions`) }}
                    >
                      Thêm câu hỏi
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="py-4 text-slate-500">Không có dữ liệu.</p>
              )}
            </Modal>

            {/* Modal Danh sách câu hỏi - click hàng để mở/đóng nội dung đầy đủ */}
            <Modal
              title={`Danh sách câu hỏi (${detailQuestions.length})`}
              open={questionsModalOpen}
              onCancel={() => { setQuestionsModalOpen(false); setExpandedQuestionKeys([]) }}
              footer={null}
              width={720}
              destroyOnHidden
            >
              <Table
                size="small"
                rowKey={(r, i) => String((r as ExamQuestion).id ?? `q-${i}`)}
                dataSource={detailQuestions}
                pagination={false}
                expandable={{
                  expandedRowKeys: expandedQuestionKeys,
                  onExpand: (expanded, record) => {
                    const r = record as ExamQuestion
                    const idx = detailQuestions.indexOf(r)
                    const keyStr = String(r.id ?? `q-${idx}`)
                    setExpandedQuestionKeys((prev) =>
                      expanded ? [...prev, keyStr] : prev.filter((k) => k !== keyStr)
                    )
                  },
                  expandedRowRender: (record: ExamQuestion) => {
                    const content = stripHtmlFull((record.contentHtml ?? record.content_html) as string)
                    const options = (record.options ?? {}) as Record<string, string>
                    const correct = (record.correctAnswer ?? record.correct_answer) as string
                    const letters = ['A', 'B', 'C', 'D']
                    return (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                        <p className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                          <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                          {content}
                        </p>
                        <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          {letters.map((letter) => {
                            const text = options[letter] ?? '—'
                            const isCorrect = correct === letter
                            return (
                              <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                <span className="font-medium">{letter}.</span> {text}
                                {isCorrect && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                              </li>
                            )
                          })}
                        </ul>
                        <p className="mt-2 text-xs text-slate-500">
                          Bloom: {(record.bloomLevel ?? record.bloom_level) ?? '—'} · Topic: {formatTopic(record.topic as string)}
                        </p>
                      </div>
                    )
                  },
                }}
                onRow={(record, index) => ({
                  onClick: () => {
                    const r = record as ExamQuestion
                    const keyStr = String(r.id ?? `q-${index ?? detailQuestions.indexOf(r)}`)
                    setExpandedQuestionKeys((prev) =>
                      prev.includes(keyStr) ? prev.filter((k) => k !== keyStr) : [...prev, keyStr]
                    )
                  },
                  style: { cursor: 'pointer' },
                })}
                columns={[
                  { title: 'STT', key: 'stt', width: 52, render: (_: unknown, __: ExamQuestion, i: number) => i + 1 },
                  { title: 'Nội dung', key: 'content', ellipsis: true, render: (_: unknown, r: ExamQuestion) => stripHtml((r.contentHtml ?? r.content_html) as string) },
                  { title: 'Đáp án', key: 'correct', width: 76, render: (_: unknown, r: ExamQuestion) => (r.correctAnswer ?? r.correct_answer) ?? '—' },
                  { title: 'Bloom', key: 'bloom', width: 96, render: (_: unknown, r: ExamQuestion) => (r.bloomLevel ?? r.bloom_level) ?? '—' },
                  { title: 'Topic', key: 'topic', width: 100, render: (_: unknown, r: ExamQuestion) => formatTopic(r.topic as string) },
                ]}
              />
            </Modal>

            {/* Modal Cập nhật đề thi */}
            <Modal
              title="Cập nhật đề thi"
              open={editModalOpen}
              onCancel={() => { setEditModalOpen(false); setEditingExam(null) }}
              onOk={handleEditSubmit}
              confirmLoading={editLoading}
              okText="Lưu"
              width={480}
              destroyOnHidden
            >
              <Form form={editForm} layout="vertical" className="mt-4">
                <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Nhập tên đề thi' }]}>
                  <Input placeholder="Tên đề thi" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={2} placeholder="Mô tả" />
                </Form.Item>
                <Form.Item
                  name="durationMinutes"
                  label="Thời gian (phút)"
                  rules={[{ required: true, message: 'Nhập thời gian' }]}
                >
                  <InputNumber min={1} className="w-full" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Tải template Excel"
              open={templateModalOpen}
              onCancel={() => setTemplateModalOpen(false)}
              footer={null}
              width={560}
              destroyOnHidden
            >
              {templatesLoading ? (
                <div className="py-8 text-center text-slate-500">Đang tải danh sách template...</div>
              ) : (
                <div className="space-y-4">
                  {templates.length === 0 ? (
                    <p className="py-4 text-slate-500">Chưa có template nào.</p>
                  ) : (
                    templates.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {t.description}
                            </p>
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                              {t.columnCount} cột · Bắt buộc: {t.requiredColumns.join(', ')}
                            </p>
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            loading={downloadingId === t.id}
                            className="shrink-0"
                            icon={<span className="material-symbols-outlined text-lg">download</span>}
                            onClick={() => handleDownloadTemplate(t.id)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Modal>

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
