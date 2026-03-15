import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
        <div className="container mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">
              auto_stories
            </span>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              ExamPro
            </h2>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              href="#"
            >
              Tính năng
            </a>
            <a
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              href="#"
            >
              Đề thi
            </a>
            <a
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              href="#"
            >
              Bảng giá
            </a>
            <a
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              href="#"
            >
              Về chúng tôi
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex"
            >
              Đăng nhập
            </Link>
            <button className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto max-w-[1200px] px-6 py-12 md:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Top 1 Nền tảng luyện thi
                </span>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl">
                  Chinh phục mọi kỳ thi với{' '}
                  <span className="text-primary">ExamPro</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  Nền tảng luyện thi trực tuyến thông minh với kho đề thi khổng
                  lồ và hệ thống phân tích kết quả hiện đại giúp bạn bứt phá
                  điểm số.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="h-14 rounded-xl bg-primary px-8 font-bold text-white shadow-xl shadow-primary/25 transition-transform hover:scale-105">
                  Bắt đầu ngay
                </button>
                <button className="h-14 rounded-xl border border-slate-200 px-8 font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  Xem đề thi
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-3xl" />
              <img
                alt="Student studying with laptop"
                className="relative aspect-[4/3] w-full rounded-2xl border border-white/20 object-cover shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgaQx_jY8Zo_6AJHWmSKsjVQuc0uh0YtdCDbslA1vDXkyw8CAOl0gjksH8lnCNWGjUZXqOOJvSH7gGKawHg_F4VoHZSMuYY95ufuILRP5hQKOzsL2YQtoyK0vXz4Y_ctqzJ_Z7cPP0FollV7fZ9bEuQ_RTOIl1MB24kR6w1ODgnh2aIp2fCivJN6sPGMNKOo3dCKjC6BgqDVo4s7wYynAbQKB76h6vcvfxo4x4BTQCZJszfJu-_PYKMTLeZYDITsa1aTwMo5TGxy7V"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="container mx-auto max-w-[1200px] px-6 py-10">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <p className="text-4xl font-black text-primary">10,000+</p>
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  Đề thi chọn lọc
                </p>
              </div>
              <div className="flex flex-col gap-1 border-x border-slate-100 dark:border-slate-800">
                <p className="text-4xl font-black text-primary">50,000+</p>
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  Học viên tin dùng
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-4xl font-black text-primary">95%</p>
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  Tỷ lệ tiến bộ
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-[1200px] px-6 py-20">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="mx-auto max-w-2xl text-slate-500 dark:text-slate-400">
              Mọi công cụ bạn cần để đạt kết quả cao nhất trong các kỳ thi quan
              trọng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-slate-200/50 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">library_books</span>
              </div>
              <h3 className="mb-3 text-lg font-bold">Kho đề đa dạng</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Hàng ngàn đề thi từ tiểu học đến THPT và đại học được cập nhật
                liên tục.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-slate-200/50 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <h3 className="mb-3 text-lg font-bold">Phân tích thông minh</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Theo dõi tiến độ và điểm mạnh, điểm yếu qua biểu đồ trực quan
                sinh động.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-slate-200/50 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">devices</span>
              </div>
              <h3 className="mb-3 text-lg font-bold">Giao diện thân thiện</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Trải nghiệm làm bài thi như thật, mượt mà trên mọi thiết bị máy
                tính, tablet.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-slate-200/50 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <h3 className="mb-3 text-lg font-bold">Hỗ trợ 24/7</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Đội ngũ giáo viên chuyên môn cao luôn sẵn sàng giải đáp thắc mắc
                của bạn.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 dark:bg-slate-900/30">
          <div className="container mx-auto max-w-[1200px] px-6">
            <div className="mb-12 flex items-end justify-between">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Đề thi tiêu biểu</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Khám phá các bộ đề được quan tâm nhất
                </p>
              </div>
              <a
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
                href="#"
              >
                Xem tất cả{' '}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </a>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-40 items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                  <span className="material-symbols-outlined text-5xl text-blue-600">
                    calculate
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Lớp 12
                    </span>
                    <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold uppercase text-green-600">
                      Mới
                    </span>
                  </div>
                  <h4 className="mb-2 text-lg font-bold">
                    Toán học - Ôn thi THPT Quốc Gia
                  </h4>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>{' '}
                      90 phút
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        help
                      </span>{' '}
                      50 câu
                    </span>
                  </div>
                  <button className="mt-6 w-full rounded-lg bg-slate-900 py-2 font-bold text-white transition-colors hover:bg-primary dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-primary">
                    Làm bài ngay
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-40 items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                  <span className="material-symbols-outlined text-5xl text-purple-600">
                    science
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Lớp 11
                    </span>
                  </div>
                  <h4 className="mb-2 text-lg font-bold">
                    Vật lý - Kiểm tra định kỳ HK2
                  </h4>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>{' '}
                      45 phút
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        help
                      </span>{' '}
                      30 câu
                    </span>
                  </div>
                  <button className="mt-6 w-full rounded-lg bg-slate-900 py-2 font-bold text-white transition-colors hover:bg-primary dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-primary">
                    Làm bài ngay
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-40 items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                  <span className="material-symbols-outlined text-5xl text-orange-600">
                    translate
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      IELTS
                    </span>
                    <span className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-white">
                      Hot
                    </span>
                  </div>
                  <h4 className="mb-2 text-lg font-bold">
                    Tiếng Anh - Listening Practice
                  </h4>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>{' '}
                      30 phút
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        help
                      </span>{' '}
                      40 câu
                    </span>
                  </div>
                  <button className="mt-6 w-full rounded-lg bg-slate-900 py-2 font-bold text-white transition-colors hover:bg-primary dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-primary">
                    Làm bài ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-[1200px] px-6 py-24">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold">Lựa chọn gói học tập</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Phù hợp với mọi nhu cầu từ học sinh đến tổ chức giáo dục
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/30 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8">
                <h3 className="mb-2 text-lg font-bold">Miễn phí</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">0đ</span>
                  <span className="text-slate-500">/tháng</span>
                </div>
              </div>
              <ul className="mb-10 flex-1 space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  100+ đề thi cơ bản
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Xem giải chi tiết cơ bản
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Lưu lịch sử làm bài
                </li>
              </ul>
              <button className="w-full rounded-xl border-2 border-slate-100 py-3 font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                Bắt đầu ngay
              </button>
            </div>

            <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-white p-8 shadow-2xl shadow-primary/10 dark:bg-slate-900">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase text-white">
                Phổ biến nhất
              </div>
              <div className="mb-8">
                <h3 className="mb-2 text-lg font-bold text-primary">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">199k</span>
                  <span className="text-slate-500">/tháng</span>
                </div>
              </div>
              <ul className="mb-10 flex-1 space-y-4">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Không giới hạn đề thi
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Phân tích điểm mạnh/yếu AI
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Tải đề thi PDF về máy
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Không quảng cáo
                </li>
              </ul>
              <button className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90">
                Nâng cấp Pro
              </button>
            </div>

            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/30 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8">
                <h3 className="mb-2 text-lg font-bold">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">499k</span>
                  <span className="text-slate-500">/tháng</span>
                </div>
              </div>
              <ul className="mb-10 flex-1 space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Tất cả tính năng Pro
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Hỗ trợ 1:1 từ giáo viên
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>{' '}
                  Lộ trình học cá nhân hóa
                </li>
              </ul>
              <button className="w-full rounded-xl border-2 border-slate-100 py-3 font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                Liên hệ tư vấn
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white pb-8 pt-16 dark:border-slate-900 dark:bg-slate-950">
        <div className="container mx-auto max-w-[1200px] px-6">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 space-y-4 md:col-span-1">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">
                  auto_stories
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  ExamPro
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nâng tầm tri thức, chinh phục tương lai cùng hệ thống luyện thi
                trực tuyến hàng đầu Việt Nam.
              </p>
              <div className="flex gap-4">
                <a
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-300"
                  href="#"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </a>
                <a
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-300"
                  href="#"
                  aria-label="Twitter"
                  title="Twitter"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-6 font-bold">Tính năng</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Kho đề thi
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Tạo đề thi tự động
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Phân tích kết quả
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Học nhóm trực tuyến
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold">Hỗ trợ</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Hướng dẫn sử dụng
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Câu hỏi thường gặp
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a className="transition-colors hover:text-primary" href="#">
                    Điều khoản dịch vụ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold">Liên hệ</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">
                    mail
                  </span>{' '}
                  contact@exampro.edu.vn
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">
                    call
                  </span>{' '}
                  (024) 123 4567
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">
                    location_on
                  </span>{' '}
                  123 Cầu Giấy, Hà Nội
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400 dark:border-slate-900">
            © 2026 ExamPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

