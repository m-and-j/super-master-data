import { MasterDataGrid } from '@/components/data-grid/MasterDataGrid'
import { SubEditorPanel } from '@/components/data-grid/SubEditorPanel'
import { Button } from '@/components/inputs/Button'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuListData } from '@/components/wayFinders/SideMenuListData'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { TableRaw } from '@/systems/types'
import { formatNumber } from '@/utilities/helper-text'
import { ref, Reference } from '@mj/jsx'
import { MJPage } from '@mj/router'

export class ListData extends MJPage {
  private table?: TableRaw

  async beforeRender() {
    const { name } = this.params
    this.table = await masterListAccessor.read(name)
  }

  createNode() {
    const { name } = this.params
    const gridRef: Reference<MasterDataGrid> = ref()
    const schemaPanelRef: Reference<SubEditorPanel> = ref()
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr_600px] grid-rows-[45px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuListData currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        {(this.table && (
          <>
            <div class="col-span-2 flex items-center gap-2 px-4">
              <div class="font-semibold">{`${this.table?.name}【${this.table?.description}】`}</div>
              <div class="text-sm text-zinc-400">{formatNumber(this.table?.data.length ?? 0)} 件</div>
              <div class="flex-auto"></div>
              <Button variant="success" size="sm" onclick={() => gridRef.value?.addRow()}>
                <span class="icon-[ic--baseline-add] text-lg"></span>
                行追加
              </Button>
              <Button variant="primary" size="sm" onclick={() => this.save()}>
                <span class="icon-[ic--baseline-save] text-lg"></span>
                保存
              </Button>
            </div>
            <MasterDataGrid columns={this.table.columns} data={this.table.data} className="col-span-2" ref={gridRef} schemaPanelRef={schemaPanelRef} />
          </>
        )) || <div class="col-span-2 row-span-2 flex h-full items-center justify-center text-zinc-400">左のテーブル一覧から編集対象を選択してください。</div>}

        {/** データ編集用分割パネル */}
        <SubEditorPanel
          className="hidden"
          ref={schemaPanelRef}
          openCallback={() => gridRef.value?.classList.remove('col-span-2')}
          closeCallback={() => gridRef.value?.classList.add('col-span-2')}
        />
      </div>
    )
  }

  private async save() {
    if (this.table) {
      try {
        const tableData = JSON.parse(JSON.stringify(this.table))
        await masterListAccessor.write(tableData)
        ToastMessage.instance.open('success', '保存しました。')
      } catch (e) {
        console.error(e)
        const message = e instanceof Error ? e.message : '保存に失敗しました。'
        ToastMessage.instance.open('danger', message)
      }
    }
  }
}
