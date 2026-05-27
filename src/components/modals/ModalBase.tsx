import { dom, formatCSS, MJ } from '@mj/jsx'
import { MJRouter } from '@mj/router'

const PositionClassNames = {
  top: 'top-10 left-1/2 -translate-x-1/2',
  center: 'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2',
} as const
export type PositionType = keyof typeof PositionClassNames

interface Props {
  modalPosition?: PositionType
  modalClassName?: MJ.ClassProp
  backdropCloseFlag?: boolean
}

/**
 * モーダル基底
 */
export class ModalBase extends HTMLDivElement {
  connectedCallback() {
    this.className = formatCSS([
      'fixed w-full h-full top-0 left-0 bg-zinc-900/70 z-10 opacity-0 invisible',
      'transition-[opacity_visibility] duration-150 ease-in-out',
      '[&.show]:opacity-100 [&.show]:visible',
    ])
    this.addEventListener('click', () => this.backdropClose())
  }

  protected backdropCloseFlag = true

  protected createModal(children: MJ.Element, { modalPosition = 'top' }: Props = {}) {
    const positionCss = PositionClassNames[modalPosition]
    return (
      <div class={['fixed z-20 max-h-[90vh] max-w-[90vw] rounded-lg border border-zinc-500 bg-zinc-200 dark:bg-zinc-900', positionCss]} onclick={(e) => e.stopPropagation()}>
        {children}
      </div>
    )
  }

  /**
   * 開く
   */
  open(..._params: any[]) {
    dom.setClassName(this, 'show', true)
  }

  /**
   * 閉じる
   */
  close(..._params: any[]) {
    dom.setClassName(this, 'show', false)
  }

  /**
   * 閉じた後に画面更新する
   */
  closeReload() {
    this.close()
    setTimeout(() => MJRouter.instance.reload(), 150)
  }

  private backdropClose() {
    if (this.backdropCloseFlag) {
      this.close()
    }
  }
}
