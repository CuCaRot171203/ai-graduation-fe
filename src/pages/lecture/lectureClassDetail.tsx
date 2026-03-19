import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Modal, Tag, message } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getAiClassById, getAiClassResults, type AiClassItem, type GetAiClassResultsResponse } from '../../apis/aiExamApi'
import type { LoginUser } from '../../apis/authApi'

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

export default function LectureClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const idNum = Number(classId)

  const [loading, setLoading] = useState(true)
  const [cls, setCls] = useState<AiClassItem | null>(null)
  const [students, setStudents] = useState<unknown[]>([])

  const [resultsOpen, setResultsOpen] = useState(false)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [results, setResults] = useState<GetAiClassResultsResponse['data'] | null>(null)

  const fetchDetail = useCallback(() => {
    if (!Number.isFinite(idNum)) return
    setLoading(true)
    getAiClassById(idNum)
      .then((res) => {
        setCls(res.data)
        setStudents((res.data?.students ?? []) as unknown[])
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải chi tiết lớp'))
      .finally(() => setLoading(false))
  }, [idNum])

  const fetchResults = useCallback(() => {
    if (!Number.isFinite(idNum)) return
    setResultsLoading(true)
    getAiClassResults(idNum, { sortBy: 'totalScore', sortOrder: 'desc' })
      .then((res) => setResults(res.data))
      .catch((err) => message.error(err?.message ?? 'Lỗi tải kết quả lớp'))
      .finally(() => setResultsLoading(false))
  }, [idNum])

  const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">{label}</span>
          <span>{value}</span>
        </div>
        <progress
          className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-primary dark:[&::-webkit-progress-bar]:bg-slate-700"
          value={pct}
          max={100}
        />
      </div>
    )
  }

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Chi tiết lớp</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thông tin lớp học.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Lớp học"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {cls?.name ?? (loading ? 'Đang tải...' : 'Không tìm thấy lớp')}
                </h2>
                {cls?.code && <p className="mt-1 text-slate-500 dark:text-slate-400">Mã lớp: {cls.code}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button disabled className="rounded-lg" icon={<span className="material-symbols-outlined">person_add</span>}>
                  Thêm học sinh
                </Button>
                <Button
                  className="rounded-lg"
                  icon={<span className="material-symbols-outlined">bar_chart</span>}
                  onClick={() => {
                    setResultsOpen(true)
                    fetchResults()
                  }}
                  disabled={!cls}
                >
                  Xem kết quả lớp
                </Button>
                <Button
                  className="rounded-lg"
                  icon={<span className="material-symbols-outlined">assignment</span>}
                  onClick={() => navigate(`/lecture/assignments?classId=${idNum}`)}
                  disabled={!cls}
                >
                  Giao bài
                </Button>
                <Link to="/lecture/classes">
                  <Button className="rounded-lg">Quay lại</Button>
                </Link>
                <Button
                  className="rounded-lg"
                  icon={<span className="material-symbols-outlined">refresh</span>}
                  onClick={fetchDetail}
                >
                  Làm mới
                </Button>
              </div>
            </div>

            {cls && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Môn</div>
                  <div className="mt-1 text-slate-900 dark:text-white">
                    {cls.subject?.code ? `${cls.subject.code} - ${cls.subject.name}` : `#${cls.subjectId}`}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Năm học</div>
                  <div className="mt-1 text-slate-900 dark:text-white">{cls.schoolYear || '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Số học sinh</div>
                  <div className="mt-1 text-slate-900 dark:text-white">{cls.studentCount ?? 0}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</div>
                  <div className="mt-2">{cls.isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng</Tag>}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Giáo viên</div>
                  <div className="mt-1 text-slate-900 dark:text-white">{cls.teacher?.fullName ?? `#${cls.teacherId}`}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{cls.teacher?.email ?? ''}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian</div>
                  <div className="mt-1 text-slate-900 dark:text-white">
                    Tạo: {cls.createdAt ? new Date(cls.createdAt).toLocaleString('vi-VN') : '—'}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Cập nhật: {cls.updatedAt ? new Date(cls.updatedAt).toLocaleString('vi-VN') : '—'}
                  </div>
                </div>
                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</div>
                  <div className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{cls.description || '—'}</div>
                </div>
                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Danh sách học sinh</div>
                    <span className="text-xs text-slate-500">Tổng: {cls.studentCount ?? students.length ?? 0}</span>
                  </div>
                  {Array.isArray(students) && students.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {students.slice(0, 12).map((s, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
                          {(s as { fullName?: string; email?: string }).fullName ?? `Học sinh #${i + 1}`}
                          <div className="text-xs text-slate-500">{(s as { email?: string }).email ?? ''}</div>
                        </div>
                      ))}
                      {students.length > 12 ? (
                        <div className="text-xs text-slate-500 md:col-span-2">… và {students.length - 12} học sinh khác</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-500">Chưa có học sinh trong lớp.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal
        title="Kết quả lớp"
        open={resultsOpen}
        onCancel={() => setResultsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setResultsOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={920}
        destroyOnHidden
      >
        {resultsLoading ? (
          <div className="py-10 text-center text-slate-500">Đang tải kết quả...</div>
        ) : results ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-base font-bold text-slate-900">{results.class?.name ?? cls?.name ?? '—'}</div>
                <div className="text-xs text-slate-500">Mã lớp: {results.class?.code ?? cls?.code ?? '—'}</div>
              </div>
              <Button
                icon={<span className="material-symbols-outlined">refresh</span>}
                onClick={fetchResults}
              >
                Làm mới
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng học sinh</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{results.summary?.totalStudents ?? 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Có kết quả</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{results.summary?.studentsWithResults ?? 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Số lượt làm bài</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{results.summary?.totalExamsTaken ?? 0}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <div className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Thống kê</div>
              {(() => {
                const s = results.summary ?? { totalStudents: 0, studentsWithResults: 0, totalExamsTaken: 0 }
                const max = Math.max(s.totalStudents, s.studentsWithResults, s.totalExamsTaken, 1)
                return (
                  <div className="space-y-3">
                    <Bar label="Tổng học sinh" value={s.totalStudents ?? 0} max={max} />
                    <Bar label="Học sinh có kết quả" value={s.studentsWithResults ?? 0} max={max} />
                    <Bar label="Tổng lượt làm bài" value={s.totalExamsTaken ?? 0} max={max} />
                  </div>
                )
              })()}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <div className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Danh sách kết quả</div>
              <div className="text-sm text-slate-500">
                {Array.isArray(results.results) && results.results.length > 0 ? `Có ${results.results.length} bản ghi.` : 'Chưa có kết quả.'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                (Nếu bạn muốn hiển thị bảng chi tiết theo schema `results`, gửi mình structure của từng item trong `results` để render đầy đủ.)
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500">Chưa có dữ liệu.</div>
        )}
      </Modal>
    </div>
  )
}

