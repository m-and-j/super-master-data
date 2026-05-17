import MasterDataGrid from '@/components/data-grid/MasterDataGrid'
import { default as SchemaPanel, default as SubEditorPanel } from '@/components/data-grid/SubEditorPanel'
import Button from '@/components/inputs/Button'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuMasterData from '@/components/wayFinders/SideMenuMasterData'
import { DataClassification } from '@/systems/define'
import masterData from '@/systems/master-data'
import { Table } from '@/systems/types'
import { formatNumber } from '@/utilities/helper-text'
import { ref, Reference } from '@mj/jsx'
import { MJPage } from '@mj/router'

export default class MasterData extends MJPage {
  private table?: Table
  private idColumnCount = 0

  async beforeRender() {
    const { name } = this.params
    this.table = await masterData.read(name)
    const { columns = [] } = this.table ?? {}
    this.idColumnCount = columns.filter((c) => c.type.classification === DataClassification.ID).length
  }

  createNode() {
    const { name } = this.params
    const gridRef: Reference<MasterDataGrid> = ref()
    const schemaPanelRef: Reference<SchemaPanel> = ref()
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr_600px] grid-rows-[45px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuMasterData currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        {(this.table && (
          <>
            {(this.idColumnCount === 1 && (
              <>
                <div class="col-span-2 flex items-center gap-2 px-4">
                  <div class="font-semibold">{this.table?.name}</div>
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
            )) || (
              <div class="col-span-2 row-span-2 flex h-full flex-auto items-center justify-center px-6 text-center text-rose-300">
                <div>
                  <div class="mb-2 font-bold">構造に問題があるため編集できません</div>
                  <div class="text-sm">
                    テーブル「{name}」のIDカラムは1つでなければなりません。
                    <br />
                    現在の ID カラム数: {formatNumber(this.idColumnCount)} 個
                  </div>
                </div>
              </div>
            )}
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
        await masterData.write(tableData)
        ToastMessage.instance.open('success', '保存しました。')
      } catch (e) {
        console.error(e)
        const message = e instanceof Error ? e.message : '保存に失敗しました。'
        ToastMessage.instance.open('danger', message)
      }
    }
  }
}
