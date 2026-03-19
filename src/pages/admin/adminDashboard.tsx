import { useEffect, useMemo, useState } from 'react'
import { Button, Spin, Table, Tag, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getAdminExams, getAdminUsers, type AdminExam } from '../../apis/adminApi'
import { getAiClasses } from '../../apis/aiExamApi'
import { getSubjects } from '../../apis/subjectsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalExams, setTotalExams] = useState(0)
  const [totalSubjects, setTotalSubjects] = useState(0)
  const [totalClasses, setTotalClasses] = useState(0)
  const [recentExams, setRecentExams] = useState<AdminExam[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      try {
        const [usersRes, teachersRes, studentsRes, examsRes, subjectsRes, classesRes] = await Promise.all([
          getAdminUsers({ page: 1, limit: 1 }),
          getAdminUsers({ page: 1, limit: 1, role: 'teacher' }),
          getAdminUsers({ page: 1, limit: 1, role: 'student' }),
          getAdminExams({ page: 1, limit: 6 }),
          getSubjects({ page: 1, limit: 1 }),
          getAiClasses({ page: 1, limit: 1 }),
        ])
        setTotalUsers(usersRes.data?.pagination?.totalCount ?? 0)
        setTotalTeachers(teachersRes.data?.pagination?.totalCount ?? 0)
        setTotalStudents(studentsRes.data?.pagination?.totalCount ?? 0)
        setTotalExams(examsRes.data?.pagination?.totalCount ?? 0)
        setRecentExams(examsRes.data?.exams ?? [])
        setTotalSubjects(subjectsRes.data?.pagination?.totalCount ?? 0)
        setTotalClasses(classesRes.data?.pagination?.totalCount ?? 0)
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard')
      } finally {
        setLoading(false)
      }
    }

    void fetchDashboard()
  }, [])

  const examStatusSummary = useMemo(() => {
    const m = { approved: 0, pending: 0, draft: 0, other: 0 }
    for (const e of recentExams) {
      const s = String(e.status ?? '').toLowerCase()
      if (s === 'approved') m.approved += 1
      else if (s === 'pending') m.pending += 1
      else if (s === 'draft') m.draft += 1
      else m.other += 1
    }
    return m
  }, [recentExams])

  return (
    <div className="flex min-h-screen bg-background-light font-display dark:bg-background-dark">
      <SidebarAdmin activeItem="dashboard" compact />

      <main className="ml-60 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="admin"
          searchPlaceholder="Tìm kiếm đề thi, người dùng hoặc báo cáo..."
          userName="Quản trị viên"
          userSubtitle="Bảng điều khiển hệ thống"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Quản trị viên"
        />

        <div className="space-y-8 p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <>
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng người dùng</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalUsers.toLocaleString('vi-VN')}</h3>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Giảng viên / Học sinh</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {totalTeachers.toLocaleString('vi-VN')} / {totalStudents.toLocaleString('vi-VN')}
              </h3>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng đề thi</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalExams.toLocaleString('vi-VN')}</h3>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Môn học / Lớp học</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {totalSubjects.toLocaleString('vi-VN')} / {totalClasses.toLocaleString('vi-VN')}
              </h3>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái đề thi gần đây</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                Duyệt: {examStatusSummary.approved} · Chờ duyệt: {examStatusSummary.pending} · Nháp: {examStatusSummary.draft}
              </h3>
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-50 p-6 dark:border-slate-800">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Đề thi gần đây (dữ liệu thật)</h4>
              <Button type="link" className="p-0 text-sm font-semibold text-primary">Xem tất cả</Button>
            </div>
            <Table
              rowKey="id"
              dataSource={recentExams}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Tên đề thi',
                  render: (_: unknown, r: AdminExam) => r.title ?? r.name ?? `#${r.id}`,
                },
                {
                  title: 'Môn học',
                  render: (_: unknown, r: AdminExam) => r.subject?.name ?? r.subject?.code ?? '—',
                },
                {
                  title: 'Người tạo',
                  render: (_: unknown, r: AdminExam) => r.createdBy?.fullName ?? r.creator?.fullName ?? '—',
                },
                {
                  title: 'Trạng thái',
                  render: (_: unknown, r: AdminExam) => {
                    const s = String(r.status ?? '').toLowerCase()
                    if (s === 'approved') return <Tag color="green">Đã duyệt</Tag>
                    if (s === 'pending') return <Tag color="gold">Chờ duyệt</Tag>
                    if (s === 'draft') return <Tag color="default">Nháp</Tag>
                    return <Tag>{s || '—'}</Tag>
                  },
                },
                {
                  title: 'Ngày tạo',
                  render: (_: unknown, r: AdminExam) =>
                    r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—',
                },
              ]}
            />
          </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

