import { VariantIconClassName, VariantIconClassNames, VariantMessageAreaClassNames, VariantType } from '@/utilities/defines'
import { MJComponent, ref, Reference } from '@mj/jsx'

export default class ShotMessage extends MJComponent {
  private static _instance: ShotMessage
  static get instance() {
    if (this._instance) {
      return this._instance
    } else {
      throw new Error('ShotMessage is not being used.')
    }
  }

  private timerId: number | null = null
  private toastArea: Reference<HTMLDivElement> = ref()
  private iconArea: Reference<HTMLSpanElement> = ref()
  private messageArea: Reference<HTMLSpanElement> = ref()

  constructor() {
    super({})
    ShotMessage._instance = this
  }

  createNode() {
    return (
      <div
        class={[
          'invisible fixed top-1/2 left-1/2 z-30 flex -translate-x-[calc(calc(100%-100px)/2)] -translate-y-1/2 items-center gap-2 rounded-xl border p-4 opacity-0',
          'transition-all duration-200 ease-in-out',
          '[&.show]:visible [&.show]:opacity-100',
        ]}
        ref={this.toastArea}
      >
        <span class="text-3xl" ref={this.iconArea} />
        <span class="text-2xl" ref={this.messageArea}>
          message
        </span>
      </div>
    )
  }

  open(variant: VariantType, message: string, delay?: number) {
    if (this.timerId != null) {
      clearTimeout(this.timerId)
      this.timerId = null
      this.toastArea.value?.classList.remove('show')
      setTimeout(() => {
        this.open(variant, message, delay)
      }, 300)
    } else {
      this.iconArea.value?.classList.remove(...VariantIconClassNames)
      this.iconArea.value?.classList.add(VariantIconClassName[variant])
      this.messageArea.value!.textContent = message
      this.toastArea.value?.classList.remove(...VariantMessageAreaClassNames)
      this.toastArea.value?.classList.add(`message-area-${variant}`)
      this.toastArea.value?.classList.add('show')
      this.timerId = setTimeout(() => {
        this.toastArea.value?.classList.remove('show')
      }, delay ?? 2000)
    }
  }
}
