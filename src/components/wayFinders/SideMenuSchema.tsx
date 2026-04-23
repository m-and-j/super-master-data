import preferences from '@/systems/preferences'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  name?: string
}

/**
 * サイドメニュー(スキーマ)
 */
export default class SideMenuSchema extends MJComponent<Props> {
  createNode({ name }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !name && location.pathname !== '/enumerations-edit-json'
    const jsonMode = location.pathname === '/enumerations-edit-json'
    return (
      <div class="flex-[0_0_300px] border-r-3 border-zinc-500 flex flex-col p-2">
        <MJLink to="/schemas" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規スキーマ
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="flex flex-col h-[calc(100vh-170px)] overflow-y-scroll" style={{ scrollbarColor: '#888 transparent', scrollbarWidth: 'thin' }}>
          {projectInfo.schemas.map((e) => (
            <MJLink to={`/schemas/${e.name}`} className={['text-blue-500 px-1', e.name === name ? 'bg-zinc-700' : '']}>
              {e.name}
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
