import { Button, Table, Tag } from 'antd'

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

export default function LectureDashboard() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {/* Sidebar */}
      <aside className="fixed z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 p-6">
          <div className="flex items-center justify-center rounded-lg bg-primary p-1.5 text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">ExamPro</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hệ thống quản lý thi
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          <button className="sidebar-item-active flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">edit_document</span>
            Soạn đề thi
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Bank đề cá nhân
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">send</span>
            Giao bài cho lớp
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">groups</span>
            Quản lý lớp học
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">assignment</span>
            Danh sách bài đã giao
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">bar_chart</span>
            Thống kê kết quả
          </button>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">account_circle</span>
              Hồ sơ giảng viên
            </button>
            <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10">
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="w-1/3">
            <div className="group relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, đề thi..."
                className="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-600 transition-colors hover:text-primary dark:text-slate-400">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">TS. Nguyễn Văn A</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Giảng viên Công nghệ
                </p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <img
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALND6k2_wy0lcBZ1j7RmE8Do8IuT--SRJy0g-QEcbRwoRxGEFeGYXr8MVBf99ndf82s3AlqodutH8JIxd8TSx2oeBeNhd5cDAB2D6aCcknWAHXZJGJTWR3UO0sHznK4YPny6riiqomREFPRtOkevZx6eCPg64U5knKp4EYqR-gYZ-IBR7DMpVvxiCcbTMIlwH2qyFVIwOcnsSN2Fdsse0tsXpWiN21AJPxcBwx7JmDwmMgaB3hknDCsier31MNE2OUTyzbrIaSNmNt"
                />
              </div>
              <span className="material-symbols-outlined cursor-pointer text-slate-400">
                keyboard_arrow_down
              </span>
            </div>
          </div>
        </header>

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

