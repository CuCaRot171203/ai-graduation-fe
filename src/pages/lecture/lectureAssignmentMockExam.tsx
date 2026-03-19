import { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Input, Select, TimePicker, message } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'
import {
  createAiAssignment,
  getAiClasses,
  getAiExams,
  getTeacherSubjectsFromAiBackend,
  type AiExamItem,
  type AiClassItem,
} from '../../apis/aiExamApi'
import type { Subject } from '../../apis/subjectsApi'

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

export default function LectureAssignmentMockExam() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const teacherId = user?.id
  const [searchParams] = useSearchParams()

  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [classes, setClasses] = useState<AiClassItem[]>([])
  const [exams, setExams] = useState<AiExamItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [classId, setClassId] = useState<number | undefined>(undefined)
  const [examId, setExamId] = useState<number | undefined>(undefined)
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined)
  const [title, setTitle] = useState('Đề thi thử')
  const [description, setDescription] = useState('')
  const [deadlineDate, setDeadlineDate] = useState<Dayjs>(dayjs())
  const [deadlineTime, setDeadlineTime] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0).millisecond(0))
  const [durationMinutes, setDurationMinutes] = useState<number>(60)
  const [totalQuestions, setTotalQuestions] = useState<number>(20)
  const [nhanBiet, setNhanBiet] = useState<number>(30)
  const [thongHieu, setThongHieu] = useState<number>(30)
  const [vanDung, setVanDung] = useState<number>(30)
  const [vanDungCao, setVanDungCao] = useState<number>(10)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      if (!teacherId) {
        setLoadingData(false)
        return
      }
      try {
        setLoadingData(true)
        const [classesRes, subjectsRes, examsRes] = await Promise.all([
          getAiClasses({ page: 1, limit: 100, teacherId }),
          getTeacherSubjectsFromAiBackend(teacherId),
          getAiExams({ page: 1, limit: 100 }),
        ])
        if (!mounted) return
        const classRows = classesRes.data?.classes ?? []
        const subjectRows = subjectsRes.data?.subjects ?? []
        const examRows = examsRes.data?.exams ?? []
        setClasses(classRows)
        setSubjects(subjectRows)
        setExams(examRows)

        const classIdQuery = Number(searchParams.get('classId'))
        if (Number.isFinite(classIdQuery) && classRows.some((c) => c.id === classIdQuery)) {
          setClassId(classIdQuery)
          const selectedClass = classRows.find((c) => c.id === classIdQuery)
          if (selectedClass?.subjectId) setSubjectId(selectedClass.subjectId)
        }
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Lỗi tải dữ liệu giao đề thi thử')
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
    if (!classId) return
    const pickedClass = classes.find((c) => c.id === classId)
    if (pickedClass?.subjectId) setSubjectId(pickedClass.subjectId)
  }, [classId, classes])

  const classOptions = useMemo(
    () => classes.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
    [classes]
  )

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
    [subjects]
  )

  const examOptions = useMemo(
    () => exams.map((e) => ({ value: e.id, label: `${e.code ?? `#${e.id}`} - ${e.title ?? 'Không có tiêu đề'}` })),
    [exams]
  )

  const distributionTotal = nhanBiet + thongHieu + vanDung + vanDungCao

  const handleSubmit = async () => {
    if (!classId) {
      message.error('Vui lòng chọn lớp.')
      return
    }
    if (!subjectId) {
      message.error('Vui lòng chọn môn học.')
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
    if (!totalQuestions || Number.isNaN(totalQuestions) || totalQuestions <= 0) {
      message.error('Tổng số câu phải lớn hơn 0.')
      return
    }
    if (distributionTotal !== 100) {
      message.error('Tổng phân bố mức độ phải bằng 100%.')
      return
    }

    const percentageMap = [
      { key: 'nhan_biet', pct: nhanBiet },
      { key: 'thong_hieu', pct: thongHieu },
      { key: 'van_dung', pct: vanDung },
      { key: 'van_dung_cao', pct: vanDungCao },
    ] as const
    const rawCounts = percentageMap.map((d) => ({
      key: d.key,
      value: (totalQuestions * d.pct) / 100,
    }))
    const floored = rawCounts.map((x) => ({ key: x.key, count: Math.floor(x.value), remainder: x.value - Math.floor(x.value) }))
    let assigned = floored.reduce((sum, x) => sum + x.count, 0)
    const need = totalQuestions - assigned
    if (need > 0) {
      floored
        .sort((a, b) => b.remainder - a.remainder)
        .slice(0, need)
        .forEach((x) => {
          x.count += 1
          assigned += 1
        })
    }
    const countMap = floored.reduce<Record<string, number>>((acc, x) => {
      acc[x.key] = x.count
      return acc
    }, {})

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
        assignmentType: 'random_config',
        examConfig: {
          subjectId,
          totalQuestions,
          distribution: {
            nhan_biet: { count: countMap.nhan_biet ?? 0, trac_nghiem: null, tu_luan: 0 },
            thong_hieu: { count: countMap.thong_hieu ?? 0, trac_nghiem: null, tu_luan: 0 },
            van_dung: { count: countMap.van_dung ?? 0, trac_nghiem: null, tu_luan: 0 },
            van_dung_cao: { count: countMap.van_dung_cao ?? 0, trac_nghiem: null, tu_luan: 0 },
          },
        },
        deadline: deadlineIso,
        durationMinutes,
      })
      message.success('Giao đề thi thử thành công.')
      const createdId =
        (res.data as { id?: number } | undefined)?.id ??
        (res.data as { assignment?: { id?: number } } | undefined)?.assignment?.id
      if (createdId) {
        navigate(`/lecture/assignments/${createdId}`)
        return
      }
      setDescription('')
      setDeadlineDate(dayjs())
      setDeadlineTime(dayjs().hour(0).minute(0).second(0).millisecond(0))
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Giao đề thi thử thất bại')
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
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Giao đề thi thử</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tạo đề thi thử ngẫu nhiên theo cấu hình.</p>
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin giao đề thi thử</h3>
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
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Đề thi tham chiếu (tùy chọn)</div>
                  <Select
                    placeholder="Chọn đề thi"
                    value={examId}
                    onChange={(v) => setExamId(v)}
                    options={examOptions}
                    loading={loadingData}
                    disabled={loadingData}
                    className="w-full [&_.ant-select-selector]:rounded-xl"
                    showSearch
                    optionFilterProp="label"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Môn học</div>
                  <Select
                    placeholder="Chọn môn học"
                    value={subjectId}
                    onChange={(v) => setSubjectId(v)}
                    options={subjectOptions}
                    loading={loadingData}
                    disabled={loadingData}
                    className="w-full [&_.ant-select-selector]:rounded-xl"
                    showSearch
                    optionFilterProp="label"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề</div>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</div>
                  <Input.TextArea
                    rows={3}
                    placeholder="Mô tả bài thi thử"
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
                    disabledDate={(current) => (current ? current.startOf('day').isBefore(dayjs().startOf('day')) : false)}
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
                </div>

                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số câu</div>
                  <Input
                    type="number"
                    min={1}
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value || 0))}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Thời lượng (phút)</div>
                  <Input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value || 0))}
                    className="rounded-xl"
                  />
                </div>

                <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Phân bố mức độ (%)</div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      addonBefore="Nhận biết"
                      type="number"
                      min={0}
                      max={100}
                      value={nhanBiet}
                      onChange={(e) => setNhanBiet(Number(e.target.value || 0))}
                    />
                    <Input
                      addonBefore="Thông hiểu"
                      type="number"
                      min={0}
                      max={100}
                      value={thongHieu}
                      onChange={(e) => setThongHieu(Number(e.target.value || 0))}
                    />
                    <Input
                      addonBefore="Vận dụng"
                      type="number"
                      min={0}
                      max={100}
                      value={vanDung}
                      onChange={(e) => setVanDung(Number(e.target.value || 0))}
                    />
                    <Input
                      addonBefore="Vận dụng cao"
                      type="number"
                      min={0}
                      max={100}
                      value={vanDungCao}
                      onChange={(e) => setVanDungCao(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className={`mt-2 text-xs ${distributionTotal === 100 ? 'text-green-600' : 'text-red-500'}`}>
                    Tổng phân bố: {distributionTotal}%
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button onClick={() => window.history.back()}>Hủy</Button>
                <Button type="primary" onClick={handleSubmit} loading={submitting} disabled={loadingData}>
                  Giao đề thi thử
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

