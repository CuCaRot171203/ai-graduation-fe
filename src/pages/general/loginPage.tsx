import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'
import { login, getDashboardPathByRole } from '../../apis/authApi'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await login({ email: values.email, password: values.password })
      if (res.status === 'success' && res.data) {
        const { user, accessToken, refreshToken } = res.data
        try {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        } catch {
          // ignore storage errors
        }
        message.success(res.message ?? 'Đăng nhập thành công')
        const path = getDashboardPathByRole(user.role)
        navigate(path, { replace: true })
        return
      }
      message.error(res.message ?? 'Đăng nhập thất bại')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-gray-50 text-slate-900">
      {/* Visual Section (Left) */}
      <section className="bg-gradient-to-br from-indigo-50 to-sky-100 hidden items-center justify-center p-12 lg:flex lg:w-1/2">
        <div className="max-w-xl text-center">
          <img
            alt="Student studying illustration"
            className="h-auto w-full rounded-2xl drop-shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCyVnZHteD-FPa7jxJQfgbyW-jKMOCnbcyl0TYjM5F3xgbPDaKO-Ya_ur4VwRP1b0VWOVLIf2hoGONTyAk7wpmjPQkROMELkhxLZQJby05QC6lzDQZvfGvLEdOrJ22w9Q-d3PueSrhGdXRyabfTQ32IB11qIYdBUxtBj-L8iftt7_LWtoOiIs7Q0FFQbUgxYJm3sKYOvX01Cc-6caRHiQ9YEWv6GKkvECYiGY4InJeXDYYNWf4pmz9zMOzKUqFmUp0Sr1RUDLSDtYd"
          />
          <div className="mt-8">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">
              Nâng tầm kiến thức của bạn
            </h2>
            <p className="text-lg text-slate-600">
              Hệ thống thi thử trực tuyến giúp bạn làm quen với cấu trúc đề thi
              thực tế và đánh giá năng lực tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* Login Section (Right) */}
      <section className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">
          {/* Header & Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold tracking-tight text-slate-900">
                ExamPro
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Đăng nhập hệ thống thi thử
            </h1>
            <p className="mt-2 text-slate-500">Chào mừng bạn trở lại!</p>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            className="space-y-6"
          >
            <Form.Item
              name="email"
              label={<span className="text-sm font-semibold text-slate-700">Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                placeholder="name@example.com"
                size="large"
                className="rounded-xl border-gray-300 focus:border-transparent focus:ring-2 focus:ring-primary"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-sm font-semibold text-slate-700">Mật khẩu</span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  size="large"
                  className="rounded-xl border-gray-300 pr-10 focus:border-transparent focus:ring-2 focus:ring-primary [&_.ant-input]:rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="btn-transition absolute right-3 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-400 hover:text-primary"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
            </Form.Item>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-slate-600"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="btn-transition active:scale-[0.98] w-full rounded-xl py-3.5 px-4 text-lg font-bold shadow-lg transition-all hover:shadow-xl [&.ant-btn]:h-auto [&.ant-btn]:py-3.5"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-10 text-center">
            <p className="text-slate-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="border-b-2 border-transparent font-bold text-primary transition-colors hover:border-primary hover:text-primary/80"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
