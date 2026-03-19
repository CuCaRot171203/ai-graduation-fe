import { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Input, Select, TimePicker, message } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import { createAiAssignment, getAiClasses, getAiExams, type AiClassItem, type AiExamItem } from '../../apis/aiExamApi'

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

export default function LectureAssignmentHomework() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const teacherId = user?.id
  const [searchParams] = useSearchParams()

  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [classes, setClasses] = useState<AiClassItem[]>([])
  const [exams, setExams] = useState<AiExamItem[]>([])

  const [classId, setClassId] = useState<number | undefined>(undefined)
  const [examId, setExamId] = useState<number | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadlineDate, setDeadlineDate] = useState<Dayjs>(dayjs())
  const [deadlineTime, setDeadlineTime] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0).millisecond(0))
  const [durationMinutes, setDurationMinutes] = useState<number>(60)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      if (!teacherId) {
        setLoadingData(false)
        return
      }
      try {
        setLoadingData(true)
        const [classesRes, examsRes] = await Promise.all([
          getAiClasses({ page: 1, limit: 100, teacherId }),
          getAiExams({ page: 1, limit: 100 }),
        ])
        if (!mounted) return
        const classRows = classesRes.data?.classes ?? []
        const examRows = examsRes.data?.exams ?? []
        setClasses(classRows)
        setExams(examRows)

        const classIdQuery = Number(searchParams.get('classId'))
        if (Number.isFinite(classIdQuery) && classRows.some((c) => c.id === classIdQuery)) {
          setClassId(classIdQuery)
        }
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Lỗi tải dữ liệu giao bài')
      } finally {
        if (mounted) setLoadingData(false)
      }
    }
    fetchData()
    return () => {
      mounted = false
    }
  }, [teacherId, searchParams])

  useEffect(() => {
    if (!examId) return
    const pickedExam = exams.find((e) => e.id === examId)
    if (!pickedExam) return
    setDurationMinutes(pickedExam.durationMinutes ?? 60)
    if (!title.trim()) {
      setTitle(`Bài tập: ${pickedExam.title ?? pickedExam.code ?? `Đề #${pickedExam.id}`}`)
    }
  }, [examId, exams, title])

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: `${c.code} - ${c.name}`,
      })),
    [classes]
  )

  const examOptions = useMemo(
    () =>
      exams.map((e) => ({
        value: e.id,
        label: `${e.code ?? `#${e.id}`} - ${e.title ?? 'Không có tiêu đề'}`,
      })),
    [exams]
  )

  const handleSubmit = async () => {
    if (!classId) {
      message.error('Vui lòng chọn lớp.')
      return
    }
    if (!examId) {
      message.error('Vui lòng chọn đề thi.')
      return
    }
    if (!title.trim()) {
      message.error('Vui lòng nhập tiêu đề.')
      return
    }
    if (!deadlineDate || !deadlineTime) {
      message.error('Vui lòng chọn ngày và giờ kết thúc.')
      return
    }
    if (!durationMinutes || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      message.error('Thời lượng phải lớn hơn 0 phút.')
      return
    }

    const deadlineIso = deadlineDate
      .hour(deadlineTime.hour())
      .minute(deadlineTime.minute())
      .second(0)
      .millisecond(0)
      .toDate()
      .toISOString()
    try {
      setSubmitting(true)
      const res = await createAiAssignment({
        classId,
        examId,
        title: title.trim(),
        description: description.trim() || undefined,
        assignmentType: 'fixed_exam',
        examConfig: {},
        deadline: deadlineIso,
        durationMinutes,
      })
      message.success('Giao bài tập thành công.')
      const createdId =
        (res.data as { id?: number } | undefined)?.id ??
        (res.data as { assignment?: { id?: number } } | undefined)?.assignment?.id
      if (createdId) {
        navigate(`/lecture/assignments/${createdId}`)
        return
      }
      setTitle('')
      setDescription('')
      setDeadlineDate(dayjs())
      setDeadlineTime(dayjs().hour(0).minute(0).second(0).millisecond(0))
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Giao bài tập thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="assignments" />
      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Giao bài tập</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tạo bài giao và chọn đề thi có sẵn.</p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="Assignments"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin giao bài</h3>
                <Link to="/lecture/assignments" className="text-sm text-primary hover:underline">
                  Quay lại chọn loại giao bài
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Lớp học</div>
                  <Select
                    placeholder="Chọn lớp"
                    value={classId}
                    onChange={(v) => setClassId(v)}
                    options={classOptions}
                    loading={loadingData}
                    disabled={loadingData}
                    className="w-full [&_.ant-select-selector]:rounded-xl"
                    showSearch
                    optionFilterProp="label"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Đề thi</div>
                  <Select
                    placeholder="Chọn đề thi"
                    value={examId}
                    onChange={(v) => setExamId(v)}
                    options={examOptions}
                    optionRender={(option) => (
                      <div className="group flex items-center justify-between gap-3">
                        <span className="truncate">{String(option.label ?? '')}</span>
                        <a
                          href={`/lecture/exams/${option.value as number}`}
                          target="_blank"
                          rel="noreferrer"
                          className="invisible text-xs text-primary hover:underline group-hover:visible"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xem chi tiết
                        </a>
                      </div>
                    )}
                    loading={loadingData}
                    disabled={loadingData}
                    className="w-full [&_.ant-select-selector]:rounded-xl"
                    showSearch
                    optionFilterProp="label"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề</div>
                  <Input
                    placeholder="Ví dụ: Bài tập tuần 3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</div>
                  <Input.TextArea
                    rows={3}
                    placeholder="Nội dung hướng dẫn cho học sinh"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày kết thúc</div>
                  <DatePicker
                    value={deadlineDate}
                    onChange={(v) => {
                      if (v) setDeadlineDate(v)
                    }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current ? current.startOf('day').isBefore(dayjs().startOf('day')) : false}
                    className="w-full [&_.ant-picker-input>input]:text-slate-900 dark:[&_.ant-picker-input>input]:text-slate-100"
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
                    className="w-full [&_.ant-picker-input>input]:text-slate-900 dark:[&_.ant-picker-input>input]:text-slate-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">Mặc định: 00:00 (12h đêm), bạn có thể thay đổi.</p>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Thời lượng (phút)</div>
                  <Input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value || 0))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button onClick={() => window.history.back()}>Hủy</Button>
                <Button type="primary" onClick={handleSubmit} loading={submitting} disabled={loadingData}>
                  Giao bài tập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

