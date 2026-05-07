import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(出力)
 */
export default class SideMenuOutput extends MJComponent<Props> {
  createNode({ currentName }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/outputs-edit-json'
    const jsonMode = location.pathname === '/outputs-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500 p-2">
        <MJLink to="/outputs" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規出力設定
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-170px)] flex-col overflow-y-scroll">
          {projectInfo.outputs.map((o) => (
            <MJLink to={`/outputs/${o.name}`} className={['px-1 text-blue-500', o.name === currentName ? 'bg-zinc-700' : '']}>
              {o.name}
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
