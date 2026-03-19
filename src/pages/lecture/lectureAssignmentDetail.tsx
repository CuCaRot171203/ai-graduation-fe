import { useEffect, useState } from 'react'
import { Button, DatePicker, Descriptions, Modal, Popconfirm, Tag, TimePicker, message } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import { deleteAiAssignment, getAiAssignmentById, type AiAssignmentDetail, updateAiAssignmentDeadline } from '../../apis/aiExamApi'

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

export default function LectureAssignmentDetail() {
  const navigate = useNavigate()
  const { assignmentId } = useParams()
  const idNum = Number(assignmentId)

  const [loading, setLoading] = useState(true)
  const [savingDeadline, setSavingDeadline] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [assignment, setAssignment] = useState<AiAssignmentDetail | null>(null)
  const [deadlineDate, setDeadlineDate] = useState<Dayjs>(dayjs())
  const [deadlineTime, setDeadlineTime] = useState<Dayjs>(dayjs())

  const fetchDetail = async () => {
    if (!Number.isFinite(idNum)) return
    try {
      setLoading(true)
      const res = await getAiAssignmentById(idNum)
      setAssignment(res.data)
      if (res.data?.deadline) {
        const dt = dayjs(res.data.deadline)
        setDeadlineDate(dt)
        setDeadlineTime(dt)
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tải chi tiết bài giao')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum])

  const handleSaveDeadline = async () => {
    if (!assignment) return
    const deadlineIso = deadlineDate
      .hour(deadlineTime.hour())
      .minute(deadlineTime.minute())
      .second(0)
      .millisecond(0)
      .toDate()
      .toISOString()
    try {
      setSavingDeadline(true)
      await updateAiAssignmentDeadline(assignment.id, { deadline: deadlineIso })
      message.success('Đã cập nhật giờ kết thúc.')
      setEditOpen(false)
      fetchDetail()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Cập nhật giờ kết thúc thất bại')
    } finally {
      setSavingDeadline(false)
    }
  }

  const handleDelete = async () => {
    if (!assignment) return
    try {
      setDeleting(true)
      await deleteAiAssignment(assignment.id)
      message.success('Đã xóa bài giao.')
      navigate('/lecture/assignments')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Xóa bài giao thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const config = assignment?.examConfig as
    | {
        subjectId?: number
        totalQuestions?: number
        distribution?: Record<string, number>
      }
    | undefined

  const distributionEntries = Object.entries(config?.distribution ?? {})
  const distributionLabel: Record<string, string> = {
    nhan_biet: 'Nhận biết',
    thong_hieu: 'Thông hiểu',
    van_dung: 'Vận dụng',
    van_dung_cao: 'Vận dụng cao',
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="assignments" />
      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Chi tiết bài giao</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thông tin bài tập/đề thi đã giao.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Assignments"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {assignment?.title ?? (loading ? 'Đang tải...' : 'Không tìm thấy bài giao')}
              </h3>
              <div className="flex items-center gap-2">
                <Button onClick={fetchDetail}>Làm mới</Button>
                <Button type="primary" onClick={() => setEditOpen(true)} disabled={!assignment}>
                  Sửa giờ
                </Button>
                <Popconfirm
                  title="Xóa bài thi"
                  description="Bạn chắc chắn muốn xóa bài giao này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: deleting }}
                  onConfirm={handleDelete}
                >
                  <Button danger disabled={!assignment}>
                    Xóa bài thi
                  </Button>
                </Popconfirm>
                <Link to="/lecture/assignments">
                  <Button>Quay lại</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Descriptions column={1} size="middle" bordered>
                <Descriptions.Item label="ID">{assignment?.id ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Loại bài giao">
                  {assignment?.assignmentType === 'fixed_exam' ? <Tag color="blue">fixed_exam</Tag> : <Tag color="purple">random_config</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{assignment?.status ? <Tag color="green">{assignment.status}</Tag> : '—'}</Descriptions.Item>
                <Descriptions.Item label="Lớp học">
                  {assignment?.class ? `${assignment.class.code ?? ''} - ${assignment.class.name ?? ''}` : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Đề thi">
                  {assignment?.exam ? `${assignment.exam.code ?? ''} - ${assignment.exam.title ?? ''}` : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">{assignment?.description || '—'}</Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  {assignment?.deadline ? new Date(assignment.deadline).toLocaleString('vi-VN') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời lượng (phút)">{assignment?.durationMinutes ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Tạo lúc">
                  {assignment?.createdAt ? new Date(assignment.createdAt).toLocaleString('vi-VN') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lúc">
                  {assignment?.updatedAt ? new Date(assignment.updatedAt).toLocaleString('vi-VN') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Cấu hình bài thi">
                  {assignment?.assignmentType === 'random_config' && config ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Môn học ID:</span> {config.subjectId ?? '—'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Tổng số câu:</span> {config.totalQuestions ?? '—'}
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Phân bố mức độ</div>
                        {distributionEntries.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                            {distributionEntries.map(([key, value]) => (
                              <div key={key} className="text-sm text-slate-700 dark:text-slate-200">
                                {distributionLabel[key] ?? key}:{' '}
                                <b>
                                  {typeof value === 'number'
                                    ? `${value}%`
                                    : `${(value as { count?: number }).count ?? 0} câu`}
                                </b>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">Không có dữ liệu phân bố.</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Không áp dụng (đây là bài giao theo đề cố định).</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </div>
      </main>

      <Modal
        title="Sửa giờ kết thúc"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSaveDeadline}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={savingDeadline}
        destroyOnHidden
      >
        <div className="mt-2 grid grid-cols-1 gap-3">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày kết thúc</div>
            <DatePicker
              value={deadlineDate}
              onChange={(v) => {
                if (v) setDeadlineDate(v)
              }}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Giờ kết thúc</div>
            <TimePicker
              value={deadlineTime}
              onChange={(v) => {
                if (v) setDeadlineTime(v)
              }}
              format="HH:mm"
              minuteStep={5}
              className="w-full"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
