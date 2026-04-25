import Button from '@/components/inputs/Button'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuOutput from '@/components/wayFinders/SideMenuOutput'
import preferences from '@/systems/preferences'
import { OutputProject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { MJPage, MJRouter } from '@mj/router'

export default class Outputs extends MJPage {
  private targetOutput?: OutputProject

  createNode() {
    const { uuid } = this.params
    const projectInfo = preferences.getProjectInfo()
    const targetOutput = projectInfo.outputs.find((s) => s.uuid === uuid)
    if (targetOutput) {
      this.targetOutput = JSON.parse(JSON.stringify(targetOutput))
    }
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        {/** 左メニュー */}
        <SideMenuOutput uuid={uuid} />

        <div class="flex-auto">
          <form onsubmit={(e) => this.register(e)}>
            <div class="flex items-center gap-2 mx-3">
              <div class="flex-[0_0_100px] text-right">出力名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="出力名" value={this.targetOutput?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetOutput?.description} />
              </div>
            </div>
            <div class="mt-6 mx-2 flex gap-2">
              <div class="flex-auto"></div>
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
              {this.targetOutput && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    try {
      if (this.targetOutput) {
        await preferences.updateOutput(this.targetOutput.uuid, name, description, '', '', { path: '', template: '' }, { path: '', template: '' }, { path: '', template: '' })
        MJRouter.instance.reload()
      } else {
        await preferences.addOutput(name, description, '', '', { path: '', template: '' }, { path: '', template: '' }, { path: '', template: '' })
        MJRouter.instance.push(`/outputs/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetOutput) {
      const { uuid, name } = this.targetOutput
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await preferences.deleteOutput(uuid)
            MJRouter.instance.push('/outputs')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
