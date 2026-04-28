import { MJ, MJComponent, Reference } from '@mj/jsx'

interface Props {
  x?: boolean
  y?: boolean
  minusW?: number
  minusH?: number
  scrollable?: boolean
  className?: MJ.ClassProp
  children?: MJ.Element
  ref?: Reference<HTMLDivElement>
}

/**
 * スクロールエリア
 */
export default class ScrollArea extends MJComponent<Props> {
  createNode({ x, y, minusW, minusH, scrollable = true, className, children, ref }: Props) {
    const width = minusW ? `calc(100vw - ${minusW}px)` : undefined
    const height = minusH ? `calc(100vh - ${minusH}px)` : undefined
    let vectorCss = 'overflow-scroll'
    if (x || (width && !height)) {
      vectorCss = 'overflow-hidden overflow-x-scroll'
    } else if (y || (!width && height)) {
      vectorCss = 'overflow-hidden overflow-y-scroll'
    }
    return (
      <div class={[scrollable && vectorCss, className, 'scrollbar']} style={{ width, height }} ref={ref}>
        {children}
      </div>
    )
  }
}
