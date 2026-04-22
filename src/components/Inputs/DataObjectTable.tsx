import CellHeader from '@/components/Inputs/CellHeader'
import DataObjectRow from '@/components/Inputs/DataObjectRow'
import { DataObjectColumn } from '@/systems/types'
import { formatCSS, MJ, MJCustomElementWithProps, Reference } from '@mj/jsx'

interface Props {
  columns?: DataObjectColumn[]
  className?: MJ.ClassProp
  ref?: Reference<DataObjectTable>
}

/**
 * データオブジェクトテーブル
 */
export default class DataObjectTable extends MJCustomElementWithProps<Props>()(HTMLDivElement) {
  private columns: DataObjectColumn[] = []

  /** JSX補完用 */
  constructor(_props: Props) {
    super()
  }

  connectedCallback() {
    const { className } = this.props
    this.className = formatCSS(['flex flex-col gap-[1px] bg-zinc-500 p-[1px]', className])
  }

  async initialize({ columns, ref }: Props) {
    this.columns = Array.from(columns ?? [])
    ref?.set(this)
  }

  createNode() {
    return (
      <>
        <div class="flex gap-[1px]">
          <CellHeader className="flex-[0_0_50px] flex justify-center items-center">
            <span class="icon-[ic--baseline-sort] text-2xl"></span>
          </CellHeader>
          <CellHeader className="flex-[0_0_300px]">項目名</CellHeader>
          <CellHeader className="flex-[0_0_200px]">ラベル</CellHeader>
          <CellHeader className="flex-[0_0_578px]">データ型</CellHeader>
          <CellHeader className="flex-auto">説明</CellHeader>
          <CellHeader className="flex-[0_0_50px]">操作</CellHeader>
        </div>
        {this.columns.map((column, index) => (
          <DataObjectRow index={index} column={column} deleteRow={(idx) => this.deleteRow(idx)} onmousedown={(e, row) => this.mouseDown(e, row)} />
        ))}
      </>
    )
  }

  getColumns() {
    return this.columns
  }

  async addRow() {
    console.log(this.columns)
    this.columns.push({ name: '', label: '', type: { classification: 'scalar', typeName: 'int', array: false, nullable: false }, description: '' })
    await this.render()
  }

  async deleteRow(index: number) {
    this.columns.splice(index, 1)
    await this.render()
  }

  mouseDown(e: MouseEvent, row: HTMLDivElement) {
    e.preventDefault()
    const original = e.currentTarget as HTMLElement
    original.classList.remove('cursor-grab')
    const ghost = row.cloneNode(true) as HTMLElement
    ghost.style.position = 'absolute'
    ghost.style.top = `${row.offsetTop}px`
    ghost.style.left = `${row.offsetLeft}px`
    ghost.style.width = `${row.offsetWidth}px`
    ghost.style.height = `${row.offsetHeight}px`
    row.classList.add('invisible')
    document.body.appendChild(ghost)
    document.body.style.cursor = 'grabbing'
    document.body.classList.add('select-none')

    const mouseMove = (e: MouseEvent) => {
      if (this.offsetTop + ghost.offsetHeight < e.clientY && this.offsetTop + this.offsetHeight > e.clientY) {
        ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`
      }
    }
    document.body.addEventListener('mousemove', mouseMove)
    document.body.addEventListener(
      'mouseup',
      (e) => {
        e.preventDefault()
        original.classList.add('cursor-grab')
        row.classList.remove('invisible')
        document.body.removeEventListener('mousemove', mouseMove)
        document.body.style.cursor = 'default'
        document.body.classList.remove('select-none')
        document.body.removeChild(ghost)
      },
      { once: true },
    )
  }
}
