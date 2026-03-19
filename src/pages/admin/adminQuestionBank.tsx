import { useCallback, useEffect, useState } from 'react'
import { Table, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getQuestions, type Question } from '../../apis/questionsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

function stripHtml(html?: string): string {
  if (!html) return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

export default function AdminQuestionBank() {
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true)
    try {
      const res = await getQuestions({ page: 1, limit: 50 })
      setQuestions(res.data?.questions ?? [])
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Không thể tải ngân hàng câu hỏi')
    } finally {
      setQuestionsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchQuestions()
  }, [fetchQuestions])

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="question-bank" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Quản trị viên"
          userSubtitle="Ngân hàng câu hỏi"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Ngân hàng câu hỏi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý toàn bộ câu hỏi trong hệ thống.</p>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1400px] space-y-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<Question>
                rowKey="id"
                loading={questionsLoading}
                dataSource={questions}
                columns={[
                  { title: 'ID', dataIndex: 'id', width: 70 },
                  {
                    title: 'Nội dung',
                    render: (_: unknown, r: Question) => (
                      <span title={stripHtml(r.contentHtml)}>{stripHtml(r.contentHtml)}</span>
                    ),
                  },
                  { title: 'Đáp án', dataIndex: 'correctAnswer', width: 90 },
                  { title: 'Mức độ', dataIndex: 'bloomLevel', width: 130 },
                  { title: 'Chủ đề', dataIndex: 'topic', width: 160 },
                ]}
                pagination={{ pageSize: 20, showSizeChanger: false }}
                locale={{ emptyText: 'Chưa có câu hỏi.' }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

