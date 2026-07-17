import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { LoadingMessage } from '@/components/notifications/LoadingMessage'
import { ShotMessage } from '@/components/notifications/ShotMessage'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { NavigationTab } from '@/components/wayFinders/NavigationTab'
import { Constants } from '@/routes/Constants'
import { Enumerations } from '@/routes/Enumerations'
import { EnumerationsJsonEdit } from '@/routes/EnumerationsJsonEdit'
import { Home } from '@/routes/Home'
import { ListData } from '@/routes/ListData'
import { ListStructs } from '@/routes/ListStructs'
import { MasterData } from '@/routes/MasterData'
import { Outputs } from '@/routes/Outputs'
import { OUtputsJsonEdit } from '@/routes/OutputsJsonEdit'
import { Schemas } from '@/routes/Schemas'
import { SchemasJsonEdit } from '@/routes/SchemasJsonEdit'
import { Tables } from '@/routes/Tables'
import { cacheStore } from '@/systems/cache-store'
import { MJComponent } from '@mj/jsx'
import { MJRouter } from '@mj/router'

/**
 * アプリコンテンツ
 */
export class AppContent extends MJComponent {
  constructor() {
    super({})
  }

  createNode() {
    return (
      <>
        {/** Navigation Tab */}
        <NavigationTab
          destinations={[
            { path: '/', icon: 'icon-[ic--baseline-home] text-2xl', unerasable: true, always: true },
            { path: '/outputs', group: '/outputs', title: '出力', icon: 'icon-[ic--outline-local-printshop] text-xl', unerasable: true },
            { path: '/tables', group: '/tables', title: 'テーブル', icon: 'icon-[ic--outline-table-chart] text-xl', unerasable: true },
            { path: '/list-structs', group: '/list-structs', title: 'リスト構造', icon: 'icon-[ic--baseline-view-list] text-xl', unerasable: true },
            { path: '/schemas', group: '/schemas', title: 'スキーマ', icon: 'icon-[ic--outline-schema] text-xl', unerasable: true },
            { path: '/enumerations', group: '/enumerations', title: '列挙型', icon: 'icon-[ic--round-format-list-bulleted] text-xl', unerasable: true },
            { path: '/constants', group: '/constants', title: '定数', icon: 'icon-[ic--round-functions] text-xl', unerasable: true },
            { path: '/master-data', group: '/master-data', title: 'マスターデータ', icon: 'icon-[ic--outline-dataset] text-xl', unerasable: true },
            { path: '/list-data', group: '/list-data', title: 'リストデータ', icon: 'icon-[ic--outline-dataset] text-xl', unerasable: true },
          ]}
        />

        <MJRouter
          routes={[
            { path: '/', Page: Home },
            { path: '/constants', Page: Constants },
            { path: '/constants/{name}', Page: Constants },
            { path: '/enumerations', Page: Enumerations },
            { path: '/enumerations/{name}', Page: Enumerations },
            { path: '/enumerations-edit-json', Page: EnumerationsJsonEdit },
            { path: '/list-structs', Page: ListStructs },
            { path: '/list-structs/{name}', Page: ListStructs },
            { path: '/master-data', Page: MasterData },
            { path: '/master-data/{name}', Page: MasterData },
            { path: '/outputs', Page: Outputs },
            { path: '/outputs/{name}', Page: Outputs },
            { path: '/outputs-edit-json', Page: OUtputsJsonEdit },
            { path: '/schemas', Page: Schemas },
            { path: '/schemas/{name}', Page: Schemas },
            { path: '/schemas-edit-json', Page: SchemasJsonEdit },
            { path: '/tables', Page: Tables },
            { path: '/tables/{name}', Page: Tables },
            { path: '/list-data', Page: ListData },
            { path: '/list-data/{name}', Page: ListData },
          ]}
          debug
        />
        <ConfirmModal />
        <LoadingMessage />
        <ShotMessage />
        <ToastMessage />
      </>
    )
  }

  async afterRender() {
    const pcDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = cacheStore.theme.getValue() ?? (pcDark ? 'dark' : 'light')
    document.documentElement.dataset.theme = theme
  }
}
