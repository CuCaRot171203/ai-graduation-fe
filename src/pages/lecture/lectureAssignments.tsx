import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Modal, Popconfirm, Select, Table, Tag, Tooltip, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import {
  deleteAiAssignment,
  getAiAssignments,
  getAiClasses,
  updateAiAssignment,
  type AiAssignmentDetail,
  type AiClassItem,
} from '../../apis/aiExamApi'

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

export default function LectureAssignments() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const teacherId = user?.id
  const [searchParams] = useSearchParams()
  const classIdQuery = searchParams.get('classId')
  const query = classIdQuery ? `?classId=${encodeURIComponent(classIdQuery)}` : ''

  const [classes, setClasses] = useState<AiClassItem[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    classIdQuery && Number.isFinite(Number(classIdQuery)) ? Number(classIdQuery) : undefined
  )
  const [rows, setRows] = useState<AiAssignmentDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<AiAssignmentDetail | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDuration, setEditDuration] = useState(60)
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    if (!teacherId) return
    getAiClasses({ page: 1, limit: 100, teacherId })
      .then((res) => setClasses(res.data?.classes ?? []))
      .catch(() => setClasses([]))
  }, [teacherId])

  useEffect(() => {
    if (!teacherId) return
    setLoading(true)
    getAiAssignments({
      classId: selectedClassId,
      page,
      limit,
    })
      .then((res) => {
        setRows(res.data?.assignments ?? [])
        setTotal(res.data?.pagination?.total ?? 0)
      })
      .catch((err) => message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách bài giao'))
      .finally(() => setLoading(false))
  }, [teacherId, selectedClassId, page, limit])

  const classOptions = useMemo(
    () => classes.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
    [classes]
  )

  const openEdit = (record: AiAssignmentDetail) => {
    setEditing(record)
    setEditTitle(record.title ?? '')
    setEditDescription(record.description ?? '')
    setEditDuration(record.durationMinutes ?? 60)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editing) return
    if (!editTitle.trim()) {
      message.error('Vui lòng nhập tiêu đề.')
      return
    }
    if (!editDuration || Number.isNaN(editDuration) || editDuration <= 0) {
      message.error('Thời lượng phải lớn hơn 0 phút.')
      return
    }
    try {
      setEditSaving(true)
      await updateAiAssignment(editing.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        durationMinutes: editDuration,
      })
      message.success('Cập nhật bài giao thành công.')
      setEditOpen(false)
      setEditing(null)
      const res = await getAiAssignments({ classId: selectedClassId, page, limit })
      setRows(res.data?.assignments ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (record: AiAssignmentDetail) => {
    try {
      await deleteAiAssignment(record.id)
      message.success('Đã xóa bài giao.')
      const res = await getAiAssignments({ classId: selectedClassId, page, limit })
      setRows(res.data?.assignments ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Xóa thất bại')
    }
  }

  const columns: ColumnsType<AiAssignmentDetail> = [
    {
      title: 'TIÊU ĐỀ',
      key: 'title',
      render: (_, r) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{r.title}</div>
          <div className="text-xs text-slate-500">{r.description || '—'}</div>
        </div>
      ),
    },
    {
      title: 'LỚP',
      key: 'class',
      width: 180,
      render: (_, r) => <span>{r.class ? `${r.class.code ?? ''} - ${r.class.name ?? ''}` : `#${r.classId}`}</span>,
    },
    {
      title: 'LOẠI',
      key: 'type',
      width: 120,
      render: (_, r) =>
        r.assignmentType === 'fixed_exam' ? (
          <Tag color="blue">Đề cố định</Tag>
        ) : (
          <Tag color="purple">Cấu hình ngẫu nhiên</Tag>
        ),
    },
    {
      title: 'DEADLINE',
      key: 'deadline',
      width: 170,
      render: (_, r) => (r.deadline ? new Date(r.deadline).toLocaleString('vi-VN') : '—'),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 120,
      render: (_, r) =>
        r.status ? <Tag color="green">{r.status === 'published' ? 'Đã đăng tải' : r.status}</Tag> : '—',
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 190,
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<span className="material-symbols-outlined text-lg">visibility</span>}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/lecture/assignments/${r.id}`)
              }}
            />
          </Tooltip>
          <Tooltip title="Tiến độ">
            <Button
              type="text"
              size="small"
              icon={<span className="material-symbols-outlined text-lg">monitoring</span>}
              onClick={(e) => {
                e.stopPropagation()
                window.open(`/lecture/assignments/${r.id}/progress`, '_blank', 'noopener,noreferrer')
              }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<span className="material-symbols-outlined text-lg">edit</span>}
              onClick={(e) => {
                e.stopPropagation()
                openEdit(r)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài giao"
            description="Bạn chắc chắn muốn xóa bài này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={(e) => {
              e?.stopPropagation()
              void handleDelete(r)
            }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<span className="material-symbols-outlined text-lg">delete</span>}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
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
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Giao bài</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chọn kiểu giao bài cho lớp.</p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="Assignments"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tạo giao bài</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Chọn một trong hai lựa chọn bên dưới để bắt đầu.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <Link
                to={`/lecture/assignments/homework${query}`}
                className="group flex flex-col rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary">assignment</span>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Giao bài tập</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Bài tập theo chủ đề, có deadline</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xl text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
                <div className="mt-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Phù hợp giao bài thường xuyên và theo dõi tiến độ.
                </div>
              </Link>

              <Link
                to={`/lecture/assignments/mock-exam${query}`}
                className="group flex flex-col rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary">quiz</span>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Giao đề thi thử</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Đề mô phỏng, tính điểm tự động</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xl text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
                <div className="mt-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Phù hợp giao bài thi thử theo thời gian và chấm điểm.
                </div>
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Danh sách bài đã giao</h3>
                  <p className="text-sm text-slate-500">Click vào dòng để xem chi tiết bài giao.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    placeholder="Lọc theo lớp"
                    value={selectedClassId}
                    onChange={(v) => {
                      setSelectedClassId(v)
                      setPage(1)
                    }}
                    allowClear
                    options={classOptions}
                    className="w-64 [&_.ant-select-selector]:rounded-lg"
                    showSearch
                    optionFilterProp="label"
                  />
                  <Button onClick={() => setPage(1)}>Làm mới</Button>
                </div>
              </div>

              <Table<AiAssignmentDetail>
                rowKey="id"
                columns={columns}
                dataSource={rows}
                loading={loading}
                onRow={(record) => ({
                  onClick: () => navigate(`/lecture/assignments/${record.id}`),
                  className: 'cursor-pointer',
                })}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (t) => `Tổng ${t} bài`,
                  onChange: (p, ps) => {
                    setPage(p)
                    if (ps !== limit) {
                      setLimit(ps)
                      setPage(1)
                    }
                  },
                }}
                locale={{ emptyText: 'Chưa có bài giao nào.' }}
              />
            </div>
          </div>
        </div>
      </main>

      <Modal
        title="Cập nhật bài giao"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false)
          setEditing(null)
        }}
        onOk={handleUpdate}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={editSaving}
        destroyOnHidden
      >
        <div className="mt-2 space-y-3">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề</div>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</div>
            <Input.TextArea value={editDescription} rows={3} onChange={(e) => setEditDescription(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Thời lượng (phút)</div>
            <Input type="number" min={1} value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value || 0))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

