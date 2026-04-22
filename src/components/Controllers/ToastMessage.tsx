import { MJComponent, ref, Reference } from '@mj/jsx'

export default class ToastMessage extends MJComponent {
  private static _instance: ToastMessage
  static get instance() {
    if (this._instance) {
      return this._instance
    } else {
      throw new Error('ToastMessage is not being used.')
    }
  }

  private toastArea: Reference<HTMLDivElement> = ref()
  private messageArea: Reference<HTMLDivElement> = ref()

  constructor() {
    super({})
    ToastMessage._instance = this
  }

  createNode() {
    return (
      <div
        class={[
          'fixed z-30 left-1/2 -translate-x-1/2 bottom-24 w-96 bg-green-950 border border-green-800 text-green-300 rounded-md invisible opacity-0',
          'transition-all duration-300 ease-in-out',
          '[&.show]:visible [&.show]:opacity-100',
        ]}
        ref={this.toastArea}
      >
        <div class="border-b border-green-900">
          <div class="mx-4 my-2">
            <strong>Information</strong>
          </div>
        </div>
        <div class="mx-4 my-2" ref={this.messageArea}>
          message
        </div>
      </div>
    )
  }

  open(message: string, options?: { delay?: number; kind?: string }) {
    this.messageArea.value!.textContent = message
    this.toastArea.value?.classList.add('show')
    setTimeout(() => {
      this.toastArea.value?.classList.remove('show')
    }, options?.delay ?? 3000)
  }
}
