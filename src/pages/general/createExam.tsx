import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Select } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCD3LNGrrl8ITwEQBn6irznr1WpjlceMA0ctf3Y5JU81aR02HxEDFljHn9wtF68QGxeFtzW4YbH6zSnv0Gp7SpCQdx-iSXDaDxhi0hbmLCV89y3BnodX3r91itIiwh1ViHhvEoa6qaubB4DuAHSoi90kseRLKQtD4Pj2iYpn15TvC9bak9IthV1j9L4dmATQQXyEkgoNL8V1jGQuJbfNJfsp0rDCan2UWSEHmbEDnG0MtypuBDW92nZGE8tssML0fhW7xdp5o1WBvf4'

const SUBJECT_OPTIONS = [
  { value: 'toan', label: 'Toán học' },
  { value: 'van', label: 'Ngữ văn' },
  { value: 'anh', label: 'Tiếng Anh' },
  { value: 'ly', label: 'Vật lý' },
]

export default function CreateExam() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = (values: {
    name: string
    subjectId: string
    description?: string
    durationMinutes?: number
    totalQuestions?: number
  }) => {
    console.log('Create exam:', values)
    navigate('/create-exam')
  }

  const onCancel = () => {
    navigate(-1)
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="exams" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Giảng viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="User"
          searchSlot={
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link to="/create-exam" className="transition-colors hover:text-primary">
                Quản lý đề thi
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-medium text-slate-900 dark:text-white">
                Tạo đề thi mới
              </span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Tạo đề thi mới
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Bản nháp
                </span>
              </div>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-[700px] rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={onFinish}
                className="space-y-6"
              >
                <Form.Item
                  name="name"
                  label={
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tên đề thi <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên đề thi',
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên đề thi..."
                    size="large"
                    className="rounded-xl border-slate-200 dark:border-slate-700 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="subjectId"
                  label={
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Môn học <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn môn học',
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn môn học"
                    size="large"
                    options={SUBJECT_OPTIONS}
                    allowClear
                    className="[&_.ant-select-selector]:rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Mô tả đề thi
                    </span>
                  }
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả ngắn về đề thi..."
                    rows={3}
                    className="rounded-xl border-slate-200 dark:border-slate-700 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Form.Item
                    name="durationMinutes"
                    label={
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Thời gian làm bài (phút)
                      </span>
                    }
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-slate-400">
                        schedule
                      </span>
                      <InputNumber
                        placeholder="60"
                        min={1}
                        max={300}
                        className="w-full [&_.ant-input]:rounded-xl [&_.ant-input]:pl-10"
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="totalQuestions"
                    label={
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tổng số câu hỏi
                      </span>
                    }
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-slate-400">
                        quiz
                      </span>
                      <InputNumber
                        placeholder="40"
                        min={1}
                        max={200}
                        className="w-full [&_.ant-input]:rounded-xl [&_.ant-input]:pl-10"
                      />
                    </div>
                  </Form.Item>
                </div>

                {/* Info Alert */}
                <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="material-symbols-outlined text-slate-400">info</span>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Đề thi sẽ được lưu ở trạng thái bản nháp. Bạn có thể thêm câu hỏi và xuất
                    bản sau khi hoàn tất các thông tin cơ bản.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    htmlType="button"
                    size="large"
                    className="font-semibold text-slate-500 hover:!bg-slate-50 hover:!text-slate-700 dark:hover:!bg-slate-800"
                    onClick={onCancel}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
                    icon={<span className="material-symbols-outlined text-lg">save</span>}
                  >
                    Lưu đề thi
                  </Button>
                </div>
              </Form>
            </div>

            {/* Decorative cards */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white/50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <p className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                  Chuẩn hóa cấu trúc
                </p>
                <p className="text-[10px] text-slate-500">
                  Tự động điều chỉnh theo form chuẩn của Bộ GD&amp;ĐT.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <p className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                  Trợ lý AI
                </p>
                <p className="text-[10px] text-slate-500">
                  Gợi ý câu hỏi dựa trên môn học và độ khó.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                  <span className="material-symbols-outlined">share</span>
                </div>
                <p className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                  Dễ dàng chia sẻ
                </p>
                <p className="text-[10px] text-slate-500">
                  Xuất file PDF hoặc tổ chức thi trực tuyến.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
