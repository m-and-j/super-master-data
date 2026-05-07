import Button from '@/components/inputs/Button'
import MasterDataGrid from '@/components/inputs/MasterDataGrid'
import SchemaPanel from '@/components/inputs/SchemaPanel'
import ScalarArrayModal from '@/components/modals/ScalarArrayModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuMasterData from '@/components/wayFinders/SideMenuMasterData'
import { DataClassification } from '@/systems/define'
import masterData from '@/systems/master-data'
import { DataObjectColumn, Table } from '@/systems/types'
import { formatNumber } from '@/utilities/helper-text'
import { ref, Reference } from '@mj/jsx'
import { MJPage } from '@mj/router'

interface PanelLevel {
  parentValues: Record<string, any>
  columnName: string
  schemaName: string
  isArray: boolean
}

export default class MasterData extends MJPage {
  private panels: PanelLevel[] = []
  private grid: Reference<MasterDataGrid> = ref()
  private targetTable?: Table

  async beforeRender() {
    const { name } = this.params
    this.targetTable = await masterData.read(name)
  }

  createNode() {
    const { name } = this.params
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch">
        <SideMenuMasterData currentName={name} />
        <div class="flex flex-auto overflow-x-auto overflow-y-hidden">{this.renderContents()}</div>
      </div>
    )
  }

  private renderContents() {
    if (this.targetTable) {
      const table = this.targetTable
      const idColumns = table.columns.filter((c) => c.type.classification === DataClassification.ID)
      if (idColumns.length === 1) {
        return (
          <>
            {/** 主グリッド */}
            <div class="flex h-full flex-shrink-0 flex-col">
              <div class="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 p-2">
                <div class="font-semibold">{table.name}</div>
                <div class="text-sm text-zinc-400">{formatNumber(table.data.length)} 件</div>
                <div class="flex-auto"></div>
                <Button variant="success" size="sm" onclick={() => this.grid.value?.addRow()}>
                  <span class="icon-[ic--baseline-add] text-lg"></span>
                  行追加
                </Button>
                <Button variant="primary" size="sm" onclick={() => this.save(table)}>
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </Button>
              </div>
              <div class="scrollbar flex-auto overflow-auto p-2">
                <MasterDataGrid
                  ref={this.grid}
                  columns={table.columns}
                  rows={table.data}
                  parentSchemaName={table.name}
                  onOpenSchemaPanel={(parentValues, columnName, schemaName, isArray) => this.openPanel(0, parentValues, columnName, schemaName, isArray)}
                  onOpenScalarArrayModal={(parentValues, column) => this.openScalarArrayModal(parentValues, column)}
                />
              </div>
            </div>

            {/** スキーマ用分割パネル(再帰スタック) */}
            {this.panels.map((panel, level) => (
              <SchemaPanel
                level={level}
                parentValues={panel.parentValues}
                columnName={panel.columnName}
                schemaName={panel.schemaName}
                isArray={panel.isArray}
                onClose={() => this.closePanelsFrom(level)}
                onOpenSchemaPanel={(parentValues, columnName, schemaName, isArray) => this.openPanel(level + 1, parentValues, columnName, schemaName, isArray)}
                onOpenScalarArrayModal={(parentValues, column) => this.openScalarArrayModal(parentValues, column)}
              />
            ))}
          </>
        )
      } else {
        return (
          <div class="flex flex-auto items-center justify-center px-6 text-center text-rose-300">
            <div>
              <div class="mb-2 font-bold">構造に問題があるため編集できません</div>
              <div class="text-sm">
                テーブル「{table.name}」のIDカラムは1つでなければなりません。
                <br />
                現在の ID カラム数: {idColumns.length} 個
              </div>
            </div>
          </div>
        )
      }
    } else {
      return <div class="flex flex-auto items-center justify-center text-zinc-400">左のテーブル一覧から編集対象を選択してください。</div>
    }
  }

  private async openPanel(targetLevel: number, parentValues: Record<string, any>, columnName: string, schemaName: string, isArray: boolean) {
    this.panels.length = targetLevel
    this.panels.push({ parentValues, columnName, schemaName, isArray })
    await this.render()
  }

  private async closePanelsFrom(level: number) {
    this.panels.length = level
    await this.render()
  }

  private openScalarArrayModal(parentValues: Record<string, any>, column: DataObjectColumn) {
    ScalarArrayModal.instance?.open(parentValues, column, () => this.render())
  }

  private async save(table: Table) {
    try {
      await masterData.write(this.cloneRows(table))
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      console.error(e)
      const message = e instanceof Error ? e.message : '保存に失敗しました。'
      ToastMessage.instance.open('danger', message)
    }
  }

  private cloneRows(rows: Table): Table {
    return JSON.parse(JSON.stringify(rows))
  }
}
