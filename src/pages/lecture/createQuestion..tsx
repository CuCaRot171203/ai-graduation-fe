export default function LectureCreateQuestion() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 hidden min-h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
          <div className="p-6">
            <div className="mb-8 flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5 text-white">
                <span className="material-symbols-outlined block">quiz</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Hệ thống khảo thí</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quản trị viên
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">edit_document</span>
                <span>Soạn đề thi</span>
              </a>
              <a
                href="#"
                className="active-nav flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold"
              >
                <span className="material-symbols-outlined">database</span>
                <span>Bank đề</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">send</span>
                <span>Giao bài</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">bar_chart</span>
                <span>Thống kê</span>
              </a>

              <div className="pb-4 pt-8">
                <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Cá nhân
                </p>
              </div>

              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">person</span>
                <span>Hồ sơ</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Đăng xuất</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Tạo câu hỏi mới
              </h2>
              <nav className="mt-1 flex gap-1 text-xs text-slate-500 dark:text-slate-400">
                <a href="#" className="hover:text-primary">
                  Dashboard
                </a>
                <span>/</span>
                <a href="#" className="hover:text-primary">
                  Bank đề
                </a>
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-200">
                  Tạo câu hỏi
                </span>
              </nav>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold transition-all hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                Hủy
              </button>
              <button className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                Lưu câu hỏi
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-5xl space-y-6 p-6">
            {/* Thông tin câu hỏi */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <span className="material-symbols-outlined text-primary">info</span>
                <h3 className="font-bold">Thông tin câu hỏi</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Môn học
                  </label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800">
                    <option>Chọn môn học</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                    <option>Hóa học</option>
                    <option>Tiếng Anh</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Độ khó
                  </label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800">
                    <option>Dễ</option>
                    <option>Trung bình</option>
                    <option>Khó</option>
                    <option>Cực khó</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Chủ đề
                  </label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800">
                    <option>Chọn chủ đề</option>
                    <option>Đại số sơ cấp</option>
                    <option>Hình học không gian</option>
                    <option>Giải tích 12</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Nội dung câu hỏi */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span className="material-symbols-outlined text-primary">subject</span>
                  <h3 className="font-bold">Nội dung câu hỏi</h3>
                </div>
              </div>

              {/* Toolbar giả lập */}
              <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                {[
                  'format_bold',
                  'format_italic',
                  'format_underlined',
                  '|',
                  'format_list_bulleted',
                  'format_list_numbered',
                  '|',
                  'image',
                  'functions',
                  'code',
                ].map((icon, index) =>
                  icon === '|' ? (
                    <div
                      key={`sep-${index}`}
                      className="mx-1 h-6 w-px self-center bg-slate-200 dark:bg-slate-700"
                    />
                  ) : (
                    <button
                      key={icon}
                      type="button"
                      className="rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </button>
                  ),
                )}
              </div>

              <div>
                <textarea
                  className="h-48 w-full border-0 bg-transparent p-6 text-slate-800 placeholder-slate-400 focus:ring-0 dark:text-slate-200"
                  placeholder="Nhập nội dung câu hỏi tại đây..."
                />
              </div>
            </section>

            {/* Danh sách câu trả lời */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span className="material-symbols-outlined text-primary">
                    checklist
                  </span>
                  <h3 className="font-bold">Danh sách câu trả lời</h3>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Thêm đáp án
                </button>
              </div>

              <div className="space-y-4">
                {/* Đáp án A */}
                <div className="group flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    A
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      defaultValue="Đây là phương án trả lời đúng mẫu"
                      className="w-full rounded-xl border border-emerald-500 bg-emerald-50/30 py-3 pr-12 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-emerald-500/10"
                      placeholder="Nhập đáp án..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="correct_answer"
                        defaultChecked
                        className="h-5 w-5 border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                    <button
                      type="button"
                      className="p-2 text-slate-400 transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Đáp án B */}
                <div className="group flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    B
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Nhập đáp án B..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="correct_answer"
                        className="h-5 w-5 border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                    <button
                      type="button"
                      className="p-2 text-slate-400 transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Đáp án C */}
                <div className="group flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    C
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Nhập đáp án C..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="correct_answer"
                        className="h-5 w-5 border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                    <button
                      type="button"
                      className="p-2 text-slate-400 transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Đáp án D */}
                <div className="group flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    D
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Nhập đáp án D..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="correct_answer"
                        className="h-5 w-5 border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                    <button
                      type="button"
                      className="p-2 text-slate-400 transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Nút hành động cuối trang */}
            <div className="flex flex-col items-center justify-end gap-4 py-6 sm:flex-row">
              <button className="w-full rounded-xl px-8 py-3 text-slate-600 font-semibold transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto">
                Hủy bỏ
              </button>
              <button className="w-full rounded-xl border-2 border-primary px-8 py-3 text-primary font-semibold transition-colors hover:bg-primary/5 sm:w-auto">
                Lưu và tạo câu hỏi mới
              </button>
              <button className="w-full rounded-xl bg-primary px-10 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 sm:w-auto">
                Lưu câu hỏi
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

