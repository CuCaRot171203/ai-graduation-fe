import { Fragment, type ReactNode } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/** Chuẩn hoá nội dung OCR: bỏ thẻ HTML nếu có, giữ LaTeX dạng $...$ */
export function ocrPlainText(s: string | undefined): string {
  if (!s) return ''
  let t = String(s).trim()
  if (t.includes('<')) {
    t = t.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return t
}

function renderKatex(latex: string, displayMode: boolean, key: number): ReactNode {
  const trimmed = latex.trim()
  if (!trimmed) return null
  try {
    const html = katex.renderToString(trimmed, {
      throwOnError: false,
      displayMode,
      strict: 'ignore',
    })
    return (
      <span
        key={key}
        className={displayMode ? 'my-1 block katex-display-wrap' : 'inline-katex mx-0.5'}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } catch {
    return <span key={key}>{displayMode ? `$$${latex}$$` : `$${latex}$`}</span>
  }
}

/**
 * Hiển thị văn bản có xen kẽ LaTeX inline ($...$) và khối ($$...$$).
 */
export function LatexMixed({ text, className }: { text: string; className?: string }) {
  const s = text ?? ''
  const nodes: ReactNode[] = []
  let key = 0
  let i = 0

  const pushPlain = (from: number, to: number) => {
    if (to <= from) return
    nodes.push(
      <span key={key++} className="whitespace-pre-wrap">
        {s.slice(from, to)}
      </span>
    )
  }

  while (i < s.length) {
    const dbl = s.indexOf('$$', i)
    const sgl = s.indexOf('$', i)
    const useDouble = dbl !== -1 && (sgl === -1 || dbl <= sgl)

    if (useDouble) {
      pushPlain(i, dbl)
      const end = s.indexOf('$$', dbl + 2)
      if (end === -1) {
        pushPlain(dbl, s.length)
        break
      }
      const math = s.slice(dbl + 2, end)
      const el = renderKatex(math, true, key++)
      if (el) nodes.push(el)
      i = end + 2
      continue
    }

    if (sgl !== -1) {
      pushPlain(i, sgl)
      const end = s.indexOf('$', sgl + 1)
      if (end === -1) {
        pushPlain(sgl, s.length)
        break
      }
      const math = s.slice(sgl + 1, end)
      const el = renderKatex(math, false, key++)
      if (el) nodes.push(el)
      i = end + 1
      continue
    }

    pushPlain(i, s.length)
    break
  }

  return (
    <span className={['latex-mixed [&_.katex]:text-inherit', className].filter(Boolean).join(' ')}>
      {nodes}
    </span>
  )
}

/** Xuống dòng giữ nguyên; mỗi dòng render LaTeX */
export function LatexParagraphs({ text, className }: { text: string; className?: string }) {
  const lines = (text ?? '').split('\n')
  return (
    <div className={className}>
      {lines.map((line, idx) => (
        <Fragment key={idx}>
          {idx > 0 ? <br /> : null}
          <LatexMixed text={line} />
        </Fragment>
      ))}
    </div>
  )
}
