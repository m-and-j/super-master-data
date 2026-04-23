import Button from '@/components/inputs/Button'
import InputText from '@/components/inputs/InputText'
import ToastMessage from '@/components/notifications/ToastMessage'
import preferences from '@/systems/preferences'
import { FormDataEx } from '@/utilities/helper-frontend'
import { MJPage, MJRouter } from '@mj/router'
import { open, save } from '@tauri-apps/plugin-dialog'

export default class Home extends MJPage {
  async beforeRender() {}

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const filePath = preferences.getFilePath()

    return (
      <div class="mt-10 mx-auto max-w-3xl flex flex-col gap-6 p-4">
        <h1 class="text-2xl">Home</h1>

        {/** プロジェクトファイル */}
        <section class="border border-zinc-600 rounded-md p-4 flex flex-col gap-3">
          <h2 class="font-semibold">プロジェクトファイル</h2>
          <div class="flex items-center gap-2">
            <div class="flex-[0_0_80px] text-right text-sm">保存先</div>
            <div class="flex-auto break-all text-sm bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 min-h-[34px]">
              {filePath ?? <span class="text-zinc-400">未設定(「開く」または「新規作成」で指定してください)</span>}
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onclick={() => this.onClickOpen()}>
              <span class="icon-[ic--baseline-folder-open] text-lg"></span>
              開く...
            </Button>
            <Button variant="success" size="sm" onclick={() => this.onClickNew()}>
              <span class="icon-[ic--baseline-add] text-lg"></span>
              新規作成...
            </Button>
            <Button variant="primary" size="sm" onclick={() => this.onClickSaveAs()} disabled={!filePath}>
              <span class="icon-[ic--baseline-save-as] text-lg"></span>
              別名で保存...
            </Button>
          </div>
        </section>

        {/** プロジェクト情報 */}
        <section class="border border-zinc-600 rounded-md p-4">
          <h2 class="font-semibold mb-3">プロジェクト情報</h2>
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
      </div>
    )
  }

  private async onClickOpen() {
    const selected = await open({
      title: 'プロジェクトファイルを開く',
      multiple: false,
      directory: false,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (typeof selected === 'string') {
      try {
        await preferences.openProject(selected)
        MJRouter.instance.reload()
      } catch (e) {
        console.error(e)
        ToastMessage.instance.open('danger', `プロジェクトファイルの読み込みに失敗しました。\n${selected}`)
      }
    }
  }

  private async onClickNew() {
    const selected = await save({
      title: '新規プロジェクトファイルの作成',
      defaultPath: 'project.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (typeof selected === 'string') {
      try {
        await preferences.createNewProject(selected)
        MJRouter.instance.reload()
      } catch (e) {
        console.error(e)
        ToastMessage.instance.open('danger', `プロジェクトファイルの作成に失敗しました。\n${selected}`)
      }
    }
  }

  private async onClickSaveAs() {
    const current = preferences.getFilePath()
    const selected = await save({
      title: '別名で保存',
      defaultPath: current ?? 'project.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (typeof selected === 'string') {
      try {
        await preferences.saveAs(selected)
        MJRouter.instance.reload()
      } catch (e) {
        console.error(e)
        ToastMessage.instance.open('danger', `保存に失敗しました。\n${selected}`)
      }
    }
  }

  private async onSubmitMeta(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    await preferences.updateProjectMeta(name, description)
    ToastMessage.instance.open('success', '保存しました。')
    MJRouter.instance.reload()
  }
}
