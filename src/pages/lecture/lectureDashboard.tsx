import { Button, Table, Tag } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'

const recentAssignments = [
  {
    key: '1',
    name: 'Toán Cao Cấp - Chương 2',
    classCode: 'D14CNPM01',
    deadline: '20/10/2023',
    done: '42/50',
    percent: 85,
  },
  {
    key: '2',
    name: 'Lập trình Java Cơ bản',
    classCode: 'D14CNPM03',
    deadline: '22/10/2023',
    done: '20/45',
    percent: 45,
  },
  {
    key: '3',
    name: 'Cơ sở dữ liệu - Lab 1',
    classCode: 'D14HTTT02',
    deadline: '25/10/2023',
    done: '2/38',
    percent: 5,
  },
]

const columns = [
  {
    title: 'Tên đề',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Lớp học',
    dataIndex: 'classCode',
    key: 'classCode',
  },
  {
    title: 'Hạn nộp',
    dataIndex: 'deadline',
    key: 'deadline',
    render: (value: string) => (
      <span className="text-slate-500 dark:text-slate-400">{value}</span>
    ),
  },
  {
    title: 'Đã làm',
    dataIndex: 'percent',
    key: 'percent',
    align: 'center' as const,
    render: (_: number, record: (typeof recentAssignments)[number]) => (
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${record.percent}%` }}
          />
        </div>
        <span className="text-xs font-bold">{record.done}</span>
      </div>
    ),
  },
  {
    title: 'Thao tác',
    key: 'action',
    render: () => (
      <Button
        size="small"
        className="border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:!bg-primary hover:!text-white"
      >
        Xem kết quả
      </Button>
    ),
  },
]

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALND6k2_wy0lcBZ1j7RmE8Do8IuT--SRJy0g-QEcbRwoRxGEFeGYXr8MVBf99ndf82s3AlqodutH8JIxd8TSx2oeBeNhd5cDAB2D6aCcknWAHXZJGJTWR3UO0sHznK4YPny6riiqomREFPRtOkevZx6eCPg64U5knKp4EYqR-gYZ-IBR7DMpVvxiCcbTMIlwH2qyFVIwOcnsSN2Fdsse0tsXpWiN21AJPxcBwx7JmDwmMgaB3hknDCsier31MNE2OUTyzbrIaSNmNt'

export default function LectureDashboard() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchPlaceholder="Tìm kiếm tài liệu, đề thi..."
          userName="TS. Nguyễn Văn A"
          userSubtitle="Giảng viên Công nghệ"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        {/* Body */}
        <div className="mx-auto w-full max-w-[1400px] space-y-8 p-8">
          {/* Welcome */}
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Chào mừng giảng viên quay lại 👋
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Hôm nay bạn muốn quản lý lớp học hay soạn đề mới?
              </p>
            </div>
            <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Đề đã tạo
                </p>
                <p className="text-lg font-bold text-primary">24</p>
              </div>
              <div className="my-2 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bài đã giao
                </p>
                <p className="text-lg font-bold text-primary">15</p>
              </div>
              <div className="my-2 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="px-4 py-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Học sinh
                </p>
                <p className="text-lg font-bold text-primary">450</p>
              </div>
            </div>
          </section>

          {/* Stat cards */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +12%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">24</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng đề thi đã soạn
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20">
                  <span className="material-symbols-outlined">task</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +5%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">15</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng bài đã giao
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <Tag className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400 dark:bg-slate-800">
                  0%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">8</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Số lớp đang quản lý
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <Tag color="green" className="rounded-full px-2 py-1 text-xs font-bold">
                  +28%
                </Tag>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black">1,280</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng lượt học sinh làm bài
                </p>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="group flex flex-col items-center justify-center rounded-xl bg-primary p-6 text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-700">
              <span className="material-symbols-outlined mb-2 text-3xl transition-transform group-hover:scale-110">
                add_circle
              </span>
              <span className="font-bold">Soạn đề mới</span>
            </button>
            <button className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900">
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                library_books
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Tạo đề từ bank đề
              </span>
            </button>
            <button className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900">
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                forward_to_inbox
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Giao bài cho lớp
              </span>
            </button>
            <button className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900">
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400 transition-colors group-hover:text-primary">
                analytics
              </span>
              <span className="font-bold text-slate-700 group-hover:text-primary dark:text-slate-300">
                Xem thống kê kết quả
              </span>
            </button>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent assignments table */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Bài giao gần đây</h3>
                <button className="text-sm font-semibold text-primary hover:underline">
                  Xem tất cả
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Table
                  columns={columns}
                  dataSource={recentAssignments}
                  pagination={false}
                  size="small"
                  className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/50 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/30"
                />
              </div>
            </div>

            {/* Charts placeholders */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Phân tích kết quả</h3>
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-4 text-sm font-bold">Điểm trung bình lớp</h4>
                  <div className="flex h-48 items-end justify-around gap-2 px-2">
                    {[80, 65, 90, 45, 75].map((value, index) => (
                      <div
                        key={index}
                        className="group relative w-full rounded-t-lg bg-primary/20"
                        style={{ height: `${value}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {(value / 10).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>L01</span>
                    <span>L02</span>
                    <span>L03</span>
                    <span>L04</span>
                    <span>L05</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-4 text-sm font-bold">Tỷ lệ câu đúng/sai</h4>
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative h-28 w-28">
                      <svg
                        className="h-full w-full -rotate-90 transform"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-slate-100 dark:text-slate-800"
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray="100 100"
                        />
                        <path
                          className="text-emerald-500"
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray="72 100"
                          strokeLinecap="round"
                        />
                        <path
                          className="text-red-400"
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray="28 100"
                          strokeDashoffset="-72"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black">72%</span>
                        <span className="text-[8px] font-bold uppercase text-slate-400">
                          Đúng
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span className="text-xs text-slate-500">Đúng</span>
                        </div>
                        <span className="text-xs font-bold">72%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-400" />
                          <span className="text-xs text-slate-500">Sai</span>
                        </div>
                        <span className="text-xs font-bold">18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="text-xs text-slate-500">Chưa làm</span>
                        </div>
                        <span className="text-xs font-bold">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

