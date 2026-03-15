import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Input, notification } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { createSubject } from '../../apis/subjectsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const toast = {
  success: (description: string) =>
    notification.success({
      message: 'Thành công',
      description,
      placement: 'topRight',
      duration: 2,
    }),
  error: (description: string) =>
    notification.error({
      message: 'Thất bại',
      description,
      placement: 'topRight',
      duration: 2,
    }),
}

export default function CreateSubject() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const onFinish = async (values: { code: string; name: string; description?: string }) => {
    try {
      setSubmitting(true)
      await createSubject({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      })
      toast.success('Thêm môn học thành công.')
      navigate('/admin/all-subjects')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thêm môn học thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const onCancel = () => {
    navigate('/admin/all-subjects')
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="subjects" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div className="flex items-center gap-2">
              <Link
                to="/admin/all-subjects"
                className="text-slate-400 transition-colors hover:text-primary"
              >
                Quản lý môn học
              </Link>
              <span className="material-symbols-outlined text-sm text-slate-400">
                chevron_right
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                Thêm môn học
              </span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Thêm môn học mới
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Cung cấp thông tin chi tiết để khởi tạo môn học trong hệ thống.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[600px] rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Form
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={onFinish}
                  className="space-y-6"
                >
                  <Form.Item
                    name="code"
                    label={
                      <>
                        Mã môn học <span className="text-red-500">*</span>
                      </>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã môn học' },
                      { whitespace: true, message: 'Mã môn không được để trống' },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: PHYS12, MATH12"
                      size="large"
                      className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label={
                      <>
                        Tên môn học <span className="text-red-500">*</span>
                      </>
                    }
                    rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
                  >
                    <Input
                      placeholder="Ví dụ: Vật Lý 12, Toán 12"
                      size="large"
                      className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Mô tả môn học">
                    <Input.TextArea
                      placeholder="Nhập tóm tắt nội dung môn học và các yêu cầu cơ bản..."
                      rows={4}
                      className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item className="mb-0 flex flex-row flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <Button
                      type="default"
                      htmlType="button"
                      size="large"
                      onClick={onCancel}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-600 hover:!border-slate-300 hover:!bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:!bg-slate-700"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                      className="flex items-center justify-center gap-2 rounded-xl px-6 font-semibold shadow-lg shadow-primary/20"
                      icon={<span className="material-symbols-outlined text-[20px]">save</span>}
                    >
                      Lưu môn học
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
