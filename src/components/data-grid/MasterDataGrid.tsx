import { CellHeader } from '@/components/data-grid/CellHeader'
import { MasterDataCell } from '@/components/data-grid/MasterDataCell'
import { SubEditorPanel } from '@/components/data-grid/SubEditorPanel'
import { Button } from '@/components/inputs/Button'
import { enumerationAccessor } from '@/systems/accessors/enumeration-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { DataClassification, DataKind, DataKindExtension } from '@/systems/defines'
import { DataStructColumnRaw, MasterRecord } from '@/systems/types'
import { defaultValueFor } from '@/utilities/data-grid'
import { MJ, MJCustomElement, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<MasterDataGrid> {
  columns: DataStructColumnRaw[]
  data: MasterRecord[]
  schemaPanelRef?: Reference<SubEditorPanel>
}

/**
 * マスターデータ汎用グリッド
 */
export class MasterDataGrid extends MJCustomElement<Props>()(HTMLDivElement) {
  private static readonly headerHeight = 32
  private static readonly rowHeight = 32
  private static readonly overscanRowCount = 10
  private static readonly columnMinWidth = 160
  private static readonly rowNumberColumnWidth = 45
  private static readonly actionColumnWidth = 60
  private static readonly cellHorizontalPadding = 16
  private static readonly selectorIconWidth = 20
  private static readonly gapWidth = 4

  private rows: MasterRecord[] = []
  private columnWidths: number[] = []
  private textMeasureContext?: CanvasRenderingContext2D
  private renderAnimationFrame?: number
  private renderedStartIndex = -1
  private renderedEndIndex = -1
  private resizeObserver?: ResizeObserver

  private readonly onScroll = () => this.scheduleRender()

  async initialize({ data }: Props) {
    this.rows = JSON.parse(JSON.stringify(data))
    this.columnWidths = []
  }

  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
    this.addEventListener('scroll', this.onScroll)
    this.resizeObserver = new ResizeObserver(() => this.scheduleRender())
    this.resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this.removeEventListener('scroll', this.onScroll)
    this.resizeObserver?.disconnect()
    if (this.renderAnimationFrame != null) {
      cancelAnimationFrame(this.renderAnimationFrame)
    }
  }

  createNode({ columns, schemaPanelRef }: Props) {
    const columnWidths = this.getColumnWidths(columns)
    const gridTemplateColumns = [`${MasterDataGrid.rowNumberColumnWidth}px`, ...columnWidths.map((width) => `${width}px`), `${MasterDataGrid.actionColumnWidth}px`].join(' ')
    const gridMinWidth = MasterDataGrid.rowNumberColumnWidth + columnWidths.reduce((total, width) => total + width, 0) + MasterDataGrid.actionColumnWidth
    const { startIndex, endIndex } = this.getVisibleRange()
    const visibleRows = this.rows.slice(startIndex, endIndex)
    this.renderedStartIndex = startIndex
    this.renderedEndIndex = endIndex
    const gridStyle = {
      gridTemplateColumns,
      minWidth: `${gridMinWidth}px`,
    }
    return (
      <div class="relative" style={{ height: `${MasterDataGrid.headerHeight + this.rows.length * MasterDataGrid.rowHeight}px`, minWidth: `${gridMinWidth}px` }}>
        {/** ヘッダー */}
        <div class="sticky top-0 z-10 grid" style={{ ...gridStyle, gridAutoRows: `${MasterDataGrid.headerHeight}px` }}>
          <CellHeader className="justify-center">#</CellHeader>
          {columns.map((column) => (
            <CellHeader>
              <span class="truncate" title={column.label || column.name}>
                {column.label || column.name}
              </span>
              {column.description && <span class="icon-[ic--baseline-comment] text-lg text-emerald-400" title={column.description}></span>}
            </CellHeader>
          ))}
          <CellHeader className="justify-center">操作</CellHeader>
        </div>

        {/** 表示範囲の行のみ描画 */}
        {this.rows.length > 0 ? (
          <div
            class="absolute inset-x-0 grid"
            style={{
              ...gridStyle,
              top: `${MasterDataGrid.headerHeight + startIndex * MasterDataGrid.rowHeight}px`,
              gridAutoRows: `${MasterDataGrid.rowHeight}px`,
            }}
          >
            {visibleRows.map((row, rowOffset) => {
              const index = startIndex + rowOffset
              return (
                <>
                  <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
                  {columns.map((column) => (
                    <MasterDataCell column={column} value={row[column.name]} rowIndex={index} schemaPanelRef={schemaPanelRef} />
                  ))}
                  <div class="data-grid-cell flex flex-[0_0_60px] items-center justify-center" data-row-index={index}>
                    <Button variant="danger" size="none" onclick={() => this.deleteRow(index)} className="flex h-6 w-7 items-center justify-center">
                      <span class="icon-[ic--baseline-delete-forever] text-xl"></span>
                    </Button>
                  </div>
                </>
              )
            })}
          </div>
        ) : (
          <div class="absolute top-8 left-0 bg-zinc-800 px-2 py-3 text-sm text-zinc-500" style={{ minWidth: `${gridMinWidth}px` }}>
            行がありません。「+ 行追加」で追加してください。
          </div>
        )}
      </div>
    )
  }

  async addRow() {
    const values: MasterRecord = []
    const { columns } = this.props
    for (let i = 0; i < columns.length; i++) {
      values[i] = defaultValueFor(columns[i])
    }
    this.rows.push(values)
    this.columnWidths = []
    await this.render()
  }

  async deleteRow(index: number) {
    this.rows.splice(index, 1)
    this.columnWidths = []
    await this.render()
  }

  private getColumnWidths(columns: DataStructColumnRaw[]) {
    if (this.columnWidths.length !== columns.length) {
      this.columnWidths = columns.map((column) => this.calculateColumnWidth(column))
    }
    return this.columnWidths
  }

  private calculateColumnWidth(column: DataStructColumnRaw) {
    const headerText = column.label || column.name
    let widestTextWidth = this.measureTextWidth(headerText)
    for (const row of this.rows) {
      const cellText = this.getCellText(column, row[column.name])
      widestTextWidth = Math.max(widestTextWidth, this.measureTextWidth(cellText))
    }

    const columnIconWidth = this.getColumnIconWidth(column)
    const width = Math.ceil(widestTextWidth) + MasterDataGrid.cellHorizontalPadding + columnIconWidth
    return Math.max(MasterDataGrid.columnMinWidth, width)
  }

  private measureTextWidth(text: string) {
    if (!this.textMeasureContext) {
      const canvas = document.createElement('canvas')
      this.textMeasureContext = canvas.getContext('2d') ?? undefined
    }
    if (this.textMeasureContext) {
      const font = getComputedStyle(this).font
      this.textMeasureContext.font = font || '600 16px monospace'
      return this.textMeasureContext.measureText(text).width
    }
    return text.length * 8.5
  }

  private getCellText(column: DataStructColumnRaw, value: unknown) {
    const { type } = column
    if (type.classification === DataClassification.Schema || type.extension === DataKindExtension.Array) {
      return `${Array.isArray(value) ? value.length : 0}件`
    }
    if (type.classification === DataClassification.Enumeration) {
      const enumeration = enumerationAccessor.findName(type.typeName)
      return enumeration?.items.find((item) => value === item.value)?.description ?? ''
    }
    if (type.classification === DataClassification.RelationID) {
      const relationTable = masterDataAccessor.get(type.typeName)
      if (relationTable) {
        const idColumnName = relationTable.columns.find((item) => item.type.classification === DataClassification.ID)?.name ?? ''
        const labelColumnName = relationTable.columns.find((item) => item.type.classification === DataClassification.Label)?.name ?? ''
        const item = relationTable.data.find((row) => `${row[idColumnName] ?? ''}` === value)
        if (item) {
          return `${item[labelColumnName] ?? item[idColumnName]}`
        }
        if (value) {
          return `${value}`
        }
        return type.extension === DataKindExtension.Optional ? '(未指定)' : '(未設定)'
      }
      return ''
    }
    if (type.typeName === DataKind.Bool) {
      return ''
    }
    return `${value}`
  }

  private getColumnIconWidth(column: DataStructColumnRaw) {
    if (column.type.classification === DataClassification.Enumeration || column.type.classification === DataClassification.RelationID) {
      return MasterDataGrid.selectorIconWidth + MasterDataGrid.gapWidth
    }
    if (column.description) {
      return MasterDataGrid.selectorIconWidth + MasterDataGrid.gapWidth
    }
    return 0
  }

  private getVisibleRange() {
    const firstVisibleIndex = Math.floor(this.scrollTop / MasterDataGrid.rowHeight)
    const visibleRowCount = Math.ceil(this.clientHeight / MasterDataGrid.rowHeight)
    const startIndex = Math.max(0, firstVisibleIndex - MasterDataGrid.overscanRowCount)
    const endIndex = Math.min(this.rows.length, firstVisibleIndex + visibleRowCount + MasterDataGrid.overscanRowCount)
    return { startIndex, endIndex }
  }

  private scheduleRender() {
    const { startIndex, endIndex } = this.getVisibleRange()
    if (startIndex !== this.renderedStartIndex || endIndex !== this.renderedEndIndex) {
      this.requestRender()
    }
  }

  private requestRender() {
    if (this.renderAnimationFrame == null) {
      this.renderAnimationFrame = requestAnimationFrame(async () => {
        this.renderAnimationFrame = undefined
        const { startIndex, endIndex } = this.getVisibleRange()
        if (startIndex !== this.renderedStartIndex || endIndex !== this.renderedEndIndex) {
          await this.render()
        }
      })
    }
  }
}
