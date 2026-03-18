import { Link } from 'react-router-dom'
import { logout } from '../apis/authApi'
import { clearSessionAndRedirectToLogin } from '../utils/session'

export type SidebarStudentProps = {
  /** 'overview' | 'exams' | 'subjects' | 'practice' | 'history' | 'rank' | 'profile' */
  activeItem?: string
  /** exam-list | dashboard | subject-list (Danh sách môn học) */
  variant?: 'exam-list' | 'dashboard' | 'subject-list'
}

export default function SidebarStudent({
  activeItem = 'overview',
}: SidebarStudentProps) {
  const navLink = (isActive: boolean) =>
    isActive
      ? 'flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-primary transition-colors'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'

  return (
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        <Link to="/user/dashboard" className={`w-full ${navLink(activeItem === 'overview')}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-medium">Tổng quan</span>
        </Link>
        <Link to="/user/exam-list" className={`w-full ${navLink(activeItem === 'exams')}`}>
          <span className="material-symbols-outlined">description</span>
          <span className="text-sm font-medium">Làm đề thi</span>
        </Link>
        <Link to="/user/subject-list" className={`w-full ${navLink(activeItem === 'practice')}`}>
          <span className="material-symbols-outlined">edit_note</span>
          <span className="text-sm font-medium">Luyện tập</span>
        </Link>
        <Link to="/user/history" className={`w-full ${navLink(activeItem === 'history')}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="text-sm font-medium">Lịch sử làm bài</span>
        </Link>
        <Link to="/user/leaderboard" className={`w-full ${navLink(activeItem === 'rank')}`}>
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="text-sm font-medium">Bảng xếp hạng</span>
        </Link>
        <Link to="/user/ai-support" className={`w-full ${navLink(activeItem === 'ai-support')}`}>
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="text-sm font-medium">Trợ lý AI</span>
        </Link>
      </nav>

      <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
        <Link to="/user/profile" className={`w-full ${navLink(activeItem === 'profile')}`}>
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-sm font-medium">Hồ sơ cá nhân</span>
        </Link>
        <button
          type="button"
          onClick={() => logout().finally(() => clearSessionAndRedirectToLogin())}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
