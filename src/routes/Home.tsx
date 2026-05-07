import Button from '@/components/inputs/Button'
import InputText from '@/components/inputs/InputText'
import ToastMessage from '@/components/notifications/ToastMessage'
import TabPanel from '@/components/wayFinders/NavigationTab'
import preferences from '@/systems/preferences'
import { FormDataEx } from '@/utilities/helper-frontend'
import { MJPage, MJRouter } from '@mj/router'
import { open } from '@tauri-apps/plugin-dialog'

export default class Home extends MJPage {
  async beforeRender() {}

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const filePath = preferences.getFolderPath()

    return (
      <div class="mx-auto mt-10 flex max-w-3xl flex-col gap-6 p-4">
        {/** プロジェクトファイル */}
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
      </div>
    )
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
        TabPanel.instance.render()
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
}
