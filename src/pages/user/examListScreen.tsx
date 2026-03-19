import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Input, Modal, Pagination, Select, Tag, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import {
  enrollInClass,
  getAiAssignments,
  getMyEnrollments,
  getPublicAiClasses,
  type AiAssignmentDetail,
  type AiPublicClassItem,
  type EnrollmentItem,
} from '../../apis/aiExamApi'
import type { LoginUser } from '../../apis/authApi'

const { Search } = Input

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBS-es88F2PUY9ei1Vet9xZq80MXX2efV1PxLvRue-JAJxj_iL_LX_Q-_3dkYb2ZkwW0IhYzB7R_V7eh4NblXgD7AY3y_vF1jfcVoz-AvUy9d85okFh0yKj72wEZpvbeuCYVG52hKthuaOTPLTm-ZRDP61tNtiob1MyA37Q4FtBinX21kGc-DkEp2mc0QtqD_CBtRctEDjZp3dA1RaDv3zKIGYn4yJJwfabl-1YZVH8f6O7jCkW4WK1gAwT-7AMkRlrnPQPjuOG5pfL'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

export default function ExamListScreen() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [assignments, setAssignments] = useState<AiAssignmentDetail[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollSaving, setEnrollSaving] = useState(false)
  const [classOptions, setClassOptions] = useState<AiPublicClassItem[]>([])
  const [selectedClassName, setSelectedClassName] = useState<string | undefined>(undefined)

  const activeEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'active'), [enrollments])
  const pendingEnrollments = useMemo(() => enrollments.filter((e) => e.status === 'pending'), [enrollments])
  const hasActiveClass = activeEnrollments.length > 0

  const fetchExamData = async () => {
    try {
      const [enrollRes, classesRes] = await Promise.all([
        getMyEnrollments(),
        getPublicAiClasses({ page: 1, limit: 20 }),
      ])
      const allEnrollments = enrollRes.data?.enrollments ?? []
      setEnrollments(allEnrollments)
      setClassOptions(classesRes.data?.classes ?? [])
      if (!allEnrollments.some((e) => e.status === 'active')) {
        setEnrollOpen(allEnrollments.length === 0)
        if (!selectedClassName) {
          const firstName = (classesRes.data?.classes ?? [])[0]?.name
          setSelectedClassName(firstName)
        }
        setAssignments([])
        setTotal(0)
        return
      }
      setEnrollOpen(false)
      const assignmentsRes = await getAiAssignments({ page, limit })
      setAssignments(assignmentsRes.data?.assignments ?? [])
      setTotal(assignmentsRes.data?.pagination?.total ?? 0)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách bài thi')
    }
  }

  useEffect(() => {
    void fetchExamData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const filteredAssignments = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return assignments
    return assignments.filter((a) => {
      const title = String(a.title ?? '').toLowerCase()
      const exam = String(a.exam?.title ?? '').toLowerCase()
      const cls = String(a.class?.name ?? '').toLowerCase()
      return title.includes(q) || exam.includes(q) || cls.includes(q)
    })
  }, [assignments, keyword])

  const handleEnroll = async () => {
    if (!selectedClassName) {
      message.error('Vui lòng chọn lớp để đăng ký.')
      return
    }
    try {
      setEnrollSaving(true)
      await enrollInClass({ className: selectedClassName })
      message.success('Đăng ký lớp thành công, vui lòng chờ giáo viên duyệt.')
      setEnrollOpen(false)
      setSelectedClassName(undefined)
      await fetchExamData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Đăng ký lớp thất bại')
    } finally {
      setEnrollSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SidebarStudent variant="exam-list" activeItem="exams" />

      <div className="ml-64 flex flex-1 flex-col">
        <TheHeader
          variant="student"
          userName={user?.fullName ?? 'Học sinh'}
          userSubtitle={user?.email ?? 'Tài khoản học sinh'}
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="User avatar"
          searchSlot={
            <Search
              placeholder="Tìm kiếm nhanh..."
              allowClear
              className="[&_.ant-input]:rounded-xl [&_.ant-input]:bg-slate-50 [&_.ant-input]:dark:bg-slate-800"
            />
          }
        />

        <main className="space-y-8 p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Danh sách đề thi
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Chỉ hiển thị các bài đã được giao cho lớp của bạn.
              </p>
            </div>

            {/* Filtros com Ant Design */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex min-w-[200px] flex-1 items-center gap-2">
                <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                  Môn học:
                </span>
                <Select
                  defaultValue="all"
                  className="flex-1"
                  size="middle"
                  options={[
                    { value: 'all', label: 'Tất cả môn học' },
                    { value: 'math', label: 'Toán học' },
                    { value: 'physics', label: 'Vật lý' },
                    { value: 'chemistry', label: 'Hóa học' },
                    { value: 'biology', label: 'Sinh học' },
                    { value: 'cs', label: 'Tin học' },
                  ]}
                />
              </div>

              <div className="flex min-w-[200px] flex-1 items-center gap-2">
                <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                  Độ khó:
                </span>
                <Select
                  defaultValue="all"
                  className="flex-1"
                  size="middle"
                  options={[
                    { value: 'all', label: 'Tất cả mức độ' },
                    { value: 'beginner', label: 'Cơ bản' },
                    { value: 'intermediate', label: 'Trung bình' },
                    { value: 'advanced', label: 'Nâng cao' },
                  ]}
                />
              </div>

              <div className="flex-grow">
                <Search placeholder="Lọc theo tên bài thi..." allowClear value={keyword} onChange={(e) => setKeyword(e.target.value)} className="max-w-sm" />
              </div>
            </div>
          </div>

          {!hasActiveClass ? (
            <Alert
              type="warning"
              showIcon
              message="Bạn chưa thuộc lớp nào"
              description={
                pendingEnrollments.length > 0
                  ? `Bạn đang có ${pendingEnrollments.length} yêu cầu chờ duyệt. Khi được duyệt, danh sách bài thi sẽ xuất hiện tại đây.`
                  : 'Vui lòng đăng ký lớp để xem các bài thi đã được giao.'
              }
              action={
                <Button size="small" type="primary" onClick={() => setEnrollOpen(true)}>
                  {pendingEnrollments.length > 0 ? 'Đăng ký thêm lớp' : 'Đăng ký lớp'}
                </Button>
              }
            />
          ) : null}

          {!hasActiveClass && enrollments.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Trạng thái đăng ký lớp của bạn</h3>
              <div className="space-y-2">
                {enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                      {e.class?.name ?? '—'}
                      {e.class?.subject?.name ? (
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({e.class.subject.name})</span>
                      ) : null}
                    </div>
                    <Tag
                      color={e.status === 'active' ? 'green' : e.status === 'pending' ? 'gold' : 'default'}
                      className="rounded-full"
                    >
                      {e.status === 'active' ? 'Đã duyệt' : e.status === 'pending' ? 'Chờ duyệt' : e.status}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Grade de exames */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAssignments.map((exam) => {
              const isCompleted = exam.myAttempt?.status === 'completed'
              return (
                <div
                  key={exam.id}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <Tag
                      color="blue"
                      className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    >
                      {exam.class?.code ?? 'LỚP'}
                    </Tag>
                    <div className="flex items-center gap-2">
                      <Tag
                        color={exam.assignmentType === 'fixed_exam' ? 'cyan' : 'purple'}
                        className="px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        {exam.assignmentType === 'fixed_exam' ? 'Đề cố định' : 'Thi thử random'}
                      </Tag>
                      {isCompleted ? <Tag color="green">Đã làm bài</Tag> : null}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                    {exam.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {exam.description || exam.exam?.title || 'Bài thi đã được giao cho lớp của bạn.'}
                  </p>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">
                          quiz
                        </span>
                        {exam.exam?.code ?? `#${exam.id}`}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">
                          schedule
                        </span>
                        {exam.durationMinutes ?? 60} phút
                      </div>
                    </div>
                    <Button
                      type="primary"
                      block
                      disabled={isCompleted}
                      className="flex items-center justify-center gap-2 !bg-primary !shadow-lg !shadow-primary/20 hover:!bg-primary/90 disabled:!bg-slate-400 disabled:!shadow-none"
                      onClick={() => {
                        if (!isCompleted) navigate(`/user/exam-practice/${exam.id}`)
                      }}
                    >
                      {isCompleted ? 'Đã làm bài' : 'Làm bài ngay'}
                      <span className="material-symbols-outlined text-base">
                        {isCompleted ? 'check_circle' : 'play_arrow'}
                      </span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center pt-4">
            <Pagination current={page} total={total} pageSize={limit} showSizeChanger={false} onChange={(p) => setPage(p)} />
          </div>
        </main>
      </div>

      <Modal
        title="Đăng ký lớp"
        open={enrollOpen}
        onCancel={() => setEnrollOpen(false)}
        onOk={handleEnroll}
        okText="Gửi đăng ký"
        cancelText="Đóng"
        closable
        maskClosable
        confirmLoading={enrollSaving}
        destroyOnHidden
      >
        <p className="mb-3 text-sm text-slate-500">Bạn cần đăng ký lớp để xem các bài thi đã được giao.</p>
        <Select
          placeholder="Chọn lớp muốn đăng ký"
          value={selectedClassName}
          onChange={(v) => setSelectedClassName(v)}
          options={classOptions.map((c) => ({ value: c.name, label: c.name }))}
          className="w-full"
          showSearch
          optionFilterProp="label"
        />
      </Modal>
    </div>
  )
}

