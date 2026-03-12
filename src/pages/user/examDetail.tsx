import { useMemo, useState } from 'react'
import { Button, Progress } from 'antd'
import katex from 'katex'

type Choice = {
  id: string
  text: string
}

type Question = {
  id: number
  label: string
  content: string
  hasFormula?: boolean
  choices: Choice[]
  correctId: string
}

function renderMath(latex: string) {
  return {
    __html: katex.renderToString(latex, {
      throwOnError: false,
    }),
  }
}

const baseQuestions: Question[] = [
  {
    id: 1,
    label: 'Câu 1',
    content:
      'Một photon có bước sóng \\(\\\\lambda = 4{,}0 \\\\times 10^{-7}\\\\,m\\). Năng lượng của photon này gần giá trị nào nhất? (Lấy \\(h = 6{,}625 \\\\times 10^{-34}\\\\,J.s,\\\\ c = 3{,}0 \\\\times 10^8\\\\,m/s\\)).',
    hasFormula: true,
    choices: [
      { id: 'A', text: '3,1 eV' },
      { id: 'B', text: '4,8 eV' },
      { id: 'C', text: '5,0 eV' },
      { id: 'D', text: '6,2 eV' },
    ],
    correctId: 'C',
  },
  {
    id: 2,
    label: 'Câu 2',
    content:
      'Theo thuyết lượng tử ánh sáng, năng lượng của một photon được tính theo công thức \\(E = h f\\). Phát biểu nào sau đây là đúng?',
    hasFormula: true,
    choices: [
      { id: 'A', text: 'Năng lượng photon tỉ lệ nghịch với tần số.' },
      { id: 'B', text: 'Năng lượng photon không phụ thuộc vào tần số.' },
      { id: 'C', text: 'Năng lượng photon tỉ lệ thuận với tần số.' },
      { id: 'D', text: 'Năng lượng photon chỉ phụ thuộc vào bước sóng.' },
    ],
    correctId: 'C',
  },
]

const questions: Question[] = [
  ...baseQuestions,
  ...Array.from({ length: 48 }, (_, index) => {
    const id = index + 3
    return {
      id,
      label: `Câu ${id}`,
      content:
        'Câu hỏi trắc nghiệm về hiện tượng quang điện, quang phổ vạch hay mẫu nguyên tử Bohr (nội dung mô phỏng).',
      choices: [
        { id: 'A', text: 'Phương án A' },
        { id: 'B', text: 'Phương án B' },
        { id: 'C', text: 'Phương án C' },
        { id: 'D', text: 'Phương án D' },
      ],
      correctId: 'A',
    } satisfies Question
  }),
]

