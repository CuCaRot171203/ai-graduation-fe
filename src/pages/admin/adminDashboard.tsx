import { Button, Select, Table, Tag } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'

const { Option } = Select

type RecentExam = {
  key: string
  name: string
  subject: string
  lecturer: string
  status: 'active' | 'draft' | 'archived'
  createdAt: string
}

const recentExams: RecentExam[] = [
  {
    key: '1',
    name: 'Giải tích nâng cao II',
    subject: 'Toán học',
    lecturer: 'TS. Sarah Connor',
    status: 'active',
    createdAt: '24/10/2023',
  },
  {
    key: '2',
    name: 'Cấu trúc dữ liệu 101',
    subject: 'Khoa học máy tính',
    lecturer: 'GS. Alan Turing',
    status: 'draft',
    createdAt: '23/10/2023',
  },
  {
    key: '3',
    name: 'Hóa hữu cơ - Giữa kỳ',
    subject: 'Hóa học',
    lecturer: 'Marie Curie',
    status: 'active',
    createdAt: '22/10/2023',
  },
  {
    key: '4',
    name: 'Lịch sử thế giới 1945',
    subject: 'Lịch sử',
    lecturer: 'N. Machiavelli',
    status: 'archived',
    createdAt: '20/10/2023',
  },
]

const columns = [
  {
    title: 'Tên đề thi',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Môn học',
    dataIndex: 'subject',
    key: 'subject',
  },
  {
    title: 'Giảng viên',
    dataIndex: 'lecturer',
    key: 'lecturer',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: RecentExam['status']) => {
      if (status === 'active') {
        return (
          <Tag color="green" className="text-[10px] font-bold uppercase">
            Đang hoạt động
          </Tag>
        )
      }
      if (status === 'draft') {
        return (
          <Tag color="orange" className="text-[10px] font-bold uppercase">
            Bản nháp
          </Tag>
        )
      }
      return (
        <Tag className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-700">
          Lưu trữ
        </Tag>
      )
    },
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
]

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background-light font-display dark:bg-background-dark">
      <SidebarAdmin activeItem="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="admin"
          searchPlaceholder="Tìm kiếm đề thi, người dùng hoặc báo cáo..."
          userName="Alex Rivera"
          userSubtitle="Super Admin"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Quản trị viên"
        />

        <div className="space-y-8 p-8">
          {/* Thống kê tổng quan */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  +12%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng người dùng
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                12.450
              </h3>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/20">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  +5%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng giảng viên
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                420
              </h3>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/20">
                  <span className="material-symbols-outlined">sticky_note_2</span>
                </div>
                <span className="text-xs font-medium text-slate-400">Ổn định</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng đề thi
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                1.200
              </h3>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/20">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  +15%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng câu hỏi
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                45.000
              </h3>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/20">
                  <span className="material-symbols-outlined">play_circle</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  +22%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Số bài thi hôm nay
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                850
              </h3>
            </div>
          </section>

          {/* Biểu đồ & phân bố môn học */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Lượt làm bài hằng ngày
                  </h4>
                  <p className="text-sm text-slate-500">
                    Mức độ sử dụng hệ thống 14 ngày gần nhất
                  </p>
                </div>
                <Select
                  defaultValue="14"
                  size="small"
                  className="w-36"
                >
                  <Option value="14">14 ngày gần nhất</Option>
                  <Option value="30">30 ngày gần nhất</Option>
                </Select>
              </div>
              <div className="flex h-64 items-end justify-between gap-2 px-2">
                {[40, 55, 45, 70, 85, 60, 50, 65, 90, 75, 60, 80, 95, 100].map(
                  (height, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-lg bg-primary/20 transition-all hover:bg-primary ${
                        index === 13 ? 'bg-primary' : ''
                      }`}
                      style={{ height: `${height}%` }}
                      title={`Ngày ${index + 1}`}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                Phân bố môn học
              </h4>
              <div className="relative flex items-center justify-center py-4">
                <svg className="h-48 w-48 -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeDasharray="502"
                    strokeDashoffset="150"
                    strokeWidth="20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="transparent"
                    stroke="#10B981"
                    strokeDasharray="502"
                    strokeDashoffset="400"
                    strokeWidth="20"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    742
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Môn đang hoạt động
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Khoa học &amp; Công nghệ
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    45%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Toán học
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    28%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-200" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Khác
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    27%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bảng đề thi & hoạt động gần đây */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-50 p-6 dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Đề thi tạo gần đây
                </h4>
                <Button
                  type="link"
                  className="p-0 text-sm font-semibold text-primary"
                >
                  Xem tất cả
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table
                  dataSource={recentExams}
                  columns={columns}
                  pagination={false}
                  size="small"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                Hoạt động gần đây
              </h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/30">
                    <span className="material-symbols-outlined text-sm">
                      history_edu
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      <span className="font-semibold">TS. Sarah Connor</span> vừa
                      tạo đề thi mới
                    </p>
                    <p className="mt-1 text-xs text-slate-400">2 phút trước</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      <span className="font-semibold">James Wilson</span> hoàn thành
                      bài thi &quot;Giải tích I&quot;
                    </p>
                    <p className="mt-1 text-xs text-slate-400">15 phút trước</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30">
                    <span className="material-symbols-outlined text-sm">
                      update
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      Cập nhật ngân hàng câu hỏi môn{' '}
                      <span className="font-semibold">Khoa học máy tính</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">1 giờ trước</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-sm">
                      person_add
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      50 người dùng mới đăng ký hôm nay
                    </p>
                    <p className="mt-1 text-xs text-slate-400">4 giờ trước</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-900/30">
                    <span className="material-symbols-outlined text-sm">
                      report_problem
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      Sao lưu hệ thống hoàn tất với 1 cảnh báo
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Hôm qua lúc 23:45
                    </p>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full rounded-lg bg-slate-50 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                Tải thêm hoạt động
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

