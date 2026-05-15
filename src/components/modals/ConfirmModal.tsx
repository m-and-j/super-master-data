import Button from '@/components/inputs/Button'
import ModalBase from '@/components/modals/ModalBase'
import { InputVariantType } from '@/systems/define'
import { MJ, MJCustomElement } from '@mj/jsx'

interface ButtonInfo {
  label: string
  callback: () => void
  variant?: InputVariantType
}
interface Props extends MJ.CEProps<ConfirmModal> {}

/**
 * 確認モーダル
 */
export default class ConfirmModal extends MJCustomElement<Props>()(ModalBase, 'div') {
  static get instance() {
    return document.querySelector<ConfirmModal>(ConfirmModal.domName)
  }

  private headerTitle = ''
  private message = ''
  private positive?: ButtonInfo
  private negative?: ButtonInfo
  private neutral?: ButtonInfo

  createNode() {
    return this.createModal(
      <div class="w-[600px] p-5">
        {this.headerTitle && (
          <>
            <h3>{this.headerTitle}</h3>
            <hr class="my-3" />
          </>
        )}
        <div class="whitespace-pre-wrap">{this.message}</div>
        <div class="mt-10 flex gap-3">
          <div class="flex-auto">
            {this.neutral && (
              <Button variant={this.neutral.variant ?? 'secondary'} onclick={() => this.neutralCallback()}>
                {this.neutral.label}
              </Button>
            )}
          </div>
          <Button variant={this.negative?.variant ?? 'secondary'} onclick={() => this.negativeCallback()}>
            {this.negative?.label ?? '閉じる'}
          </Button>
          {this.positive && (
            <Button variant={this.positive.variant ?? 'primary'} onclick={() => this.positiveCallback()}>
              {this.positive.label}
            </Button>
          )}
        </div>
      </div>,
    )
  }

  async open(message: string, options?: { headerTitle?: string; positive?: ButtonInfo; negative?: ButtonInfo; neutral?: ButtonInfo; backdropClose?: boolean }) {
    this.message = message
    this.headerTitle = options?.headerTitle ?? ''
    this.positive = options?.positive
    this.negative = options?.negative
    this.neutral = options?.neutral
    this.backdropCloseFlag = options?.backdropClose ?? true
    await this.render()
    super.open()
  }

  private positiveCallback() {
    this.positive?.callback()
    this.close()
  }

  private negativeCallback() {
    this.negative?.callback()
    this.close()
  }

  private neutralCallback() {
    this.neutral?.callback()
    this.close()
  }
}