export default function ExamDetail() {
  const [answers, setAnswers] = useState<Record<number, string | null>>({})

  const total = questions.length
  const answered = useMemo(
    () => Object.values(answers).filter((value) => value != null).length,
    [answers],
  )
  const progress = (answered / total) * 100
  const firstUnansweredId =
    questions.find((q) => !answers[q.id])?.id ?? questions[0]?.id ?? 1

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-primary p-1 text-white">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">
                Ôn tập Vật lý lượng tử 12
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Chuyên đề: Lượng tử ánh sáng – Mẫu nguyên tử Bohr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end md:flex">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Thời gian còn lại
              </span>
              <span className="font-mono text-lg font-bold text-primary">
                45:30
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
            <Button
              type="primary"
              size="middle"
              className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold shadow-md shadow-primary/20 hover:!bg-primary/90"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Nộp bài
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 p-4 md:p-6 lg:p-8 lg:flex-row">
        <section className="w-full space-y-5 lg:w-[70%]">
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold md:text-sm">Tiến độ làm bài</span>
              <span className="text-xs font-bold text-primary md:text-sm">
                {answered} / {total} câu
              </span>
            </div>
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor="#2563EB"
              className="[&_.ant-progress-inner]:bg-slate-100 [&_.ant-progress-inner]:dark:bg-slate-800"
            />
          </div>

          {questions.map((question) => {
            const selectedChoice = answers[question.id] ?? null

            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between border-b border-slate-100 p-4 md:p-5 dark:border-slate-800">
                  <div>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                      {question.label}
                    </span>
                    <h2 className="mt-3 text-base font-semibold leading-relaxed md:text-lg">
                      {question.hasFormula ? (
                        <>
                          Một photon có bước sóng{' '}
                          <span
                            className="inline-block align-middle"
                            dangerouslySetInnerHTML={renderMath(
                              '\\\\lambda = 4{,}0 \\\\times 10^{-7}\\\\,m',
                            )}
                          />{' '}
                          . Năng lượng của photon này gần giá trị nào nhất? (Lấy{' '}
                          <span
                            className="inline-block align-middle"
                            dangerouslySetInnerHTML={renderMath(
                              'h = 6{,}625 \\\\times 10^{-34}\\\\,J.s',
                            )}
                          />
                          ,{' '}
                          <span
                            className="inline-block align-middle"
                            dangerouslySetInnerHTML={renderMath(
                              'c = 3{,}0 \\\\times 10^8\\\\,m/s',
                            )}
                          />
                          ).
                        </>
                      ) : (
                        question.content
                      )}
                    </h2>
                  </div>
                  <button className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-primary">
                    <span className="material-symbols-outlined">bookmark</span>
                    <span className="text-xs font-medium md:text-sm">Đánh dấu</span>
                  </button>
                </div>

                <div className="space-y-3 p-4 md:p-5">
                  {question.choices.map((choice) => {
                    const isSelected = selectedChoice === choice.id
                    const isCorrect = question.correctId === choice.id

                    return (
                      <label
                        key={choice.id}
                        className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-all md:text-base ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-100 bg-slate-50/50 hover:border-primary/30 dark:border-slate-800 dark:bg-slate-800/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          checked={isSelected}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: choice.id }))
                          }
                          className="h-4 w-4 cursor-pointer text-primary focus:ring-primary"
                        />
                        <span
                          className={`${
                            isCorrect ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium'
                          }`}
                        >
                          {choice.id}. {choice.text}
                        </span>
                        {isCorrect && (
                          <span className="ml-auto material-symbols-outlined text-primary">
                            check_circle
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        <aside className="w-full space-y-5 lg:w-[30%]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 md:text-sm">
              Thời gian còn lại
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-800 dark:text-white md:text-4xl">
                  45
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Phút
                </span>
              </div>
              <span className="animate-pulse text-3xl font-black text-primary md:text-4xl">
                :
              </span>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-800 dark:text-white md:text-4xl">
                  30
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Giây
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold">Danh sách câu hỏi</h3>
              <span className="text-xs font-medium text-slate-400">
                {total} câu
              </span>
            </div>
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-5">
              {questions.map((q) => {
                const isAnswered = !!answers[q.id]
                const isActive = q.id === firstUnansweredId

                if (isAnswered) {
                  return (
                    <div
                      key={q.id}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-lg bg-primary text-xs font-bold text-white md:text-sm"
                    >
                      {q.id}
                    </div>
                  )
                }

                if (isActive) {
                  return (
                    <div
                      key={q.id}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-xs font-black text-primary shadow-[0_0_10px_rgba(37,99,235,0.2)] md:text-sm"
                    >
                      {q.id}
                    </div>
                  )
                }

                return (
                  <div
                    key={q.id}
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800 md:text-sm"
                  >
                    {q.id}
                  </div>
                )
              })}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary" />
                <span className="text-xs font-medium">Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-medium">Chưa làm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20" />
                <span className="text-xs font-medium">Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-amber-400" />
                <span className="text-xs font-medium">Đánh dấu lại</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 dark:bg-primary/10">
            <div className="mb-3 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">info</span>
              <h4 className="font-bold">Hỗ trợ kỹ thuật</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Nếu gặp lỗi kỹ thuật (mất mạng, không tải được câu hỏi, v.v.), hãy
              nhấn vào nút hỗ trợ ở góc phải bên dưới để liên hệ giám thị.
            </p>
          </div>
        </aside>
      </main>

      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-2xl transition-transform hover:scale-110 active:scale-95 dark:border-slate-800 dark:bg-slate-900">
        <span className="material-symbols-outlined text-3xl">headset_mic</span>
      </button>
    </div>
  )
}

