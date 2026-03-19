import { Link } from 'react-router-dom'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import type { LoginUser } from '../../apis/authApi'

const TEACHER_AVATAR =
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

function CardLink({
  to,
  icon,
  title,
  desc,
  accentClass,
}: {
  to: string
  icon: string
  title: string
  desc: string
  accentClass: string
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-xl p-3 ${accentClass}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-700">
          arrow_forward
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-800/50 dark:text-slate-300">
        Bắt đầu
        <span className="material-symbols-outlined text-base">chevron_right</span>
      </div>
    </Link>
  )
}

export default function LectureAiSupport() {
  const user = getStoredUser()

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarLecture activeItem="ai-support" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Trợ lý async function name(params:type) {
                  
                }
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn một tác vụ để bắt đầu.
              </p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="Trợ lý AI"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Teacher"
        />

        <div className="mx-auto w-full max-w-[1200px] flex-1 space-y-6 p-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Trợ lý AI cho giảng viên
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  Hỏi nhanh kiến thức/ý tưởng hoặc tạo đề thi bằng AI theo yêu cầu của bạn.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-base">smart_toy</span>
                AI Support
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CardLink
              to="/lecture/ai-support/ask"
              icon="chat"
              title="Tạo câu hỏi bằng AI"
              desc="Trao đổi nhanh: gợi ý câu hỏi, giải thích, outline nội dung, v.v."
              accentClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
            />
            <CardLink
              to="/lecture/ai-support/generate-exam"
              icon="assignment"
              title="Tạo đề với AI"
              desc="Nhập yêu cầu đề thi và chọn môn học để AI tạo đề tự động."
              accentClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300"
            />
          </section>
        </div>
      </main>
    </div>
  )
}

