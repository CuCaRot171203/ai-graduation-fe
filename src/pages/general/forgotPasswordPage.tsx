import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Form, Input } from 'antd'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [form] = Form.useForm()

  const onFinish = (values: { email: string }) => {
    console.log('Forgot password:', values.email)
    setSent(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background-light p-4 font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {/* Optional background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-5">
        <div className="absolute left-[10%] top-[10%] h-64 w-64 rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-64 w-64 rounded-full bg-primary blur-[120px]" />
      </div>

      <div className="flex w-full max-w-[420px] flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Logo & Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">
            AI Graduation Exam Command Center
          </h2>
        </div>

        {/* Header */}
        <div className="mb-6 w-full">
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Quên mật khẩu
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          className="w-full"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={
                <span className="material-symbols-outlined mr-2 text-slate-400">
                  mail
                </span>
              }
              placeholder="nhap@email.com"
              size="large"
              className="rounded-lg bg-white dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="flex h-12 items-center justify-center gap-2 rounded-lg font-semibold hover:!bg-primary/90"
            >
              Gửi link reset mật khẩu
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Button>
          </Form.Item>
        </Form>

        {/* Success state */}
        {sent && (
          <div className="mt-4 flex gap-3 rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <span className="material-symbols-outlined shrink-0 text-green-600 dark:text-green-400">
              check_circle
            </span>
            <p className="text-sm text-green-700 dark:text-green-300">
              Liên kết đặt lại mật khẩu đã được gửi tới email của bạn.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 w-full border-t border-slate-100 pt-6 text-center dark:border-slate-800">
          <Link
            to="/login"
            className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
