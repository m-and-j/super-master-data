import { VariantIconClassName, VariantIconClassNames, VariantMessageAreaClassNames, VariantType } from '@/systems/define'
import { MJComponent, ref, Reference } from '@mj/jsx'

export class ToastMessage extends MJComponent {
  private static _instance: ToastMessage
  static get instance() {
    if (this._instance) {
      return this._instance
    } else {
      throw new Error('ToastMessage is not being used.')
    }
  }

  private timerId: number | null = null
  private toastArea: Reference<HTMLDivElement> = ref()
  private iconArea: Reference<HTMLSpanElement> = ref()
  private messageArea: Reference<HTMLSpanElement> = ref()

  constructor() {
    super({})
    ToastMessage._instance = this
  }

  createNode() {
    return (
      <div
        class={[
          'invisible fixed top-10 -right-96 z-30 flex w-96 items-center gap-2 rounded-xl border p-4 whitespace-break-spaces opacity-0',
          'transition-all duration-300 ease-in-out',
          '[&.show]:visible [&.show]:right-10 [&.show]:opacity-100',
        ]}
        ref={this.toastArea}
      >
        <span class="text-2xl" ref={this.iconArea} />
        <span ref={this.messageArea}>message</span>
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
      }, delay ?? 5000)
    }
  }
}
