import masterData from '@/systems/master-data'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(マスターデータ)
 */
export default class SideMenuMasterData extends MJComponent<Props> {
  createNode({ currentName }: Props) {
    return (
      <div class="scrollbar flex h-[calc(100vh-52px)] flex-[0_0_300px] flex-col overflow-y-scroll border-r-3 border-zinc-500 p-2">
        {masterData.getNames().map((name) => (
          <MJLink to={`/master-data/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
            {name}
          </MJLink>
        ))}
        <div class="flex-auto" />
      </div>
    )
  }
}
