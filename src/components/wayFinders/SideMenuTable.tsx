import masterData from '@/systems/master-data'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(テーブル)
 */
export default class SideMenuTable extends MJComponent<Props> {
  createNode({ currentName }: Props) {
    const newMode = !currentName && location.pathname !== '/tables-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500 p-2">
        <MJLink to="/tables" className={['px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
          新規テーブル
        </MJLink>
        <hr class="my-3 border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-117px)] flex-col overflow-y-scroll">
          {masterData.getNames().map((name) => (
            <MJLink to={`/tables/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
              {name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
      </div>
    )
  }
}
