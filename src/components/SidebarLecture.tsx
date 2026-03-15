import { Link } from 'react-router-dom'
import { logout } from '../apis/authApi'
import { clearSessionAndRedirectToLogin } from '../utils/session'

export type SidebarLectureProps = {
  /** item ativo: 'dashboard' | 'subjects' | 'exams' | 'question-bank' | 'classes' | 'ai-support' | 'registerTeach' */
  activeItem?: string
  /** default: nav chính; register-teach: nav Đăng ký giảng dạy + box Liên hệ Admin */
  variant?: 'default' | 'register-teach'
}

export default function SidebarLecture({
  activeItem = 'dashboard',
  variant = 'default',
}: SidebarLectureProps) {
  const item = (_key: string, active: boolean) =>
    active
      ? 'sidebar-item-active flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors'
      : 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'

  const navLink = (isActive: boolean) =>
    isActive
      ? 'flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-primary transition-colors'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'

  if (variant === 'register-teach') {
    return (
      <aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link to="/lecture/dashboard" className={navLink(activeItem === 'dashboard')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <button type="button" className={`w-full text-left ${navLink(false)}`}>
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-sm font-medium">Quản lý môn học</span>
          </button>
          <Link to="/lecture/register-subject" className={navLink(activeItem === 'registerTeach')}>
            <span className="material-symbols-outlined">how_to_reg</span>
            <span className="text-sm font-semibold">Đăng ký giảng dạy</span>
          </Link>
          <button type="button" className={`w-full text-left ${navLink(false)}`}>
            <span className="material-symbols-outlined">school</span>
            <span className="text-sm font-medium">Đăng ký học</span>
          </button>
          <button type="button" className={`w-full text-left ${navLink(false)}`}>
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-sm font-medium">Phân tích dữ liệu</span>
          </button>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" className={`w-full text-left ${navLink(false)}`}>
              <span className="material-symbols-outlined">account_circle</span>
              <span className="text-sm font-medium">Hồ sơ cá nhân</span>
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hỗ trợ kỹ thuật
            </p>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-sm">support_agent</span>
              Liên hệ Admin
            </button>
          </div>
        </div>
      </aside>
    )
  }

  return (
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
        <Link to="/lecture/dashboard" className={`w-full ${navLink(activeItem === 'dashboard')}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-medium">Tổng quan</span>
        </Link>
        <Link to="/lecture/subjects" className={`w-full ${navLink(activeItem === 'subjects')}`}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-sm font-medium">Môn đang dạy</span>
        </Link>
        <Link to="/lecture/exams" className={`w-full ${navLink(activeItem === 'exams')}`}>
          <span className="material-symbols-outlined">description</span>
          <span className="text-sm font-medium">Quản lý đề</span>
        </Link>
        <Link to="/lecture/question-bank" className={`w-full ${navLink(activeItem === 'question-bank')}`}>
          <span className="material-symbols-outlined">quiz</span>
          <span className="text-sm font-medium">Ngân hàng câu hỏi</span>
        </Link>
        <button type="button" className={item('classes', activeItem === 'classes')}>
          <span className="material-symbols-outlined">groups</span>
          Quản lý lớp
        </button>
        <button type="button" className={item('ai-support', activeItem === 'ai-support')}>
          <span className="material-symbols-outlined">smart_toy</span>
          AI hỗ trợ
        </button>

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className={item('profile', activeItem === 'profile')}>
            <span className="material-symbols-outlined">account_circle</span>
            Hồ sơ giảng viên
          </button>
          <button
            type="button"
            onClick={() => logout().finally(() => clearSessionAndRedirectToLogin())}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  )
}
