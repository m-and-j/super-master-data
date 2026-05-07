import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(スキーマ)
 */
export default class SideMenuSchema extends MJComponent<Props> {
  createNode({ currentName }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/schemas-edit-json'
    const jsonMode = location.pathname === '/schemas-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500 p-2">
        <MJLink to="/schemas" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規スキーマ
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-170px)] flex-col overflow-y-scroll">
          {projectInfo.schemas.map((s) => (
            <MJLink to={`/schemas/${s.name}`} className={['px-1 text-blue-500', s.name === currentName ? 'bg-zinc-700' : '']}>
              {s.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="my-3 border-zinc-500" />
        <MJLink to="/schemas-edit-json" className={['px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
          JSON編集
        </MJLink>
      </div>
    )
  }
}
