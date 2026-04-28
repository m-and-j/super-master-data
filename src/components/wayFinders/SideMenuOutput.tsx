import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  uuid?: string
}

/**
 * サイドメニュー(出力)
 */
export default class SideMenuOutput extends MJComponent<Props> {
  createNode({ uuid }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !uuid && location.pathname !== '/outputs-edit-json'
    const jsonMode = location.pathname === '/outputs-edit-json'
    return (
      <div class="flex-[0_0_300px] border-r-3 border-zinc-500 flex flex-col p-2">
        <MJLink to="/outputs" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規出力設定
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="flex flex-col h-[calc(100vh-170px)] overflow-y-scroll scrollbar">
          {projectInfo.outputs.map((e) => (
            <MJLink to={`/outputs/${e.uuid}`} className={['text-blue-500 px-1', e.uuid === uuid ? 'bg-zinc-700' : '']}>
              {e.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="my-3 border-zinc-500" />
        <MJLink to="/outputs-edit-json" className={['px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
          JSON編集
        </MJLink>
      </div>
    )
  }
}
