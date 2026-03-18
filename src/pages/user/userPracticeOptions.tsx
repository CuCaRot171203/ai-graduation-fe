import { Link, useParams } from 'react-router-dom'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

function OptionCard({
  to,
  icon,
  title,
  desc,
  tone,
}: {
  to: string
  icon: string
  title: string
  desc: string
  tone: 'primary' | 'ai'
}) {
  const toneCls =
    tone === 'primary'
      ? 'from-primary/15 via-sky-500/10 to-emerald-500/10 hover:border-primary/40'
      : 'from-violet-500/15 via-fuchsia-500/10 to-sky-500/10 hover:border-violet-500/40'
  const iconBg = tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-violet-500/10 text-violet-600'
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={`rounded-2xl bg-gradient-to-r ${toneCls} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 backdrop-blur dark:bg-slate-900/60 dark:text-slate-300">
            Chọn
          </span>
        </div>
        <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 group-hover:text-primary dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</p>
      </div>
    </Link>
  )
}

export default function UserPracticeOptions() {
  const { subjectId } = useParams()
  const id = subjectId ?? ''

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarStudent activeItem="practice" variant="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          userName="Học sinh"
          userSubtitle="Luyện tập"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Chọn hình thức luyện tập</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bạn muốn luyện tập theo đề hay tạo câu hỏi bằng AI?</p>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Môn học</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Subject ID: {id || '—'}</p>
                </div>
                <Link to="/user/subject-list" className="text-sm font-semibold text-primary hover:underline">
                  Quay lại danh sách môn
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <OptionCard
                to={`/user/subjects/${id}/practice/exams`}
                icon="description"
                title="Luyện tập với đề"
                desc="Chọn đề theo môn và bắt đầu làm bài như thi thật."
                tone="primary"
              />
              <OptionCard
                to={`/user/subjects/${id}/practice/ai`}
                icon="smart_toy"
                title="Luyện tập với AI"
                desc="Nhập chủ đề và mức độ, AI sẽ tạo câu hỏi để bạn luyện nhanh."
                tone="ai"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

