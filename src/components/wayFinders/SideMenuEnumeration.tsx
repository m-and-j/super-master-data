import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  uuid?: string
}

/**
 * サイドメニュー(列挙型)
 */
export default class SideMenuEnumeration extends MJComponent<Props> {
  createNode({ uuid }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !uuid && location.pathname !== '/enumerations-edit-json'
    const jsonMode = location.pathname === '/enumerations-edit-json'
    return (
      <div class="flex-[0_0_300px] border-r-3 border-zinc-500 flex flex-col p-2">
        <MJLink to="/enumerations" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規列挙型
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="flex flex-col h-[calc(100vh-170px)] overflow-y-scroll scrollbar">
          {projectInfo.enumerations.map((e) => (
            <MJLink to={`/enumerations/${e.uuid}`} className={['text-blue-500 px-1', e.uuid === uuid ? 'bg-zinc-700' : '']}>
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
