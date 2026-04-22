import ScrollArea from '@/components/Controllers/ScrollArea'
import TabItem from '@/components/Controllers/TabItem'
import TabPanel from '@/components/Controllers/TabPanel'
import Enumerations from '@/routes/Enumerations'
import Home from '@/routes/Home'
import MasterData from '@/routes/MasterData'
import Schemas from '@/routes/Schemas'
import Tables from '@/routes/Tables'
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
        <div class="flex">
          <ScrollArea x className="flex-auto">
            <TabPanel>
              <TabItem path="/" unerasable>
                <span class="icon-[ic--baseline-home] text-2xl"></span>
              </TabItem>
              <TabItem path="/tables" group="/tables" unerasable>
                <div class="flex items-center gap-1">
                  <span class="icon-[ic--outline-table-chart] text-xl"></span>
                  テーブル
                </div>
              </TabItem>
              <TabItem path="/schemas" group="/schemas" unerasable>
                <div class="flex items-center gap-1">
                  <span class="icon-[ic--outline-schema] text-xl"></span>
                  スキーマ
                </div>
              </TabItem>
              <TabItem path="/enumerations" unerasable>
                <div class="flex items-center gap-1">
                  <span class="icon-[ic--round-format-list-bulleted] text-xl"></span>
                  列挙型
                </div>
              </TabItem>
              <TabItem path="/master-data" unerasable>
                <div class="flex items-center gap-1">
                  <span class="icon-[ic--outline-dataset] text-xl"></span>
                  マスターデータ
                </div>
              </TabItem>
            </TabPanel>
          </ScrollArea>
        </div>

        <MJRouter
          routes={[
            { path: '/', Page: Home },
            { path: '/tables', Page: Tables },
            { path: '/schemas', Page: Schemas },
            { path: '/schemas/{name}', Page: Schemas },
            { path: '/enumerations', Page: Enumerations },
            { path: '/enumerations/{name}', Page: Enumerations },
            { path: '/master-data', Page: MasterData },
          ]}
        />
      </>
    )
  }
}
