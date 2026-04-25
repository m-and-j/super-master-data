import ConfirmModal from '@/components/modals/ConfirmModal'
import LoadingMessage from '@/components/notifications/LoadingMessage'
import ShotMessage from '@/components/notifications/ShotMessage'
import ToastMessage from '@/components/notifications/ToastMessage'
import NavigationTab from '@/components/wayFinders/NavigationTab'
import Enumerations from '@/routes/Enumerations'
import EnumerationsJsonEdit from '@/routes/EnumerationsJsonEdit'
import Home from '@/routes/Home'
import MasterData from '@/routes/MasterData'
import Schemas from '@/routes/Schemas'
import SchemasJsonEdit from '@/routes/SchemasJsonEdit'
import Tables from '@/routes/Tables'
import TablesJsonEdit from '@/routes/TablesJsonEdit'
import { LocalStorageKeys } from '@/utilities/defines'
import { MJComponent } from '@mj/jsx'
import { MJRouter } from '@mj/router'

/**
 * アプリコンテンツ
 */
export default class AppContent extends MJComponent {
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
            { path: '/tables', group: '/tables', title: 'テーブル', icon: 'icon-[ic--outline-table-chart] text-xl', unerasable: true },
            { path: '/schemas', group: '/schemas', title: 'スキーマ', icon: 'icon-[ic--outline-schema] text-xl', unerasable: true },
            { path: '/enumerations', group: '/enumerations', title: '列挙型', icon: 'icon-[ic--round-format-list-bulleted] text-xl', unerasable: true },
            { path: '/master-data', group: '/master-data', title: 'マスターデータ', icon: 'icon-[ic--outline-dataset] text-xl', unerasable: true },
          ]}
        />

        <MJRouter
          routes={[
            { path: '/', Page: Home },
            { path: '/tables', Page: Tables },
            { path: '/tables/{name}', Page: Tables },
            { path: '/tables-edit-json', Page: TablesJsonEdit },
            { path: '/schemas', Page: Schemas },
            { path: '/schemas/{name}', Page: Schemas },
            { path: '/schemas-edit-json', Page: SchemasJsonEdit },
            { path: '/enumerations', Page: Enumerations },
            { path: '/enumerations/{name}', Page: Enumerations },
            { path: '/enumerations-edit-json', Page: EnumerationsJsonEdit },
            { path: '/master-data', Page: MasterData },
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
    const theme = localStorage.getItem(LocalStorageKeys.Theme) ?? (pcDark ? 'dark' : 'light')
    document.documentElement.dataset.theme = theme
  }
}
