import { MJ, MJComponent, ref, Reference } from '@mj/jsx'

const PositionClassNames = {
  top: 'top-10 left-1/2 -translate-x-1/2',
  center: 'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2',
} as const
export type PositionType = keyof typeof PositionClassNames

interface Props {
  ref: MJ.Reference<ModalContainer>
  modalPosition?: PositionType
  modalClassName?: MJ.ClassProp
  children: MJ.Element
}

/**
 * モーダルコンテナ
 */
export class ModalContainer extends MJComponent<Props> {
  private whole: Reference<HTMLDivElement> = ref()

  createNode({ modalPosition = 'top', modalClassName, ref, children }: Props) {
    const positionCss = PositionClassNames[modalPosition]
    ref?.set(this)
    return (
      <div
        class={[
          'invisible fixed top-0 left-0 z-10 h-full w-full bg-zinc-900/70 opacity-0',
          'transition-[opacity_visibility] duration-150 ease-in-out',
          '[&.show]:visible [&.show]:opacity-100',
        ]}
        ref={this.whole}
        onclick={() => this.close()}
      >
        <div
          class={['fixed z-20 max-h-[90vh] max-w-[90vw] rounded-lg border border-zinc-500 bg-zinc-200', 'dark:bg-zinc-900', modalClassName, positionCss]}
          onclick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    )
  }

  /**
   * 開く
   */
  open(..._params: any[]) {
    this.whole.value?.classList.add('show')
  }

  /**
   * 閉じる
   */
  close(..._params: any[]) {
    this.whole.value?.classList.remove('show')
  }
}
