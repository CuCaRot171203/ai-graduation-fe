import { useNavigate } from 'react-router-dom'
import { Button, Input } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZqf0V5GhuPSzfem0N2P68f3MrXH71A0nF-DFvoxuoGMW5yv0MJ0ouenjgHfthrOcXq3uM6j5NnG-4xSt7uLA4DEiTheVArSK35G_QJUhYqeThCN-jlgQ4iw3qMb2dv91kLrGGscFn_DlelMVTfOIcpZbUWlPfpjoyHq7ZQIgv3IDuPGjRE_PvNmF8GU_WaTiDKCkNx6n3PE8eqUQNiq00PCpGSJXo4XZBe1TeT-V0bY6NjC60_dGxJW5j40CXNZm3zHCdHhO6XQXz'

type SubjectCard = {
  id: string
  title: string
  description: string
  category: string
  icon: string
  iconBg: string
  iconColor: string
  teacherCount: number
  studentCount: number
}

const SUBJECTS: SubjectCard[] = [
  {
    id: '1',
    title: 'Toán học nâng cao',
    description:
      'Hệ thống kiến thức giải đề thi THPT Quốc gia với sự hỗ trợ của thuật toán AI phân tích lỗi sai.',
    category: 'Tự nhiên',
    icon: 'calculate',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-primary',
    teacherCount: 5,
    studentCount: 120,
  },
  {
    id: '2',
    title: 'Lập trình Python AI',
    description:
      'Học lập trình từ cơ bản đến xây dựng các mô hình AI thực tiễn phục vụ đồ án tốt nghiệp.',
    category: 'Công nghệ',
    icon: 'code',
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    iconColor: 'text-orange-600',
    teacherCount: 3,
    studentCount: 85,
  },
  {
    id: '3',
    title: 'Trí tuệ nhân tạo',
    description:
      'Tìm hiểu về các mô hình học máy (Machine Learning) và mạng thần kinh nhân tạo.',
    category: 'AI Cơ bản',
    icon: 'psychology',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
    teacherCount: 4,
    studentCount: 200,
  },
  {
    id: '4',
    title: 'Xử lý ngôn ngữ tự nhiên',
    description:
      'Ứng dụng AI trong phân tích văn bản, dịch thuật và xây dựng Chatbot thông minh.',
    category: 'NLP',
    icon: 'translate',
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-green-600',
    teacherCount: 2,
    studentCount: 50,
  },
  {
    id: '5',
    title: 'Sinh học & AI',
    description:
      'Kết hợp dữ liệu sinh học và AI để giải quyết các bài toán về di truyền và y học.',
    category: 'Khoa học',
    icon: 'biotech',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    teacherCount: 3,
    studentCount: 42,
  },
  {
    id: '6',
    title: 'Vật lý tính toán',
    description:
      'Mô phỏng các hiện tượng vật lý phức tạp bằng các thư viện phần mềm chuyên dụng.',
    category: 'Vật lý',
    icon: 'science',
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600',
    teacherCount: 4,
    studentCount: 76,
  },
]

export default function SubjectList() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarStudent
        variant="subject-list"
        activeItem="subjects"
        userAvatarUrl={STUDENT_AVATAR}
        userName="Nguyễn Văn A"
        userSubtitle="Học sinh lớp 12A1"
      />

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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.id}
                className="group flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-lg p-3 ${subject.iconBg} ${subject.iconColor}`}
                  >
                    <span className="material-symbols-outlined">
                      {subject.icon}
                    </span>
                  </div>
                  <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {subject.category}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                  {subject.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {subject.description}
                </p>
                <div className="mb-6 flex flex-col gap-2 border-t border-slate-50 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      person_pin
                    </span>
                    <span>Số giáo viên: {subject.teacherCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      group
                    </span>
                    <span>Số học sinh: {subject.studentCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="primary"
                    className="flex-1 font-semibold"
                    onClick={() => {}}
                  >
                    Đăng ký học
                  </Button>
                  <Button
                    type="text"
                    className="px-3 font-medium text-slate-600 hover:!text-primary dark:text-slate-400"
                    onClick={() => navigate('/user/dashboard')}
                  >
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
