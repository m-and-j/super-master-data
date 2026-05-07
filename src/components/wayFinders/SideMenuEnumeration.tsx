import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(列挙型)
 */
export default class SideMenuEnumeration extends MJComponent<Props> {
  createNode({ currentName }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/enumerations-edit-json'
    const jsonMode = location.pathname === '/enumerations-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500 p-2">
        <MJLink to="/enumerations" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規列挙型
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-170px)] flex-col overflow-y-scroll">
          {projectInfo.enumerations.map((e) => (
            <MJLink to={`/enumerations/${e.name}`} className={['px-1 text-blue-500', e.name === currentName ? 'bg-zinc-700' : '']}>
              {e.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="my-3 border-zinc-500" />
        <MJLink to="/enumerations-edit-json" className={['px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
          JSON編集
        </MJLink>
      </div>
    )
  }
}
