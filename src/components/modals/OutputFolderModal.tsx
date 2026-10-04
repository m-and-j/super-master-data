import { Button } from '@/components/inputs/Button'
import { ModalBase } from '@/components/modals/ModalBase'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { MJ, MJCustomElement } from '@mj/jsx'
import { MJRouter } from '@mj/router'
import { open } from '@tauri-apps/plugin-dialog'

interface Props extends MJ.CEProps<OutputFolderModal> {}

/**
 * 出力先変更モーダル
 */
export class OutputFolderModal extends MJCustomElement<Props>()(ModalBase, 'div') {
  static get instance() {
    return document.querySelector<OutputFolderModal>(OutputFolderModal.domName)
  }

  private outputProject?: OutputProject

  createNode() {
    return this.createModal(
      <div class="w-[600px] p-5">
        <h3>「{this.outputProject?.getName()}」の出力先ベースパス変更</h3>
        <hr class="my-3" />
        <div class="rounded-lg border border-amber-700 bg-amber-400 p-2 text-xs text-amber-700">
          ここで変更した出力先ベースパスはローカル環境のみに保存され、プロジェクトファイルには反映されません。
        </div>
        <div class="mt-2 flex items-center gap-2">
          <div class="text-sm">出力先ベースパス</div>
          <div class="min-h-[34px] flex-auto rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm break-all">{this.outputProject?.tryGetBasePath()}</div>
          <Button variant="success" size="sm" onclick={() => this.openDialog()}>
            <span class="icon-[ic--baseline-folder-open] text-lg"></span>
            開く
          </Button>
        </div>
        <div class="mt-10 flex justify-end gap-3">
          <Button variant="danger" onclick={() => this.clear()}>
            クリア
          </Button>
          <Button variant="secondary" onclick={() => this.close()}>
            閉じる
          </Button>
        </div>
      </div>,
    )
  }

  async open(outputProject: OutputProject) {
    this.outputProject = outputProject
    await this.render()
    super.open()
  }

  private async openDialog() {
    if (this.outputProject) {
      const selected = await open({
        title: '出力先ベースパス変更',
        multiple: false,
        directory: true,
      })
      if (typeof selected === 'string') {
        this.outputProject.saveBasePath(selected)
        MJRouter.instance.reload()
        ToastMessage.instance.open('success', '出力先ベースパスを変更しました。')
        this.close()
      }
    }
  }

  private async clear() {
    if (this.outputProject) {
      this.outputProject.clearBasePath()
      await this.render()
      MJRouter.instance.reload()
      ToastMessage.instance.open('success', '出力先ベースパスをプロジェクトファイル基点に戻しました。')
    }
  }
}
