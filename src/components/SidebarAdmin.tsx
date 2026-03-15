import { Link } from 'react-router-dom'
import { logout } from '../apis/authApi'
import { clearSessionAndRedirectToLogin } from '../utils/session'

export type SidebarAdminProps = {
  activeItem?: string
}

export default function SidebarAdmin({ activeItem = 'dashboard' }: SidebarAdminProps) {
  const activeNav = 'active-nav flex w-full items-center gap-3 px-6 py-3 text-left font-medium'
  const inactive =
    'flex w-full items-center gap-3 px-6 py-3 text-left text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'

  return (
    <aside className="fixed flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <span className="material-symbols-outlined">quiz</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            ExamPro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bảng điều khiển Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
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
          <button type="button" className={inactive}>
            <span className="material-symbols-outlined">database</span>
            Ngân hàng câu hỏi
          </button>
          <Link to="/admin/all-subjects" className={activeItem === 'subjects' ? activeNav : inactive}>
            <span className="material-symbols-outlined">category</span>
            Danh mục môn học
          </Link>
          <Link to="/admin/list-of-class" className={activeItem === 'classes' ? activeNav : inactive}>
            <span className="material-symbols-outlined">groups</span>
            Quản lý lớp học
          </Link>
        </div>

        <div className="mt-8 space-y-1 border-t border-slate-100 pt-8 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              logout().finally(() => clearSessionAndRedirectToLogin())
            }}
            className="flex w-full items-center gap-3 px-6 py-3 text-left text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  )
}
