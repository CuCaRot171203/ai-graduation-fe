export default function UserAdmin() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 p-6">
          <div className="rounded-lg bg-primary p-2 text-white">
            <span className="material-symbols-outlined block">
              school
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ExamPro
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 font-semibold text-primary">
            <span className="material-symbols-outlined">library_books</span>
            <span className="text-sm font-medium">Danh sách đề thi</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">edit_note</span>
            <span className="text-sm font-medium">Luyện đề</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm font-medium">Lịch sử làm bài</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="text-sm font-medium">Bảng xếp hạng</span>
          </div>
        </nav>

        <div className="space-y-1 border-t border-slate-200 px-4 py-6 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">Hồ sơ cá nhân</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Cài đặt</span>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-96 max-w-full">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm đề thi, tài liệu..."
              className="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800">
              <div className="text-right">
                <p className="text-sm font-semibold">Alex Johnson</p>
                <p className="text-xs text-slate-500">Học sinh lớp 12</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_CYgB6LIMa6G-_Uwi09br1namMI790E7A5O26R5uaZZd9UFQkXLpRVPZnSwg-HLjGJxgBFhFkIkv575hDLVnLUVYrV1_sHXbrtZ_QzPRZjEpKwtlQiukoEPFhlAmCJO875oOxhaVrhud6ejubHm1sWav1EfGGoflJLsPc6h37X2VgSSVpGYECJ7zd6JkuGh09AqztGdmw331FhlgKhcybtpe7kuQ8zwcJQGg_juHnWRtI6NZiwejwnYNhZkW9veAe3sEgJELRfh3K"
                  alt="User Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-8 p-8">
          <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Chào mừng bạn quay lại, Alex! 👋
              </h2>
              <p className="mt-1 text-slate-500">
                Bạn đã hoàn thành 85% mục tiêu học tập tuần này. Tiếp tục cố
                gắng nhé!
              </p>
            </div>
            <div className="hidden gap-4 md:flex">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ngày liên tiếp
                </div>
              </div>
              <div className="h-full w-px bg-slate-200 dark:bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">+15%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tiến độ tuần
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-900/20">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Tổng số đề đã làm
                </p>
                <p className="text-2xl font-bold text-primary">128</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/20">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Điểm trung bình
                </p>
                <p className="text-2xl font-bold text-primary">8.5</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-900/20">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Câu trả lời đúng
                </p>
                <p className="text-2xl font-bold text-primary">1,420</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20">
                <span className="material-symbols-outlined">
                  workspace_premium
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Thứ hạng
                </p>
                <p className="text-2xl font-bold text-primary">#42</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Đề thi nổi bật</h3>
                  <a
                    href="#"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Xem tất cả
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        Toán học
                      </span>
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          schedule
                        </span>
                        90 phút
                      </div>
                    </div>
                    <h4 className="mb-2 line-clamp-1 font-bold text-slate-900 dark:text-white">
                      Toán Giải Tích 12 - Chương 1
                    </h4>
                    <div className="mb-5 flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          quiz
                        </span>
                        50 câu
                      </div>
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          group
                        </span>
                        1.2k lượt làm
                      </div>
                    </div>
                    <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                      Làm bài ngay
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="rounded bg-purple-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        Vật Lý
                      </span>
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          schedule
                        </span>
                        60 phút
                      </div>
                    </div>
                    <h4 className="mb-2 line-clamp-1 font-bold text-slate-900 dark:text-white">
                      Vật Lý Hạt Nhân - Đề số 4
                    </h4>
                    <div className="mb-5 flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          quiz
                        </span>
                        40 câu
                      </div>
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-1 text-sm">
                          group
                        </span>
                        850 lượt làm
                      </div>
                    </div>
                    <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                      Làm bài ngay
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Tiến độ học tập (30 ngày qua)
                  </h3>
                  <select
                    aria-label="Lọc tiến độ theo môn học"
                    className="rounded-lg border-none bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-semibold focus:ring-0 dark:bg-slate-800"
                  >
                    <option>Tất cả môn học</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                  </select>
                </div>
                <div className="relative flex h-full w-full items-end gap-2 overflow-hidden rounded-xl bg-slate-100 px-4 dark:bg-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
                  <div className="z-10 flex h-[80%] w-full items-end justify-between gap-2">
                    <div className="flex-1 h-[40%] rounded-t-sm bg-primary/20" />
                    <div className="flex-1 h-[55%] rounded-t-sm bg-primary/30" />
                    <div className="flex-1 h-[45%] rounded-t-sm bg-primary/40" />
                    <div className="flex-1 h-[70%] rounded-t-sm bg-primary/50" />
                    <div className="flex-1 h-[60%] rounded-t-sm bg-primary/60" />
                    <div className="flex-1 h-[85%] rounded-t-sm bg-primary/80" />
                    <div className="flex-1 h-[95%] rounded-t-sm bg-primary" />
                  </div>
                  <div className="absolute inset-x-0 bottom-[25%] border-b border-slate-200/50 dark:border-slate-700/50" />
                  <div className="absolute inset-x-0 bottom-[50%] border-b border-slate-200/50 dark:border-slate-700/50" />
                  <div className="absolute inset-x-0 bottom-[75%] border-b border-slate-200/50 dark:border-slate-700/50" />
                </div>
                <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase text-slate-400">
                  <span>Tuần 1</span>
                  <span>Tuần 2</span>
                  <span>Tuần 3</span>
                  <span>Tuần 4</span>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-6 text-lg font-bold">Hoạt động gần đây</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/30">
                      <span className="material-symbols-outlined text-xl">
                        fact_check
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Toán Giải Tích 12
                        </h4>
                        <span className="text-xs font-bold text-green-500">
                          9.5/10
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Hoàn thành lúc 10:30, Hôm nay
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500 dark:bg-purple-900/30">
                      <span className="material-symbols-outlined text-xl">
                        translate
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Tiếng Anh Cấp Tốc
                        </h4>
                        <span className="text-xs font-bold text-green-500">
                          8.0/10
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Hoàn thành lúc 15:20, Hôm qua
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-900/30">
                      <span className="material-symbols-outlined text-xl">
                        biotech
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Vật Lý Hạt Nhân
                        </h4>
                        <span className="text-xs font-bold text-primary">
                          7.5/10
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Hoàn thành lúc 09:15, 2 ngày trước
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-gradient-to-br from-primary to-blue-700 p-5 text-white">
                    <h4 className="mb-2 text-sm font-bold">Mở khóa Pro</h4>
                    <p className="mb-4 text-[11px] leading-relaxed opacity-90">
                      Truy cập hơn 5000+ đề thi cao cấp và lời giải chi tiết từ
                      các chuyên gia.
                    </p>
                    <button className="w-full rounded-lg bg-white py-2 text-xs font-bold text-primary transition-colors hover:bg-slate-50">
                      Nâng cấp ngay
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

