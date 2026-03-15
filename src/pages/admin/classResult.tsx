import { Button, Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const EXAM_OPTIONS = [
  { value: 'all', label: 'Tất cả đề thi' },
  { value: 'mid1', label: 'Kiểm tra Giữa kỳ I - Toán 12' },
  { value: 'practice4', label: 'Đề luyện thi THPT QG #4' },
  { value: 'apt2', label: 'Đánh giá năng lực đợt 2' },
]

const TIME_OPTIONS = [
  { value: '2023-10', label: 'Tháng 10, 2023' },
  { value: '2023-09', label: 'Tháng 9, 2023' },
]

type StudentResult = {
  key: string
  name: string
  avatar: string
  score: number
  correct: string
  wrong: number
  duration: string
}

const STUDENT_DATA: StudentResult[] = [
  {
    key: '1',
    name: 'Nguyễn Văn An',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADvA046u7vG95rEsGRUsX9UjGDGj4Ot1j5NPyh9KjdvnOt1SIxaftGnseg9hixVOl9zBHJFxmjpwu8WWz7JqUmYCPHqnZjemFJZGgjEJed7X5tSa2aS0GELiPQYu96gWVGkEmuiYOtTYPuxKzMaQksCBKh_ajUESg0MYyqW-wtTrk0dygoVudiv-IqF9Ctb6Cx4G1qPJ_KtaH6snj0SW2ln0L531Q6MnV3eNeBOqlmb1Bb3dpim1QuEIaEY-aeaZRnfRzXT6nxyaCG',
    score: 9.5,
    correct: '48/50',
    wrong: 2,
    duration: '32 phút',
  },
  {
    key: '2',
    name: 'Lê Thị Bình',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiamW0CgZoorFPtbKngnBOsJpXgFBxz7JRLCgKOXvPS559BQRc7q1n145gVQtizXPkaZfB9vDxgP-d0t00Ze_Hg5ChAFzeSZj_xJTu8wuB1XOqOvykS4c6hs_AVjDu9hW-LbfDNbHuLsR_rkXRFoSW1aaLKW18Mbz5fxPHCUVEKYVDH-ymKYm3RkrB-QdKN6S8pq14KU-zq1EWFNB2tuOdusauzXeXKY_BIvzjcjjV0IMtNYleDkEhMtlQ-rk3PclnBFfL4ai2cQBR',
    score: 8.0,
    correct: '40/50',
    wrong: 10,
    duration: '45 phút',
  },
  {
    key: '3',
    name: 'Trần Minh Chiến',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpMVi8kdJ1Yz-MDQxTh6ldbBR15DmV9_wXOTDP6Y2Uvx1aTzlw4ZB5-AgJIvvki1-pM9IarZ1trPwpMXhkmdRCcHUXSxTHkXMsVV-gVsFXxu6HoMDKiVvzrjimRM_RdLfukA0ZWqaRUDCv73HuyyXGtiZzuxbISqC0zYYTLI20-K7mfQi7gEQ3VnaBrIbEd9Z6loUFSr7blMGN0Ii8HNtTNIeqOdNUFIGg3uP2aWeBqu4vvfdZWm1fGfpZ7nG0PYyU5DFTOsdC51x0',
    score: 6.5,
    correct: '33/50',
    wrong: 17,
    duration: '38 phút',
  },
  {
    key: '4',
    name: 'Hoàng Anh Dũng',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qGt-SmLH1R4HpvrYurub6uIng4QXmHmaWQSDmI3J70TEd3Ad5Ni2sKnqJ-Hs42rDVNWe6Q96YuJu0LM2Q4sa6lsHkLXNhaB7P4o7VFnsV4voRY2UIPBgR7AtpK4A2lk5vTzS97nopt9OYDp7HXbQmC4agMPmQzngM6E4Io7t2qvm5JXuiJ69MWilQEvJES-3mUUxha05qvRyXrKsIxy7mY9tDVBFeChLuF5ruWoz9pp7AhgYJFd-B2inzrpkl27n4G_ksM79XySe',
    score: 4.5,
    correct: '22/50',
    wrong: 28,
    duration: '25 phút',
  },
]

function scoreTag(score: number) {
  if (score >= 8) {
    return (
      <span className="rounded-lg bg-green-100 px-2.5 py-1 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
        {score}
      </span>
    )
  }
  if (score >= 6) {
    return (
      <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {score}
      </span>
    )
  }
  if (score >= 5) {
    return (
      <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        {score}
      </span>
    )
  }
  return (
    <span className="rounded-lg bg-red-100 px-2.5 py-1 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
      {score}
    </span>
  )
}

export default function ClassResult() {
  const columns: ColumnsType<StudentResult> = [
    {
      title: 'Học sinh',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            <img alt="" className="h-full w-full object-cover" src={record.avatar} />
          </div>
          <span className="text-sm font-semibold">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => scoreTag(score),
    },
    {
      title: 'Số câu đúng',
      dataIndex: 'correct',
      key: 'correct',
      align: 'center',
      className: 'text-sm',
    },
    {
      title: 'Số câu sai',
      dataIndex: 'wrong',
      key: 'wrong',
      align: 'center',
      className: 'text-sm text-slate-400',
    },
    {
      title: 'Thời gian làm bài',
      dataIndex: 'duration',
      key: 'duration',
      className: 'text-sm text-slate-600 dark:text-slate-400',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <button
          type="button"
          className="p-1 transition-colors hover:text-primary"
          title="Xem chi tiết"
        >
          <span className="material-symbols-outlined text-xl">visibility</span>
        </button>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Title & Filters */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Kết quả học tập của lớp
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi và phân tích chi tiết kết quả thi của sinh viên
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col">
                  <span className="mb-1 ml-1 text-xs font-semibold text-slate-500">
                    Chọn đề thi
                  </span>
                  <Select
                    defaultValue="all"
                    options={EXAM_OPTIONS}
                    className="min-w-[200px] [&_.ant-select-selector]:rounded-xl"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 ml-1 text-xs font-semibold text-slate-500">
                    Chọn thời gian
                  </span>
                  <Select
                    defaultValue="2023-10"
                    options={TIME_OPTIONS}
                    suffixIcon={<span className="material-symbols-outlined text-slate-400">expand_more</span>}
                    className="min-w-[180px] [&_.ant-select-selector]:rounded-xl"
                  />
                </div>
                <Button
                  type="primary"
                  className="mt-5 flex items-center gap-2 font-bold shadow-lg shadow-primary/25"
                  icon={<span className="material-symbols-outlined text-lg">download</span>}
                >
                  Xuất báo cáo
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Trung bình điểm</p>
                    <h4 className="text-2xl font-bold">7.8 / 10</h4>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  +0.5 so với kỳ trước
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Sĩ số tham gia</p>
                    <h4 className="text-2xl font-bold">42 / 45</h4>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20">
                    <span className="material-symbols-outlined">how_to_reg</span>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                  Tỷ lệ tham gia: 93.3%
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Thời gian TB</p>
                    <h4 className="text-2xl font-bold">38:15</h4>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20">
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">Nhanh hơn 2 phút dự kiến</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Tỷ lệ đạt</p>
                    <h4 className="text-2xl font-bold">88%</h4>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-green-600">Đạt chỉ tiêu kỳ học</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">
                    Phân bố điểm
                  </h4>
                  <span className="material-symbols-outlined text-slate-400">more_horiz</span>
                </div>
                <div className="relative flex h-64 items-end gap-4 px-4 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className="h-[20%] w-full rounded-t-lg bg-primary/20 transition-all hover:bg-primary/40" />
                    <span className="text-[10px] font-bold text-slate-500">0-4</span>
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className="h-[45%] w-full rounded-t-lg bg-primary/40 transition-all hover:bg-primary/60" />
                    <span className="text-[10px] font-bold text-slate-500">5-6</span>
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className="h-[85%] w-full rounded-t-lg bg-primary transition-all hover:bg-primary/80" />
                    <span className="text-[10px] font-bold text-slate-500">7-8</span>
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className="h-[60%] w-full rounded-t-lg bg-primary/60 transition-all hover:bg-primary/80" />
                    <span className="text-[10px] font-bold text-slate-500">9-10</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-xs text-slate-500">
                      Phổ điểm phổ biến nhất (7-8)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">
                    Tỷ lệ đúng/sai
                  </h4>
                  <span className="material-symbols-outlined text-slate-400">info</span>
                </div>
                <div className="flex h-64 items-center justify-center">
                  <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full border-[12px] border-slate-100 dark:border-slate-800 [background:conic-gradient(#2563EB_75%,#CBD5E1_0)]"
                  >
                    <div className="absolute inset-0 rounded-full border-[12px] border-transparent" />
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-900">
                      <p className="text-3xl font-black text-primary">75%</p>
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        Đúng TB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-xs text-slate-500">Đúng</span>
                    </div>
                    <span className="text-sm font-bold">1,245 câu</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">Sai/Bỏ</span>
                    </div>
                    <span className="text-sm font-bold">415 câu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">
                  Chi tiết kết quả học sinh
                </h4>
                <Input
                  placeholder="Tìm tên học sinh..."
                  prefix={<span className="material-symbols-outlined text-sm text-slate-400">search</span>}
                  className="w-48 rounded-lg border-none bg-slate-50 text-xs focus:ring-1 focus:ring-primary dark:bg-slate-800 [&.ant-input]:bg-slate-50 dark:[&.ant-input]:bg-slate-800"
                />
              </div>
              <Table
                columns={columns}
                dataSource={STUDENT_DATA}
                pagination={{
                  total: 42,
                  pageSize: 4,
                  showSizeChanger: false,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]} đến ${range[1]} trong số ${total} học sinh`,
                  className: 'px-6 py-4',
                }}
                className="[&_.ant-table-thead>tr>th]:bg-slate-50/50 [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr:hover>td]:bg-slate-50/50 dark:[&_.ant-table-thead>tr>th]:bg-slate-800/50 dark:[&_.ant-table-tbody>tr:hover>td]:bg-slate-800/50"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
