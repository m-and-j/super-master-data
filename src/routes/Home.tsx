import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { LoadingMessage } from '@/components/notifications/LoadingMessage'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { NavigationTab } from '@/components/wayFinders/NavigationTab'
import { outputDistribution } from '@/systems/output-distributors/output-distributor'
import { preferences } from '@/systems/preferences'
import { OutputProjectRaw } from '@/systems/types'
import { checkUpdate, getCurrentVersion } from '@/systems/updater'
import { FormDataEx } from '@/utilities/helper-frontend'
import { MJPage, MJRouter } from '@mj/router'
import { open } from '@tauri-apps/plugin-dialog'

export class Home extends MJPage {
  private currentVersion: string = ''

  async beforeRender() {
    this.currentVersion = await getCurrentVersion()
  }

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const filePath = preferences.getFolderPath()
    return (
      <div class="mx-auto mt-10 flex max-w-4xl flex-col gap-6 p-4">
        {/** プロジェクトフォルダ */}
        <section class="flex flex-col gap-3 rounded-md border border-zinc-600 p-4">
          <h2 class="font-semibold">プロジェクトフォルダ</h2>
          <div class="flex items-center gap-2">
            <div class="flex-[0_0_80px] text-right text-sm">保存先</div>
            <div class="min-h-[34px] flex-auto rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm break-all">
              {filePath ?? <span class="text-zinc-400">未設定 (プロジェクトフォルダを「開く」から指定してください)</span>}
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onclick={() => this.onClickOpen()}>
              <span class="icon-[ic--baseline-folder-open] text-lg"></span>
              開く
            </Button>
          </div>
        </section>

        {/** プロジェクト情報 */}
        {preferences.existsProject() && (
          <section class="rounded-md border border-zinc-600 p-4">
            <h2 class="mb-3 font-semibold">プロジェクト情報</h2>
            <form onsubmit={(e) => this.onSubmitMeta(e)}>
              <div class="flex items-center gap-2">
                <div class="flex-[0_0_100px] text-right text-sm">プロジェクト名</div>
                <div class="flex-auto">
                  <InputText name="name" placeholder="プロジェクト名" value={projectInfo.name} />
                </div>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <div class="flex-[0_0_100px] text-right text-sm">説明</div>
                <div class="flex-auto">
                  <InputText name="description" placeholder="説明" value={projectInfo.description} />
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <Button type="submit" variant="primary" size="sm" disabled={!filePath}>
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </Button>
              </div>
            </form>
          </section>
        )}

        {/** データ出力 */}
        <section class="rounded-md border border-zinc-600 p-4">
          <h2 class="mb-3 font-semibold">データ出力</h2>
          <div class="flex justify-center gap-3">
            <Button variant="success" size="md" onclick={() => this.onClickOutputAll()}>
              <span class="icon-[ic--baseline-sim-card-download] text-xl"></span>
              すべて出力
            </Button>
            <div class="flex-auto"></div>
            {projectInfo.outputs.map((output) => (
              <Button variant="secondary" size="md" onclick={() => this.onClickOutput(output)}>
                <span class="icon-[ic--baseline-sim-card-download] text-xl"></span>
                {output.name}
              </Button>
            ))}
          </div>
        </section>

        {/** アプリ情報 */}
        <section class="rounded-md border border-zinc-600 p-4">
          <h2 class="mb-3 font-semibold">アプリ情報</h2>
          <div class="flex items-center gap-2">
            <div class="flex-[0_0_100px] text-right text-sm">バージョン</div>
            <div class="flex-auto text-sm">v{this.currentVersion}</div>
            <Button variant="secondary" size="sm" onclick={() => this.onClickCheckUpdate()}>
              <span class="icon-[ic--baseline-system-update] text-lg"></span>
              更新を確認
            </Button>
          </div>
        </section>
      </div>
    )
  }

  private async onClickCheckUpdate() {
    LoadingMessage.instance?.attach()
    try {
      await checkUpdate()
    } finally {
      LoadingMessage.instance?.detach()
    }
  }

  private async onClickOpen() {
    const selected = await open({
      title: 'プロジェクトフォルダを開く',
      multiple: false,
      directory: true,
    })
    if (typeof selected === 'string') {
      try {
        const created = await preferences.openProject(selected)
        NavigationTab.instance.render()
        MJRouter.instance.reload()
        ToastMessage.instance.open('success', created ? 'プロジェクトファイルを作成しました。' : 'プロジェクトファイルを読み込みました。')
      } catch (e) {
        console.error(e)
        ToastMessage.instance.open('danger', `プロジェクトファイルの読み込みに失敗しました。\n${selected}`)
      }
    }
  }

  private async onSubmitMeta(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    await preferences.updateProjectMeta(name, description)
    ToastMessage.instance.open('success', 'プロジェクト情報を保存しました。')
    MJRouter.instance.reload()
  }

  private async onClickOutputAll() {
    try {
      LoadingMessage.instance?.attach()
      const outputs = preferences.getProjectInfo().outputs
      for (const output of outputs) {
        await outputDistribution(output)
      }
      LoadingMessage.instance?.detach()
      ToastMessage.instance.open('success', 'データを出力しました')
    } catch (e) {
      console.error(e)
    }
  }

  private async onClickOutput(output: OutputProjectRaw) {
    try {
      LoadingMessage.instance?.attach()
      await outputDistribution(output)
      LoadingMessage.instance?.detach()
      ToastMessage.instance.open('success', `「${output.name}」データを出力しました`)
    } catch (e) {
      console.error(e)
    }
  }
}
