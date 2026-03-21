import { HtmlWithMath } from './HtmlWithMath'
import { ocrPlainText } from './LatexMixed'
import { plainTextFromHtml as stripTagsOnly } from '../utils/mathHtml'

type Props = {
  html: string | undefined | null
  className?: string
  lineClamp?: 2 | 3 | 4
  /** Tooltip hover: bản gần text thuần (giữ LaTeX dạng $...$) */
  showTitle?: boolean
}

/**
 * Ô bảng / danh sách: HTML + KaTeX, thu gọn vài dòng (thay cho stripHtml).
 */
export function QuestionHtmlPreview({
  html,
  className,
  lineClamp = 2,
  showTitle = true,
}: Props) {
  const raw = String(html ?? '')
  const plainTitle = (ocrPlainText(raw) || stripTagsOnly(raw)).slice(0, 600) || '—'
  const clamp =
    lineClamp === 2 ? 'line-clamp-2' : lineClamp === 3 ? 'line-clamp-3' : 'line-clamp-4'
  return (
    <div
      className={[clamp, 'min-w-0 max-w-[min(100%,42rem)] overflow-hidden', className].filter(Boolean).join(' ')}
      title={showTitle ? plainTitle : undefined}
    >
      <HtmlWithMath
        html={raw}
        className="prose prose-sm max-w-none text-inherit dark:prose-invert [&_.katex]:text-[0.92em] [&_.katex-display]:my-0.5"
      />
    </div>
  )
}
