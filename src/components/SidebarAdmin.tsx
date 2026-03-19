import { Link } from 'react-router-dom'
import { logout } from '../apis/authApi'
import { clearSessionAndRedirectToLogin } from '../utils/session'

export type SidebarAdminProps = {
  activeItem?: string
  compact?: boolean
}

export default function SidebarAdmin({ activeItem = 'dashboard', compact = false }: SidebarAdminProps) {
  const activeNav = 'active-nav flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium'
  const inactive =
    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'

  return (
    <aside className={`fixed flex h-full ${compact ? 'w-60' : 'w-64'} flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900`}>
      <div className="flex items-center gap-3 p-5">
        <div className="flex items-center justify-center rounded-lg bg-primary p-1.5 text-white">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">
            ExamPro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống quản lý thi
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          <Link to="/admin/dashboard" className={activeItem === 'dashboard' ? activeNav : inactive}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/admin/user-list" className={activeItem === 'users' ? activeNav : inactive}>
            <span className="material-symbols-outlined">group</span>
            Quản lý người dùng
          </Link>
          <Link to="/admin/exam-dashboard" className={activeItem === 'exams' ? activeNav : inactive}>
            <span className="material-symbols-outlined">description</span>
            Quản lý đề thi
          </Link>
          <Link to="/admin/question-bank" className={activeItem === 'question-bank' ? activeNav : inactive}>
            <span className="material-symbols-outlined">database</span>
            Ngân hàng câu hỏi
          </Link>
          <Link to="/admin/topics" className={activeItem === 'topics' ? activeNav : inactive}>
            <span className="material-symbols-outlined">topic</span>
            Quản lý chủ đề
          </Link>
          <Link to="/admin/all-subjects" className={activeItem === 'subjects' ? activeNav : inactive}>
            <span className="material-symbols-outlined">category</span>
            Danh mục môn học
          </Link>
          <Link to="/admin/list-of-class" className={activeItem === 'classes' ? activeNav : inactive}>
            <span className="material-symbols-outlined">groups</span>
            Quản lý lớp học
          </Link>
        </div>

        <div className="mt-6 space-y-1 border-t border-slate-100 pt-6 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              logout().finally(() => clearSessionAndRedirectToLogin())
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  )
}
