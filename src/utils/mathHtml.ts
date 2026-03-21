import katex from 'katex'

/** Chỉ để sort/filter — không dùng cho hiển thị công thức. */
export function plainTextFromHtml(html: string | undefined | null): string {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function renderKatexSafe(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex.trim(), {
      throwOnError: false,
      displayMode,
      strict: 'ignore',
    })
  } catch {
    return latex
  }
}

/**
 * Chuỗi HTML (câu hỏi / lời giải): thay \( \), \[ \], $...$, $$...$$ bằng KaTeX.
 */
export function decorateMathInHtml(input: string): string {
  let html = String(input ?? '')
  html = html.replace(/\\\[((?:.|\n)+?)\\\]/g, (_, expr: string) => renderKatexSafe(expr, true))
  html = html.replace(/\$\$((?:.|\n)+?)\$\$/g, (_, expr: string) => renderKatexSafe(expr, true))
  html = html.replace(/\\\(((?:.|\n)+?)\\\)/g, (_, expr: string) => renderKatexSafe(expr, false))
  html = html.replace(/\$([^$\n]+)\$/g, (_, expr: string) => renderKatexSafe(expr, false))
  return html
}

/** Đáp án dạng text thuần (ít HTML), có thể là biểu thức LaTeX */
export function optionAsHtml(text: unknown): string {
  const raw = String(text ?? '')
  const hasLatex = /\\[a-zA-Z]+|\^|_|\{|\}/.test(raw)
  if (hasLatex) {
    return renderKatexSafe(raw, false)
  }
  return raw
}
