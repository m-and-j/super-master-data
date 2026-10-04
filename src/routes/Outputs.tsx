import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { OutputForm } from '@/components/inputs/OutputForm'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { OutputFolderModal } from '@/components/modals/OutputFolderModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuOutput } from '@/components/wayFinders/SideMenuOutput'
import { outputAccessor } from '@/systems/accessors/output-accessor'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectRaw } from '@/systems/types'
import { MJPage, MJRouter } from '@mj/router'

export class Outputs extends MJPage {
  createNode() {
    const { name } = this.params
    const output = outputAccessor.get(name)
    const outputProject = new OutputProject(output)
    const basePath = outputProject.tryGetBasePath()
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuOutput currentName={name} />

        {/** コンテンツ */}
        <form class="flex-auto p-2" onsubmit={(e) => this.register(e, outputProject, output)}>
          {/** 基本情報 */}
          <div class="mx-1 mb-2 flex items-center gap-2">
            <div class="flex-[0_0_180px] text-right">出力名</div>
            <div class="flex-[0_0_400px]">
              <InputText placeholder="例: client / server" value={outputProject.getName()} onchange={(e) => outputProject.changeName(e)} />
            </div>
            <div class="flex-[0_0_50px] text-right">説明</div>
            <div class="flex-auto">
              <InputText placeholder="例: クライアント用 / サーバー用" value={outputProject.getDescription()} onchange={(e) => outputProject.changeDescription(e)} />
            </div>
          </div>
          <div class="mx-1 mb-3 flex items-center gap-2">
            <div class="flex-[0_0_180px] text-right">コード拡張子</div>
            <div class="flex-[0_0_120px]">
              <InputText placeholder="例: cs" value={outputProject.getCodeExtension()} onchange={(e) => outputProject.changeCodeExtension(e)} />
            </div>
            <div class="text-xs text-zinc-400">再出力時に指定された拡張子のファイルをすべて削除してから出力します。</div>
            <div class="flex-auto"></div>
            <div class="flex-[0_0_95px] text-right">ベースパス(!)</div>
            <div class="min-h-[34px] flex-[0_0_400px] truncate rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 break-all" title={basePath}>
              {basePath}
            </div>
            <div>
              <Button variant="secondary" size="sm" onclick={() => OutputFolderModal.instance?.open(outputProject)} disabled={!output}>
                <span class="icon-[ic--baseline-folder-open] text-lg"></span>
                変更
              </Button>
            </div>
          </div>

          {/** 各ソースコード出力セクション */}
          <OutputForm outputProject={outputProject} />

          {/** 保存 / 削除ボタン */}
          <div class="mx-1 mt-4 flex gap-2">
            <div class="flex-auto" />
            <Button type="submit" variant="primary" size="sm">
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-save] text-lg"></span>
                保存
              </div>
            </Button>
            {output && (
              <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete(output)}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-delete] text-lg"></span>
                  削除
                </div>
              </Button>
            )}
          </div>
        </form>

        <OutputFolderModal />
      </div>
    )
  }

  private async register(event: SubmitEvent, outputProject: OutputProject, outputRaw?: OutputProjectRaw) {
    event.preventDefault()
    try {
      await outputAccessor.write(outputProject.toRaw(), outputRaw?.name)
      MJRouter.instance.push(`/outputs/${outputProject.getName()}`)
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete(outputRaw?: OutputProjectRaw) {
    if (outputRaw) {
      const { name } = outputRaw
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await outputAccessor.remove(outputRaw)
            MJRouter.instance.push('/outputs')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
