import { useCallback, useEffect, useState } from 'react'
import { message, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getQuestions, type Question, type QuestionsPagination } from '../../apis/questionsApi'
import type { LoginUser } from '../../apis/authApi'

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALND6k2_wy0lcBZ1j7RmE8Do8IuT--SRJy0g-QEcbRwoRxGEFeGYXr8MVBf99ndf82s3AlqodutH8JIxd8TSx2oeBeNhd5cDAB2D6aCcknWAHXZJGJTWR3UO0sHznK4YPny6riiqomREFPRtOkevZx6eCPg64U5knKp4EYqR-gYZ-IBR7DMpVvxiCcbTMIlwH2qyFVIwOcnsSN2Fdsse0tsXpWiN21AJPxcBwx7JmDwmMgaB3hknDCsier31MNE2OUTyzbrIaSNmNt'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

function formatTopic(topic: string): string {
  if (!topic) return '—'
  return topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const BLOOM_LEVEL: Record<string, { color: string; label: string }> = {
  nhan_biet: { color: 'green', label: 'Nhận biết' },
  thong_hieu: { color: 'blue', label: 'Thông hiểu' },
  van_dung: { color: 'orange', label: 'Vận dụng' },
  phan_tich: { color: 'purple', label: 'Phân tích' },
  danh_gia: { color: 'red', label: 'Đánh giá' },
  sang_tao: { color: 'cyan', label: 'Sáng tạo' },
}

const DEFAULT_PARAMS = { page: 1, limit: 20 }

type QuestionRow = Question & { key: number; stt: number }

export default function LectureQuestionBank() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [pagination, setPagination] = useState<QuestionsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchQuestions = useCallback(() => {
    setLoading(true)
    getQuestions({ page: params.page, limit: params.limit })
      .then((res) => {
        const list = res.data?.questions ?? []
        setQuestions(
          list.map((q, i) => ({
            ...q,
            key: q.id,
            stt: (params.page - 1) * params.limit + i + 1,
          }))
        )
        if (res.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => message.error(err?.message ?? 'Lỗi tải danh sách câu hỏi'))
      .finally(() => setLoading(false))
  }, [params.page, params.limit])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const renderBloomLevel = (bloomLevel: string) => {
    const key = (bloomLevel || '').toLowerCase().replace(/\s+/g, '_')
    const config = BLOOM_LEVEL[key] ?? { color: 'default', label: formatTopic(bloomLevel || '') }
    return <Tag color={config.color}>{config.label || '—'}</Tag>
  }

  const columns: ColumnsType<QuestionRow> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 64,
      align: 'center',
      render: (stt: number) => String(stt).padStart(2, '0'),
    },
    {
      title: 'NỘI DUNG CÂU HỎI',
      key: 'contentHtml',
      width: 240,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-slate-800 dark:text-slate-200" title={stripHtml(record.contentHtml)}>
          {stripHtml(record.contentHtml)}
        </span>
      ),
    },
    {
      title: 'ĐÁP ÁN A',
      key: 'optionA',
      width: 120,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-slate-600 dark:text-slate-400">{record.options?.A ?? '—'}</span>
      ),
    },
    {
      title: 'ĐÁP ÁN B',
      key: 'optionB',
      width: 120,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-slate-600 dark:text-slate-400">{record.options?.B ?? '—'}</span>
      ),
    },
    {
      title: 'ĐÁP ÁN C',
      key: 'optionC',
      width: 120,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-slate-600 dark:text-slate-400">{record.options?.C ?? '—'}</span>
      ),
    },
    {
      title: 'ĐÁP ÁN D',
      key: 'optionD',
      width: 120,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-slate-600 dark:text-slate-400">{record.options?.D ?? '—'}</span>
      ),
    },
    {
      title: 'ĐÁP ÁN ĐÚNG',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 100,
      align: 'center',
      render: (ans: string) => (
        <span className="font-semibold text-primary">{ans || '—'}</span>
      ),
    },
    {
      title: 'BLOOM LEVEL',
      key: 'bloomLevel',
      width: 120,
      render: (_, record) => renderBloomLevel(record.bloomLevel),
    },
    {
      title: 'TOPIC',
      dataIndex: 'topic',
      key: 'topic',
      width: 120,
      render: (topic: string) => (
        <span className="text-slate-600 dark:text-slate-400">{formatTopic(topic || '')}</span>
      ),
    },
  ]

  const total = pagination.total

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="question-bank" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchPlaceholder="Tìm kiếm câu hỏi..."
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Ngân hàng câu hỏi"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Preview câu hỏi
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {total} câu đã nhận diện
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Tất cả dữ liệu hợp lệ
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<QuestionRow>
                columns={columns}
                dataSource={questions}
                rowKey="key"
                loading={loading}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (t) => `Tổng ${t} câu hỏi`,
                  onChange: (page, pageSize) =>
                    setParams((p) => ({ ...p, page, limit: pageSize ?? p.limit })),
                }}
                size="middle"
                scroll={{ x: 1200 }}
                locale={{ emptyText: 'Chưa có câu hỏi nào.' }}
                className="[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-100 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:px-4 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:px-4 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50 dark:[&_.ant-table-thead>tr>th]:border-slate-700 dark:[&_.ant-table-thead>tr>th]:!bg-slate-800/80 dark:[&_.ant-table-thead>tr>th]:!text-slate-300 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/50"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
