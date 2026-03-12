import { Input, Select, Tag, Button, Pagination } from 'antd'

const { Search } = Input

const mockExams = [
  {
    id: 1,
    subject: 'Toán học',
    level: 'Cơ bản',
    title: 'Đề thi cuối kỳ môn Toán',
    description:
      'Bao quát kiến thức Giải tích, Đại số và Lượng giác trọng tâm.',
    questions: 50,
    duration: '60 Mins',
    subjectColor: 'blue',
    levelColor: 'green',
  },
  {
    id: 2,
    subject: 'Vật lý',
    level: 'Trung bình',
    title: 'Bài kiểm tra Vật lý nâng cao',
    description:
      'Kiểm tra kiến thức về Cơ học lượng tử và Thuyết tương đối.',
    questions: 30,
    duration: '45 phút',
    subjectColor: 'purple',
    levelColor: 'blue',
  },
]

export default function ExamListScreen() {
  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar simples (placeholder) */}
      <aside className="fixed z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ExamPro</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hệ thống thi trực tuyến
            </p>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">Tổng quan</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg border-r-4 border-primary bg-primary/10 px-4 py-3 text-left font-medium text-primary">
            <span className="material-symbols-outlined text-primary">
              description
            </span>
            <span>Danh sách đề thi</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">history</span>
            <span className="font-medium">Lịch sử làm bài</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-medium">Bảng xếp hạng</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">person</span>
            <span className="font-medium">Hồ sơ cá nhân</span>
          </button>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10">
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="w-full max-w-md">
            <Search
              placeholder="Tìm kiếm nhanh..."
              allowClear
              className="[&_.ant-input]:rounded-xl [&_.ant-input]:bg-slate-50 [&_.ant-input]:dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-primary dark:border-slate-900" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800">
              <div className="text-right">
                <p className="text-sm font-semibold">Alex Johnson</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mã học sinh: 48291
                </p>
              </div>
              <img
                className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS-es88F2PUY9ei1Vet9xZq80MXX2efV1PxLvRue-JAJxj_iL_LX_Q-_3dkYb2ZkwW0IhYzB7R_V7eh4NblXgD7AY3y_vF1jfcVoz-AvUy9d85okFh0yKj72wEZpvbeuCYVG52hKthuaOTPLTm-ZRDP61tNtiob1MyA37Q4FtBinX21kGc-DkEp2mc0QtqD_CBtRctEDjZp3dA1RaDv3zKIGYn4yJJwfabl-1YZVH8f6O7jCkW4WK1gAwT-7AMkRlrnPQPjuOG5pfL"
                alt="User avatar"
              />
            </div>
          </div>
        </header>

        <main className="space-y-8 p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Danh sách đề thi
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Chọn một đề thi đang mở để bắt đầu làm bài.
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
                <Search
                  placeholder="Lọc theo tên đề thi..."
                  allowClear
                  className="max-w-sm"
                />
              </div>
            </div>
          </div>

          {/* Grade de exames */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockExams.map((exam) => (
              <div
                key={exam.id}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <Tag
                    color={exam.subjectColor}
                    className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  >
                    {exam.subject}
                  </Tag>
                  <Tag
                    color={exam.levelColor}
                    className="px-2 py-1 text-[10px] font-bold uppercase"
                  >
                    {exam.level}
                  </Tag>
                </div>
                <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                  {exam.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {exam.description}
                </p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        quiz
                      </span>
                      {exam.questions} câu hỏi
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      {exam.duration}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    block
                    className="flex items-center justify-center gap-2 !bg-primary !shadow-lg !shadow-primary/20 hover:!bg-primary/90"
                  >
                    Làm bài ngay
                    <span className="material-symbols-outlined text-base">
                      play_arrow
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center pt-4">
            <Pagination defaultCurrent={1} total={50} showSizeChanger={false} />
          </div>
        </main>
      </div>
    </div>
  )
}

