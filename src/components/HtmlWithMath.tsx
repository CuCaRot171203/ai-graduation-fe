import { decorateMathInHtml } from '../utils/mathHtml'

type Props = {
  html: string
  className?: string
  /** dùng span khi cần đặt trong <p> */
  as?: 'div' | 'span'
}

export function HtmlWithMath({ html, className, as: Tag = 'div' }: Props) {
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: decorateMathInHtml(html ?? '') }} />
  )
}
