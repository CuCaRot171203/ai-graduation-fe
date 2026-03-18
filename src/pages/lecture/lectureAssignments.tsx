import { Link } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

export default function LectureAssignments() {
  const user = getStoredUser()

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="assignments" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Giao bài</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chọn kiểu giao bài cho lớp.</p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="Assignments"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tạo giao bài</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Chọn một trong hai lựa chọn bên dưới để bắt đầu.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <Link
                to="/lecture/assignments/homework"
                className="group flex flex-col rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary">assignment</span>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Giao bài tập</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Bài tập theo chủ đề, có deadline</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xl text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
                <div className="mt-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Phù hợp giao bài thường xuyên và theo dõi tiến độ.
                </div>
              </Link>

              <Link
                to="/lecture/assignments/mock-exam"
                className="group flex flex-col rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary">quiz</span>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Giao đề thi thử</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Đề mô phỏng, tính điểm tự động</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xl text-slate-400 transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
                <div className="mt-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Phù hợp giao bài thi thử theo thời gian và chấm điểm.
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

