import { MJComponent, ref, Reference } from '@mj/jsx'

/**
 * 読み込み中メッセージ
 */
export default class LoadingMessage extends MJComponent {
  private static _instance: LoadingMessage
  static get instance() {
    if (this._instance) {
      return this._instance
    }
  }

  private area: Reference<HTMLDivElement> = ref()
  private count: number = 0

  constructor() {
    super({})
    LoadingMessage._instance = this
  }

  createNode() {
    return (
      <div
        class={[
          'invisible fixed top-0 left-0 z-10 h-full w-full bg-zinc-900/70 opacity-0',
          'transition-[opacity_visibility] duration-150 ease-in-out',
          '[&.show]:visible [&.show]:opacity-100',
        ]}
        ref={this.area}
      >
        <div
          class={['fixed top-1/2 left-1/2 z-20 w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-500 bg-zinc-200', 'dark:bg-zinc-900']}
          onclick={(e) => e.stopPropagation()}
        >
          <div class="my-3 flex items-center justify-center gap-3">
            <span class="icon-[svg-spinners--180-ring] text-3xl"></span>
            <h4 class="text-lg">通信中...</h4>
          </div>
        </div>
      </div>
    )
  }

  attach() {
    this.count++
    if (this.count > 0) {
      this.area.value?.classList.add('show')
    }
  }

  detach() {
    this.count = Math.max(this.count - 1, 0)
    if (this.count === 0) {
      this.area.value?.classList.remove('show')
    }
  }
}
