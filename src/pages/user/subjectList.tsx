import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Modal, Pagination, Tag, message } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import { getSubjectById, getSubjects, type Subject, type SubjectDetail } from '../../apis/subjectsApi'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZqf0V5GhuPSzfem0N2P68f3MrXH71A0nF-DFvoxuoGMW5yv0MJ0ouenjgHfthrOcXq3uM6j5NnG-4xSt7uLA4DEiTheVArSK35G_QJUhYqeThCN-jlgQ4iw3qMb2dv91kLrGGscFn_DlelMVTfOIcpZbUWlPfpjoyHq7ZQIgv3IDuPGjRE_PvNmF8GU_WaTiDKCkNx6n3PE8eqUQNiq00PCpGSJXo4XZBe1TeT-V0bY6NjC60_dGxJW5j40CXNZm3zHCdHhO6XQXz'

function subjectStyle(code: string | undefined) {
  const c = (code ?? '').toUpperCase()
  if (c.startsWith('PHYS'))
    return { icon: 'science', iconBg: 'bg-cyan-50 dark:bg-cyan-900/30', iconColor: 'text-cyan-600', category: 'Vật lý' }
  if (c.startsWith('CHEM'))
    return { icon: 'science', iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-600', category: 'Hóa học' }
  if (c.startsWith('MATH'))
    return { icon: 'calculate', iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-primary', category: 'Toán học' }
  if (c.startsWith('BIO'))
    return { icon: 'biotech', iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-600', category: 'Sinh học' }
  if (c.startsWith('ENG'))
    return { icon: 'translate', iconBg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-600', category: 'Ngoại ngữ' }
  return { icon: 'menu_book', iconBg: 'bg-slate-50 dark:bg-slate-800/60', iconColor: 'text-slate-600', category: 'Môn học' }
}

export default function SubjectList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Subject[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<SubjectDetail | null>(null)

  const fetchSubjects = useCallback(() => {
    setLoading(true)
    getSubjects({
      page,
      limit,
      search: search.trim() || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isActive: true,
    })
      .then((res) => {
        setRows(res.data?.subjects ?? [])
        setTotal(res.data?.pagination?.totalCount ?? 0)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách môn học'))
      .finally(() => setLoading(false))
  }, [page, limit, search])

  useEffect(() => {
    const t = window.setTimeout(() => fetchSubjects(), 250)
    return () => window.clearTimeout(t)
  }, [fetchSubjects])

  const pageCountText = useMemo(() => {
    const from = total === 0 ? 0 : (page - 1) * limit + 1
    const to = Math.min(page * limit, total)
    return `${from}-${to}/${total}`
  }, [page, limit, total])

  const openDetail = useCallback(async (id: number) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetail(null)
    try {
      const res = await getSubjectById(id)
      setDetail(res.data ?? null)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi tải chi tiết môn học')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    setDetail(null)
  }, [])

  const teacherList = useMemo(() => {
    const ts = (detail?.teachers ?? []) as Array<{ id: number; fullName?: string; email?: string }>
    return ts.filter(Boolean)
  }, [detail])

  return (
    <div className="flex h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarStudent variant="subject-list" activeItem="practice" />

      <div className="ml-64 flex flex-1 flex-col overflow-hidden bg-[#F8FAFC] dark:bg-slate-950">
        <TheHeader
          variant="student"
          userName="Nguyễn Văn A"
          userSubtitle="Học kỳ 2 - 2026"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              AI Graduation Exam Command Center
            </h1>
          }
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Danh sách môn học
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Khám phá và đăng ký các khóa luyện thi AI chuẩn hóa.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <Input
                placeholder="Tìm môn học..."
                className="w-full rounded-xl border-slate-200 bg-white py-2 pl-10 pr-4 shadow-sm [&.ant-input]:rounded-xl dark:border-slate-800 dark:bg-slate-900"
                allowClear
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(loading ? Array.from({ length: 8 }) : rows).map((subject, idx) => {
              if (loading) {
                return (
                  <div
                    key={`skeleton-${idx}`}
                    className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
                      <div className="h-5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="mb-2 h-5 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="mb-1 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="mb-4 h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-auto h-10 w-full rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                )
              }

              const s = subject as Subject
              const st = subjectStyle(s.code)
              return (
              <div
                key={s.id}
                className="group flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-lg p-3 ${st.iconBg} ${st.iconColor}`}
                  >
                    <span className="material-symbols-outlined">
                      {st.icon}
                    </span>
                  </div>
                  <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {st.category}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                  {s.name}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {s.description || '—'}
                </p>
                <div className="mb-6 flex flex-col gap-2 border-t border-slate-50 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      person_pin
                    </span>
                    <span>Số giáo viên: {s.stats?.totalTeachers ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      group
                    </span>
                    <span>Số học sinh: {s.stats?.totalStudents ?? 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="primary"
                    className="flex-1 font-semibold"
                    onClick={() => navigate(`/user/subjects/${s.id}/practice`)}
                  >
                    Bắt đầu
                  </Button>
                  <Button
                    type="text"
                    className="px-3 font-medium text-slate-600 hover:!text-primary dark:text-slate-400"
                    onClick={() => openDetail(s.id)}
                  >
                    Chi tiết
                  </Button>
                </div>
              </div>
              )
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">{pageCountText}</div>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50]}
              onChange={(p, ps) => {
                setPage(p)
                if (ps !== limit) setLimit(ps)
              }}
            />
          </div>
        </main>

        <Modal
          open={detailOpen}
          onCancel={closeDetail}
          footer={null}
          width={760}
          centered
          className="[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-2xl"
          title={null}
        >
          <div className="bg-white dark:bg-slate-900">
            <div className="bg-gradient-to-r from-primary/10 via-sky-500/10 to-emerald-500/10 p-6 dark:from-primary/20 dark:via-sky-500/10 dark:to-emerald-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-3 ${subjectStyle(detail?.code).iconBg} ${subjectStyle(detail?.code).iconColor}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{subjectStyle(detail?.code).icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      {detailLoading ? 'Đang tải...' : detail?.name ?? 'Môn học'}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Tag className="rounded-full">{detail?.code ?? '—'}</Tag>
                      <Tag color={detail?.isActive ? 'green' : 'red'} className="rounded-full">
                        {detail?.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                      </Tag>
                      <Tag className="rounded-full">{subjectStyle(detail?.code).category}</Tag>
                    </div>
                  </div>
                </div>
                <Button onClick={closeDetail}>Đóng</Button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {detailLoading ? ' ' : detail?.description ?? '—'}
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Giáo viên</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {detailLoading ? '—' : detail?.stats?.totalTeachers ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Học sinh</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {detailLoading ? '—' : detail?.stats?.totalStudents ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cập nhật</p>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {detailLoading ? '—' : detail?.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '—'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {detailLoading ? ' ' : detail?.createdAt ? `Tạo: ${new Date(detail.createdAt).toLocaleString()}` : ''}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Giáo viên phụ trách</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {detailLoading ? '' : `${teacherList.length} người`}
                  </span>
                </div>

                {detailLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-10 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                ) : teacherList.length ? (
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                    {teacherList.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{t.fullName ?? '—'}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.email ?? '—'}</p>
                        </div>
                        <Tag className="rounded-full">GV</Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu giáo viên.</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="primary" onClick={() => detail?.id && navigate(`/user/subjects/${detail.id}/practice`)}>
                    Bắt đầu
                  </Button>
                  <Button onClick={() => navigate('/user/exam-list')}>Làm đề thi</Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
