import { useCallback, useEffect, useState } from 'react'
import { Button, Pagination, Table, Tag, message } from 'antd'
import SidebarStudent from '../../components/SidebarStudent'
import TheHeader from '../../components/TheHeader'
import { getPracticeHistory, type PracticeHistoryItem } from '../../apis/aiExamApi'

const STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

export default function UserHistory() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<PracticeHistoryItem[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPracticeHistory({ page, limit })
      setItems(res.data?.sessions ?? [])
      setTotal(res.data?.pagination?.totalCount ?? 0)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Không thể tải lịch sử luyện tập')
    } finally {
      setLoading(false)
    }
  }, [limit, page])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const fmtDateTime = (v?: string | null): string => {
    if (!v) return '—'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('vi-VN')
  }

  const mapStatus = (status?: string | null): { text: string; color: string } => {
    const s = (status ?? '').toLowerCase()
    if (s === 'completed') return { text: 'Đã hoàn thành', color: 'green' }
    if (s === 'in_progress') return { text: 'Đang làm', color: 'blue' }
    if (s === 'abandoned') return { text: 'Đã bỏ dở', color: 'orange' }
    if (!s) return { text: '—', color: 'default' }
    return { text: s, color: 'default' }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarStudent activeItem="history" variant="dashboard" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="student"
          userName="Học sinh"
          userSubtitle="Lịch sử làm bài"
          avatarUrl={STUDENT_AVATAR}
          avatarAlt="Student"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Lịch sử làm bài</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xem lại các lần làm bài trước đó.</p>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các phiên luyện tập gần đây của bạn.</p>
                <Button onClick={fetchHistory} loading={loading}>
                  Tải lại
                </Button>
              </div>

              <Table
                rowKey="id"
                loading={loading}
                dataSource={items}
                pagination={false}
                locale={{ emptyText: 'Chưa có lịch sử luyện tập.' }}
                columns={[
                  {
                    title: 'Môn học',
                    render: (_: unknown, r: PracticeHistoryItem) => r.subject?.name ?? r.subject?.code ?? '—',
                  },
                  {
                    title: 'Topic',
                    render: (_: unknown, r: PracticeHistoryItem) => r.topic?.name ?? r.topic?.code ?? '—',
                  },
                  {
                    title: 'Trạng thái',
                    render: (_: unknown, r: PracticeHistoryItem) => {
                      const s = mapStatus(r.status)
                      return <Tag color={s.color}>{s.text}</Tag>
                    },
                  },
                  {
                    title: 'Số câu',
                    dataIndex: 'totalQuestions',
                    align: 'center' as const,
                    width: 90,
                  },
                  {
                    title: 'Điểm',
                    align: 'center' as const,
                    width: 90,
                    render: (_: unknown, r: PracticeHistoryItem) => (r.score == null ? '—' : r.score),
                  },
                  {
                    title: 'Bắt đầu',
                    render: (_: unknown, r: PracticeHistoryItem) => fmtDateTime(r.createdAt),
                  },
                  {
                    title: 'Hoàn thành',
                    render: (_: unknown, r: PracticeHistoryItem) => fmtDateTime(r.completedAt),
                  },
                ]}
              />

              <div className="mt-4 flex justify-end">
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={total}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '30', '50']}
                  onChange={(nextPage, nextSize) => {
                    setPage(nextPage)
                    setLimit(nextSize)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

