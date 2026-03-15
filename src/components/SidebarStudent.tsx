import { Link } from 'react-router-dom'
import { logout } from '../apis/authApi'
import { clearSessionAndRedirectToLogin } from '../utils/session'

export type SidebarStudentProps = {
  /** 'overview' | 'exams' | 'subjects' | 'practice' | 'history' | 'rank' | 'profile' */
  activeItem?: string
  /** exam-list | dashboard | subject-list (Danh sách môn học) */
  variant?: 'exam-list' | 'dashboard' | 'subject-list'
  /** Avatar URL cho user card (variant subject-list) */
  userAvatarUrl?: string
  /** Tên hiển thị (variant subject-list) */
  userName?: string
  /** Lớp / subtitle (variant subject-list) */
  userSubtitle?: string
}

export default function SidebarStudent({
  activeItem = 'exams',
  variant = 'exam-list',
  userAvatarUrl,
  userName = 'Nguyễn Văn A',
  userSubtitle = 'Học sinh lớp 12A1',
}: SidebarStudentProps) {
  const base =
    'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800'
  const inactive = `${base} text-slate-600 dark:text-slate-400`
  const activeClass = (isActive: boolean, primary = false) =>
    isActive
      ? primary
        ? 'flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 font-semibold text-primary'
        : 'flex w-full items-center gap-3 rounded-lg border-r-4 border-primary bg-primary/10 px-4 py-3 text-left font-medium text-primary'
      : inactive

  if (variant === 'subject-list') {
    const navItem = (isActive: boolean) =>
      isActive
        ? 'sidebar-active flex items-center gap-3 rounded-lg px-4 py-3 bg-primary/10 text-primary border-r-4 border-primary'
        : 'flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
    return (
      <aside className="fixed z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 p-6">
          <div className="rounded-lg bg-primary p-2 text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <span className="text-lg font-bold leading-tight tracking-tight">
            AI Exam Center
          </span>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-4">
          <Link to="/user/dashboard" className={navItem(activeItem === 'overview')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link to="/user/subject-list" className={navItem(activeItem === 'subjects')}>
            <span className="material-symbols-outlined">book</span>
            <span className="text-sm font-medium">Danh sách môn học</span>
          </Link>
          <button type="button" className={navItem(false)}>
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span className="text-sm font-medium">Kết quả học tập</span>
          </button>
          <button type="button" className={navItem(false)}>
            <span className="material-symbols-outlined">edit_note</span>
            <span className="text-sm font-medium">Luyện đề</span>
          </button>
          <button type="button" className={navItem(false)}>
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">Hồ sơ cá nhân</span>
          </button>
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-slate-500">{userSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => logout().finally(() => clearSessionAndRedirectToLogin())}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Đăng xuất"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>
    )
  }

  if (variant === 'dashboard') {
    return (
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 p-6">
          <div className="rounded-lg bg-primary p-2 text-white">
            <span className="material-symbols-outlined block">school</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ExamPro
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <div
            className={
              activeItem === 'exams'
                ? 'flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 font-semibold text-primary'
                : 'flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }
          >
            <span className="material-symbols-outlined">library_books</span>
            <span className="text-sm font-medium">Danh sách đề thi</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">edit_note</span>
            <span className="text-sm font-medium">Luyện đề</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm font-medium">Lịch sử làm bài</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="text-sm font-medium">Bảng xếp hạng</span>
          </div>
        </nav>

        <div className="space-y-1 border-t border-slate-200 px-4 py-6 dark:border-slate-800">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">Hồ sơ cá nhân</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Cài đặt</span>
          </div>
          <button
            type="button"
            onClick={() => logout().finally(() => clearSessionAndRedirectToLogin())}
            className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    )
  }

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

      <nav className="mt-4 flex-1 space-y-1 px-3">
        <button
          type="button"
          className={activeClass(activeItem === 'overview', true)}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-medium">Tổng quan</span>
        </button>
        <button
          type="button"
          className={activeClass(activeItem === 'exams')}
        >
          <span
            className={`material-symbols-outlined ${activeItem === 'exams' ? 'text-primary' : ''}`}
          >
            description
          </span>
          <span className={activeItem === 'exams' ? '' : 'font-medium'}>
            Danh sách đề thi
          </span>
        </button>
        <button type="button" className={inactive}>
          <span className="material-symbols-outlined">history</span>
          <span className="font-medium">Lịch sử làm bài</span>
        </button>
        <button type="button" className={inactive}>
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-medium">Bảng xếp hạng</span>
        </button>
        <button type="button" className={inactive}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-medium">Hồ sơ cá nhân</span>
        </button>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => logout().finally(() => clearSessionAndRedirectToLogin())}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
