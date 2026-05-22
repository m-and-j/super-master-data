import MasterDataGrid from '@/components/data-grid/MasterDataGrid'
import Button from '@/components/inputs/Button'
import { DataClassification } from '@/systems/define'
import preferences from '@/systems/preferences'
import { DataObjectColumn, MasterRecord } from '@/systems/types'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<SubEditorPanel> {
  openCallback?: () => void
  closeCallback?: () => void
}

/**
 * データ編集用分割パネル(右側に出る分割パネル)
 */
export default class SubEditorPanel extends MJCustomElement<Props>()(HTMLDivElement) {
  private column?: DataObjectColumn
  private data: MasterRecord[] = []
  private grid: Reference<MasterDataGrid> = ref()

  connectedCallback() {
    this.addClassName('flex h-full flex-col border-l border-zinc-500 bg-zinc-900')
  }

  createNode() {
    if (this.column) {
      return (
        <>
          {/** ヘッダー */}
          <div class="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
            <div class="flex-auto truncate font-semibold">
              <span title={this.column?.name}>{this.column?.label}</span>
            </div>
            <Button variant="success" size="sm" onclick={() => this.grid.value?.addRow()}>
              <span class="icon-[ic--baseline-add] text-lg"></span>
              行追加
            </Button>
            <Button variant="secondary" size="sm" onclick={() => this.close()}>
              <span class="icon-[ic--baseline-close] text-lg"></span>
              閉じる
            </Button>
          </div>

          {/** 本体 */}
          <div class="scrollbar flex-auto overflow-auto">{this.renderContent()}</div>
        </>
      )
    }
  }

  renderContent() {
    if (this.column) {
      const { type } = this.column
      switch (type.classification) {
        case DataClassification.Schema: {
          const projectInfo = preferences.getProjectInfo()
          const schema = projectInfo.schemas.find((s) => s.name === type.typeName)
          if (schema) {
            return <MasterDataGrid ref={this.grid} columns={schema.columns} data={this.data} />
          } else {
            return <div class="flex h-full items-center justify-center text-rose-300">スキーマ「{this.column?.type.typeName}」が見つかりません。</div>
          }
        }

        case DataClassification.RelationID: {
          // TODO: ID参照の配列設定
          return <></>
        }
      }
    }
    return null
  }

  async open(column: DataObjectColumn, data: any) {
    this.column = column
    this.data = data
    this.classList.remove('hidden')
    this.props.openCallback?.()
    await this.render()
  }

  async close() {
    this.classList.add('hidden')
    this.props.closeCallback?.()
  }
}
