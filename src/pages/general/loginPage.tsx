import { useState } from 'react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

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
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="btn-transition absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary"
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
            </div>

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
              <a
                href="#"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="btn-transition active:scale-[0.98] w-full rounded-xl bg-primary py-3.5 px-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-600">
              Chưa có tài khoản?{' '}
              <a
                href="#"
                className="border-b-2 border-transparent font-bold text-primary transition-colors hover:border-primary hover:text-primary/80"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

