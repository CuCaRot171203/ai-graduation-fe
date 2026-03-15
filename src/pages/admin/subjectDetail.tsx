import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Spin, Table, Tabs, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getSubjectById, type SubjectDetail } from '../../apis/subjectsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDb3KwIyO8Adn7VtI5IotX79XbfUYxFLvmm3CDIGNsIof3m9C_krKqKKKE_XthgkjD_b-MqZEB4U1ksBhuDP2Rd67hRdORpbnSV6eE5_1_T9mwEqndA0o0zi7J90VYltLKYlivkqYd0Z944DZpVcCv0rR-0VmgSh8yTwzHGHSFmk_vSjcvaINdMR0VRNOqIvwhxt3q3rYXqmOquhuB5pYpIDJ2PxxzY1r_AHQwiQp9IRXp4zwprnzEi8f6HTWWi1gRAYZ7NfP-jgbzQ'

const SUBJECT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ZEkLWngsVcp3vUbnzmug2tCtUxXQNtLVz3O93N1xvdCjl5Rgrp68-g-M96bSMGx7U6r7-idsYV4TKZ9EITsVAt0q0YdnpeC1n3Wfw_NkIYxATqCeClkBTS3D_3RMV2aHYVN5f7vcdhsJeQDXpdINsYcBzQfuLpJVHgsiU3-JNdIhWSc9Z1-8Jomf03S24gobFBgLQFeHcwz2MkJl8xjTJCM4BzMslcgqdJyEwHTyWZ9dqHoPumHkYNTBfTFwuLysu1oq0od8zS_E'

type TeacherRecord = {
  id: number
  fullName?: string
  email?: string
  registeredAt?: string
}

function parseTeachers(list: unknown[]): TeacherRecord[] {
  return list.map((t: unknown, i: number) => {
    const o = t as Record<string, unknown>
    return {
      id: (o.id as number) ?? i,
      fullName: (o.fullName as string) ?? (o.name as string) ?? '—',
      email: (o.email as string) ?? '—',
      registeredAt: (o.registeredAt as string) ?? (o.createdAt as string) ?? '—',
    }
  })
}

export default function SubjectDetail() {
  const [searchParams] = useSearchParams()
  const idParam = searchParams.get('id')
  const subjectId = idParam ? parseInt(idParam, 10) : null
  const navigate = useNavigate()

  const [detail, setDetail] = useState<SubjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subjectId == null || Number.isNaN(subjectId)) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getSubjectById(subjectId)
      .then((res) => {
        if (!cancelled) setDetail(res.data)
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Không tải được chi tiết môn học')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [subjectId])

  const teacherList = detail?.teachers ? parseTeachers(detail.teachers) : []
  const teacherColumns: ColumnsType<TeacherRecord> = [
    {
      title: 'Tên giáo viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{name}</span>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', className: 'text-slate-600 dark:text-slate-400' },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      className: 'text-slate-600 dark:text-slate-400',
      render: (v: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
  ]

  const tabItems = [
    {
      key: 'teachers',
      label: 'Giáo viên giảng dạy',
      children: (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Danh sách giáo viên ({teacherList.length})
            </h3>
          </div>
          <Table
            columns={teacherColumns}
            dataSource={teacherList}
            rowKey="id"
            pagination={{
              pageSize: 5,
              total: teacherList.length,
              showSizeChanger: false,
              showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên ${total} giáo viên`,
              className: 'mt-4',
            }}
            className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-thead>tr>th]:bg-transparent [&_.ant-table-thead>tr>th]:pb-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:py-4 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/40"
          />
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Danh sách học sinh',
      children: (
        <p className="py-4 text-slate-500 dark:text-slate-400">
          {detail?.recentStudents?.length ? `Số lượng: ${(detail.recentStudents as unknown[]).length}` : 'Chưa có học sinh.'}
        </p>
      ),
    },
    {
      key: 'materials',
      label: 'Tài liệu học tập',
      children: <p className="py-4 text-slate-500 dark:text-slate-400">Nội dung tài liệu học tập sẽ hiển thị tại đây.</p>,
    },
    {
      key: 'exam-config',
      label: 'Cấu hình thi',
      children: <p className="py-4 text-slate-500 dark:text-slate-400">Nội dung cấu hình thi sẽ hiển thị tại đây.</p>,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    )
  }

  if (!subjectId || Number.isNaN(subjectId) || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Không tìm thấy môn học.</p>
          <Link to="/admin/all-subjects" className="mt-4 inline-block text-primary hover:underline">
            Quay lại danh sách môn học
          </Link>
        </div>
      </div>
    )
  }

  const totalTeachers = detail.stats?.totalTeachers ?? 0
  const totalStudents = detail.stats?.totalStudents ?? 0

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="subjects" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div className="flex items-center gap-2">
              <Link to="/admin/all-subjects" className="text-slate-500 transition-colors hover:text-primary">
                Môn học
              </Link>
              <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">Chi tiết môn học</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Link to="/admin/all-subjects" className="hover:text-primary">Môn học</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">Chi tiết môn học</span>
              </nav>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Chi tiết môn học
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="default"
                icon={<span className="material-symbols-outlined text-sm">edit</span>}
                className="flex items-center gap-2 rounded-xl border-slate-200 font-semibold shadow-sm hover:!bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:!bg-slate-700"
                onClick={() => navigate(`/admin/update-subject?id=${detail.id}`)}
              >
                Cập nhật môn học
              </Button>
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-8 @container lg:flex-row">
              <div className="size-48 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <img src={SUBJECT_IMAGE} alt="Subject" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{detail.name}</h2>
                      <span
                        className={
                          detail.isActive
                            ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }
                      >
                        {detail.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                      </span>
                    </div>
                    <p className="text-sm font-mono uppercase tracking-wider text-slate-500">
                      Mã môn: {detail.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase text-slate-500">Ngày tạo</p>
                    <p className="text-sm font-semibold">
                      {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>
                <p className="mb-6 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">
                  {detail.description || 'Chưa có mô tả.'}
                </p>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {[
                    { label: 'Giảng viên', value: String(totalTeachers) },
                    { label: 'Học sinh', value: String(totalStudents) },
                    { label: 'Cập nhật', value: detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString('vi-VN') : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Tabs
              defaultActiveKey="teachers"
              items={tabItems}
              className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav]:border-b [&_.ant-tabs-nav]:border-slate-200 [&_.ant-tabs-nav]:bg-slate-50/50 [&_.ant-tabs-nav]:px-6 dark:[&_.ant-tabs-nav]:border-slate-800 dark:[&_.ant-tabs-nav]:bg-slate-800/50 [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-active]:!text-primary [&_.ant-tabs-ink-bar]:!bg-primary [&_.ant-tabs-content]:p-6"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
