import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Empty, message } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getAiClassById, type AiClassItem } from '../../apis/aiExamApi'
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

export default function LectureClassResults() {
  const { classId } = useParams()
  const idNum = Number(classId)

  const [loading, setLoading] = useState(true)
  const [cls, setCls] = useState<AiClassItem | null>(null)

  const fetchClass = useCallback(() => {
    if (!Number.isFinite(idNum)) return
    setLoading(true)
    getAiClassById(idNum)
      .then((res) => setCls(res.data))
      .catch((err) => message.error(err?.message ?? 'Lỗi tải lớp'))
      .finally(() => setLoading(false))
  }, [idNum])

  useEffect(() => {
    fetchClass()
  }, [fetchClass])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Kết quả lớp</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cls?.name ?? (loading ? 'Đang tải...' : '—')}</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Kết quả"
          avatarUrl={TEACHER_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kết quả lớp</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Trang này là placeholder. Khi có API “class results”, mình sẽ nối dữ liệu + biểu đồ/bảng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/lecture/classes">
                  <Button className="rounded-lg">Quay lại</Button>
                </Link>
                <Button className="rounded-lg" icon={<span className="material-symbols-outlined">refresh</span>} onClick={fetchClass}>
                  Làm mới
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <Empty description="Chưa có dữ liệu kết quả lớp." />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

