import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Form, Input } from 'antd'

function getPasswordStrength(password: string): { percent: number; label: string } {
  if (!password) return { percent: 0, label: '' }
  let score = 0
  if (password.length >= 6) score += 25
  if (password.length >= 10) score += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25
  if (/\d/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 10
  const percent = Math.min(score, 100)
  if (percent < 40) return { percent, label: 'Yếu' }
  if (percent < 70) return { percent, label: 'Khá' }
  return { percent, label: 'Mạnh' }
}

export default function ResetPasswordPage() {
  const [form] = Form.useForm()
  const [password, setPassword] = useState('')

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const onFinish = (values: { newPassword: string }) => {
    console.log('Reset password:', values.newPassword)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6 font-display antialiased text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="w-full max-w-[420px] rounded-xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        {/* Logo & Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-3xl text-primary">
              school
            </span>
          </div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            AI Graduation Exam Command Center
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Đặt lại mật khẩu
          </h1>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          className="w-full"
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
              className="h-12 rounded-lg bg-white dark:bg-slate-700 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-600"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          {password && (
            <div className="-mt-2 mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Độ mạnh mật khẩu:{' '}
                  <span className="text-primary">{strength.label}</span>
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error('Mật khẩu không khớp. Vui lòng kiểm tra lại.'),
                  )
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
              className="h-12 rounded-lg bg-white dark:bg-slate-700 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-600"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="h-12 rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] focus:ring-4 focus:ring-primary/30 hover:!bg-primary/90"
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-700">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>

      {/* Footer badge */}
      <p className="fixed bottom-6 left-1/2 hidden -translate-x-1/2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-50 sm:block text-slate-400 dark:text-slate-600">
        Secure Encryption Protocol v2.4.0
      </p>
    </div>
  )
}
