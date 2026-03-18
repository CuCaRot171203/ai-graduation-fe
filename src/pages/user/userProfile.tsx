import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

export default function UserProfile() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarStudent activeItem="profile" variant="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          userName="Học sinh"
          userSubtitle="Hồ sơ cá nhân"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Hồ sơ cá nhân</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cập nhật thông tin và bảo mật tài khoản.</p>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Chưa triển khai API profile cho student. (placeholder)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

