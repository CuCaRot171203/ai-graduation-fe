import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Key as ReactKey } from 'react'
import { message, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { getQuestions, type Question, type QuestionsPagination } from '../../apis/questionsApi'
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

function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '—'
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '—'
}

function stripHtmlFull(html: string | undefined): string {
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
  const [expandedRowKeys, setExpandedRowKeys] = useState<ReactKey[]>([])
  const [filterBloom, setFilterBloom] = useState<string | undefined>(undefined)
  const [filterTopic, setFilterTopic] = useState<string | undefined>(undefined)

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
    const t = setTimeout(() => fetchQuestions(), 0)
    return () => clearTimeout(t)
  }, [fetchQuestions])

  const renderBloomLevel = (bloomLevel: string) => {
    const key = (bloomLevel || '').toLowerCase().replace(/\s+/g, '_')
    const config = BLOOM_LEVEL[key] ?? { color: 'default', label: formatTopic(bloomLevel || '') }
    return <Tag color={config.color}>{config.label || '—'}</Tag>
  }

  const bloomOptions = useMemo(() => {
    const keys = new Set<string>()
    questions.forEach((q) => {
      const k = (q.bloomLevel || '').toLowerCase().replace(/\s+/g, '_')
      if (k) keys.add(k)
    })
    const list = Array.from(keys).sort((a, b) => a.localeCompare(b, 'vi'))
    return list.map((k) => ({ value: k, label: BLOOM_LEVEL[k]?.label ?? formatTopic(k) }))
  }, [questions])

  const topicOptions = useMemo(() => {
    const keys = new Set<string>()
    questions.forEach((q) => {
      const t = (q.topic || '').trim()
      if (t) keys.add(t)
    })
    const list = Array.from(keys).sort((a, b) => a.localeCompare(b, 'vi'))
    return list.map((t) => ({ value: t, label: formatTopic(t) }))
  }, [questions])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const bloomKey = (q.bloomLevel || '').toLowerCase().replace(/\s+/g, '_')
      const okBloom = !filterBloom || bloomKey === filterBloom
      const okTopic = !filterTopic || (q.topic || '') === filterTopic
      return okBloom && okTopic
    })
  }, [questions, filterBloom, filterTopic])

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
      sorter: (a, b) => stripHtml(a.contentHtml).localeCompare(stripHtml(b.contentHtml), 'vi', { sensitivity: 'base' }),
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => (
        <span className="text-slate-800 dark:text-slate-200" title={stripHtml(record.contentHtml)}>
          {stripHtml(record.contentHtml)}
        </span>
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
      title: 'MỨC ĐỘ',
      key: 'bloomLevel',
      width: 120,
      sorter: (a, b) => (a.bloomLevel || '').localeCompare(b.bloomLevel || '', 'vi', { sensitivity: 'base' }),
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => renderBloomLevel(record.bloomLevel),
    },
    {
      title: 'CHỦ ĐỀ',
      dataIndex: 'topic',
      key: 'topic',
      width: 120,
      sorter: (a, b) => (a.topic || '').localeCompare(b.topic || '', 'vi', { sensitivity: 'base' }),
      sortDirections: ['ascend', 'descend'],
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
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Ngân hàng câu hỏi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xem và lọc câu hỏi theo mức độ và chủ đề.</p>
            </div>
          }
          userName={getStoredUser()?.fullName ?? 'Giảng viên'}
          userSubtitle="Ngân hàng câu hỏi"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Ngân hàng câu hỏi
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  placeholder="Mức độ"
                  value={filterBloom}
                  onChange={(v) => setFilterBloom(v)}
                  allowClear
                  options={bloomOptions}
                  className="w-44 [&_.ant-select-selector]:rounded-lg"
                />
                <Select
                  placeholder="Chủ đề"
                  value={filterTopic}
                  onChange={(v) => setFilterTopic(v)}
                  allowClear
                  options={topicOptions}
                  className="w-44 [&_.ant-select-selector]:rounded-lg"
                  showSearch
                  optionFilterProp="label"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFilterBloom(undefined)
                    setFilterTopic(undefined)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-0 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                  Xóa bộ lọc
                </button>
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
                dataSource={filteredQuestions}
                rowKey="key"
                loading={loading}
                expandable={{
                  expandedRowKeys,
                  onExpand: (expanded, record) => {
                    setExpandedRowKeys((prev) =>
                      expanded ? [...prev, record.key] : prev.filter((k) => k !== record.key)
                    )
                  },
                  expandedRowRender: (record) => {
                    const content = stripHtmlFull(record.contentHtml)
                    const options = record.options ?? {}
                    const correct = record.correctAnswer
                    const letters = ['A', 'B', 'C', 'D'] as const
                    return (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                        <p className="mb-3 font-medium text-slate-700 dark:text-slate-200">
                          <span className="text-slate-500 dark:text-slate-400">Nội dung: </span>
                          {content}
                        </p>
                        <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Các đáp án:</p>
                        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          {letters.map((letter) => {
                            const text = options[letter] ?? '—'
                            const isCorrect = correct === letter
                            return (
                              <li key={letter} className={isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                                <span className="font-medium">{letter}.</span> {text}
                                {isCorrect && <span className="ml-2 text-xs">(Đáp án đúng)</span>}
                              </li>
                            )
                          })}
                        </ul>
                        <p className="mt-2 text-xs text-slate-500">
                          Bloom: {BLOOM_LEVEL[(record.bloomLevel || '').toLowerCase().replace(/\s+/g, '_')]?.label ?? record.bloomLevel ?? '—'} · Topic: {formatTopic(record.topic || '')}
                        </p>
                      </div>
                    )
                  },
                }}
                onRow={(record) => ({
                  onClick: () => {
                    setExpandedRowKeys((prev) =>
                      prev.includes(record.key) ? prev.filter((k) => k !== record.key) : [...prev, record.key]
                    )
                  },
                })}
                rowClassName={() => 'cursor-pointer'}
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
