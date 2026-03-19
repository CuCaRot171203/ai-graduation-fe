import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Modal, Select, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import { deleteAiClass, getAiClasses, updateAiClass, type AiClassItem } from '../../apis/aiExamApi'
import { getTeacherSubjectsFromAiBackend } from '../../apis/aiExamApi'
import type { Subject } from '../../apis/subjectsApi'
import { approveEnrollment, getPendingEnrollments, type EnrollmentItem } from '../../apis/aiExamApi'

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

export default function LectureClasses() {
  const navigate = useNavigate()
  const teacherId = getStoredUser()?.id ?? null

  const [rows, setRows] = useState<AiClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined)
  const [schoolYear, setSchoolYear] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<AiClassItem | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editSubjectId, setEditSubjectId] = useState<number | undefined>(undefined)
  const [editIsActive, setEditIsActive] = useState(true)
  const [pendingRows, setPendingRows] = useState<EnrollmentItem[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [pendingPage, setPendingPage] = useState(1)
  const [pendingLimit, setPendingLimit] = useState(10)
  const [pendingTotal, setPendingTotal] = useState(0)

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
    [subjects]
  )

  const fetchSubjects = useCallback(() => {
    if (!teacherId) return
    setSubjectsLoading(true)
    getTeacherSubjectsFromAiBackend(teacherId)
      .then((res) => setSubjects(res.data?.subjects ?? []))
      .catch(() => setSubjects([]))
      .finally(() => setSubjectsLoading(false))
  }, [teacherId])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const fetchClasses = useCallback(() => {
    if (!teacherId) return
    setLoading(true)
    getAiClasses({
      page,
      limit,
      search: search.trim() || undefined,
      teacherId, // giảng viên chỉ xem lớp của mình
      subjectId,
      schoolYear: schoolYear.trim() || undefined,
      isActive,
    })
      .then((res) => {
        setRows(res.data?.classes ?? [])
        setTotal(res.data?.pagination?.totalCount ?? 0)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách lớp'))
      .finally(() => setLoading(false))
  }, [teacherId, page, limit, search, subjectId, schoolYear, isActive])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const fetchPending = useCallback(() => {
    if (!teacherId) return
    setPendingLoading(true)
    getPendingEnrollments({
      page: pendingPage,
      limit: pendingLimit,
    })
      .then((res) => {
        setPendingRows(res.data?.enrollments ?? [])
        setPendingTotal(res.data?.pagination?.totalCount ?? 0)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách chờ duyệt'))
      .finally(() => setPendingLoading(false))
  }, [teacherId, pendingPage, pendingLimit])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const openEdit = (record: AiClassItem) => {
    setEditing(record)
    setEditName(record.name)
    setEditDesc(record.description ?? '')
    setEditYear(record.schoolYear)
    setEditSubjectId(record.subjectId)
    setEditIsActive(!!record.isActive)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editing || !teacherId) return
    const name = editName.trim()
    if (!name) {
      message.error('Vui lòng nhập tên lớp.')
      return
    }
    if (!editYear.trim()) {
      message.error('Vui lòng nhập năm học.')
      return
    }
    if (!editSubjectId) {
      message.error('Vui lòng chọn môn học.')
      return
    }
    try {
      setEditSaving(true)
      await updateAiClass(editing.id, {
        name,
        description: editDesc.trim() || undefined,
        schoolYear: editYear.trim(),
        teacherId,
        subjectId: editSubjectId,
      })
      message.success('Đã cập nhật lớp học.')
      setEditOpen(false)
      setEditing(null)
      fetchClasses()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = (record: AiClassItem) => {
    Modal.confirm({
      title: 'Xóa lớp học',
      content: `Bạn có chắc muốn xóa lớp "${record.name}" (${record.code})?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () =>
        deleteAiClass(record.id)
          .then(() => {
            message.success('Đã xóa lớp học.')
            fetchClasses()
          })
          .catch((err) => message.error(err?.message ?? 'Xóa thất bại')),
    })
  }

  const columns: ColumnsType<AiClassItem> = [
    {
      title: 'LỚP',
      key: 'name',
      render: (_, r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{r.name}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Mã: {r.code}</div>
        </div>
      ),
    },
    {
      title: 'MÔN',
      key: 'subject',
      width: 160,
      render: (_, r) => (
        <span className="text-slate-600 dark:text-slate-300">{r.subject?.code ? `${r.subject.code} - ${r.subject.name}` : `#${r.subjectId}`}</span>
      ),
    },
    {
      title: 'NĂM HỌC',
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      width: 110,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || '—'}</span>,
    },
    {
      title: 'HS',
      key: 'studentCount',
      width: 70,
      align: 'center',
      render: (_, r) => <span className="text-slate-600 dark:text-slate-300">{r.studentCount ?? 0}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      key: 'active',
      width: 110,
      render: (_, r) => (r.isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng</Tag>),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      width: 190,
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">visibility</span>}
            title="Xem chi tiết"
            onClick={() => navigate(`/lecture/classes/${r.id}`)}
          />
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">edit</span>}
            title="Cập nhật lớp học"
            onClick={() => openEdit(r)}
          />
          <Button
            type="text"
            size="small"
            danger
            className="!text-slate-500 hover:!text-red-500"
            icon={<span className="material-symbols-outlined text-lg">delete</span>}
            title="Xóa lớp học"
            onClick={() => handleDelete(r)}
          />
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-green-600"
            icon={<span className="material-symbols-outlined text-lg">bar_chart</span>}
            title="Xem kết quả lớp"
            onClick={() => navigate(`/lecture/classes/${r.id}/results`)}
          />
          <Button
            type="text"
            size="small"
            className="!text-slate-500 hover:!text-primary"
            icon={<span className="material-symbols-outlined text-lg">assignment</span>}
            title="Giao bài"
            onClick={() => navigate(`/lecture/assignments?classId=${r.id}`)}
          />
        </div>
      ),
    },
  ]

  const pendingColumns: ColumnsType<EnrollmentItem> = [
    {
      title: 'HỌC SINH',
      key: 'student',
      render: (_, r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{r.student?.fullName ?? `#${r.student?.id}`}</div>
          <div className="text-xs text-slate-500">{r.student?.email ?? ''}</div>
        </div>
      ),
    },
    {
      title: 'LỚP',
      key: 'class',
      width: 220,
      render: (_, r) => <span>{r.class ? `${r.class.code} - ${r.class.name}` : '—'}</span>,
    },
    {
      title: 'THỜI GIAN ĐK',
      key: 'enrolledAt',
      width: 180,
      render: (_, r) => <span>{r.enrolledAt ? new Date(r.enrolledAt).toLocaleString('vi-VN') : '—'}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 120,
      render: (_, r) => <Tag color="gold">{r.status}</Tag>,
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          onClick={async () => {
            try {
              await approveEnrollment(r.id)
              message.success(`Đã duyệt ${r.student?.fullName ?? 'học sinh'}.`)
              fetchPending()
              fetchClasses()
            } catch (err) {
              message.error(err instanceof Error ? err.message : 'Duyệt thất bại')
            }
          }}
        >
          Duyệt
        </Button>
      ),
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
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Quản lý lớp</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Danh sách lớp học của bạn.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Lớp học"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Danh sách lớp học</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Lọc và quản lý lớp học theo môn, năm học, trạng thái.</p>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Input
                placeholder="Tìm theo tên hoặc mã lớp"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={() => setPage(1)}
                allowClear
                className="max-w-xs rounded-lg"
                prefix={<span className="material-symbols-outlined text-slate-400">search</span>}
              />
              <Select
                placeholder="Môn học"
                value={subjectId}
                onChange={(v) => {
                  setSubjectId(v)
                  setPage(1)
                }}
                options={subjectOptions}
                loading={subjectsLoading}
                className="w-56 [&_.ant-select-selector]:rounded-lg"
                allowClear
                showSearch
                optionFilterProp="label"
              />
              <Input
                placeholder="Năm học (VD: 2025-2026)"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                onPressEnter={() => setPage(1)}
                className="w-48 rounded-lg"
              />
              <Select
                placeholder="Trạng thái"
                value={isActive === undefined ? undefined : String(isActive)}
                onChange={(v) => {
                  if (v === undefined) setIsActive(undefined)
                  else setIsActive(v === 'true')
                  setPage(1)
                }}
                allowClear
                options={[
                  { value: 'true', label: 'Đang hoạt động' },
                  { value: 'false', label: 'Ngừng hoạt động' },
                ]}
                className="w-28 [&_.ant-select-selector]:rounded-lg"
              />
              <Button
                type="text"
                size="middle"
                className="!text-slate-500 hover:!text-slate-700 dark:hover:!text-slate-300"
                icon={<span className="material-symbols-outlined">refresh</span>}
                onClick={() => {
                  setPage(1)
                  fetchClasses()
                }}
                title="Làm mới"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<AiClassItem>
                columns={columns}
                dataSource={rows.map((c) => ({ ...c, key: c.id }))}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (t) => `Tổng ${t} lớp`,
                  onChange: (p, ps) => {
                    setPage(p)
                    if (ps !== limit) {
                      setLimit(ps)
                      setPage(1)
                    }
                  },
                }}
                size="middle"
                locale={{ emptyText: 'Chưa có lớp học nào.' }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:px-4 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-4 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-700 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/80 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Học sinh chờ duyệt vào lớp</h3>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Danh sách yêu cầu đăng ký lớp đang ở trạng thái pending.</p>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<EnrollmentItem>
                columns={pendingColumns}
                dataSource={pendingRows.map((e) => ({ ...e, key: e.id }))}
                rowKey="id"
                loading={pendingLoading}
                pagination={{
                  current: pendingPage,
                  pageSize: pendingLimit,
                  total: pendingTotal,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (t) => `Tổng ${t} yêu cầu`,
                  onChange: (p, ps) => {
                    setPendingPage(p)
                    if (ps !== pendingLimit) {
                      setPendingLimit(ps)
                      setPendingPage(1)
                    }
                  },
                }}
                locale={{ emptyText: 'Không có yêu cầu pending.' }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:px-4 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-4 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-700 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/80 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </div>
          </div>
        </div>
      </main>

      <Modal
        title="Cập nhật lớp học"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false)
          setEditing(null)
        }}
        onOk={handleEditSave}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={editSaving}
        width={560}
        destroyOnHidden
      >
        <div className="mt-3 space-y-3">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tên lớp</div>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Tên lớp" className="rounded-xl" />
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</div>
            <Input.TextArea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} placeholder="Mô tả" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Năm học</div>
              <Input value={editYear} onChange={(e) => setEditYear(e.target.value)} placeholder="2025-2026" className="rounded-xl" />
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Môn học</div>
              <Select
                value={editSubjectId}
                onChange={(v) => setEditSubjectId(v)}
                options={subjectOptions}
                loading={subjectsLoading}
                className="w-full [&_.ant-select-selector]:rounded-xl"
                placeholder="Chọn môn học"
                showSearch
                optionFilterProp="label"
              />
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</div>
            <Select
              value={String(editIsActive)}
              onChange={(v) => setEditIsActive(v === 'true')}
              options={[
                { value: 'true', label: 'Đang hoạt động' },
                { value: 'false', label: 'Ngừng' },
              ]}
              className="w-full [&_.ant-select-selector]:rounded-xl"
            />
            <p className="mt-2 text-xs text-slate-500">Lưu ý: API update hiện chưa có trường isActive, UI đang chỉ hiển thị để tham khảo.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

