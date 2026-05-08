import Button from '@/components/inputs/Button'
import ModalBase from '@/components/modals/ModalBase'
import { DataClassification, DataKind } from '@/systems/define'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { DataObjectColumn, Table } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

type Props = MJ.CEProps<ScalarArrayModal>

/**
 * scalar / enum 配列カラム用のミニモーダル。
 *
 * セルに紐づく配列(`values[column.name]`)を直接 mutate する。
 * close 時に optional な onClose コールバックを呼んで親側を再描画してもらう。
 */
export default class ScalarArrayModal extends MJCustomElement<Props>()(ModalBase, 'div') {
  static get instance() {
    return document.querySelector<ScalarArrayModal>(ScalarArrayModal.domName)
  }

  private targetValues?: Record<string, any>
  private targetColumn?: DataObjectColumn
  private relationTable?: Table
  private onCloseCallback?: () => void

  async initialize() {
    const { type } = this.targetColumn ?? {}
    if (type?.classification === DataClassification.RelationID) {
      this.relationTable = await masterData.read(type.typeName)
    }
  }

  createNode() {
    if (!this.targetColumn || !this.targetValues) {
      return this.createModal(<div class="w-[400px] p-5">未設定</div>)
    }
    const column = this.targetColumn
    const values = this.targetValues
    const arr = (values[column.name] ?? []) as any[]
    if (!Array.isArray(values[column.name])) {
      values[column.name] = arr
    }
    return this.createModal(
      <div class="flex max-h-[80vh] w-[520px] flex-col p-5">
        <div class="mb-3 flex items-center">
          <h3 class="flex-auto font-semibold">「{column.label || column.name}」を編集</h3>
          <Button variant="secondary" size="sm" onclick={() => this.close()}>
            閉じる
          </Button>
        </div>
        <div class="mb-2 text-xs text-zinc-400">{arr.length} 件</div>
        <div class="scrollbar flex flex-auto flex-col gap-1 overflow-y-auto pr-1">
          {arr.map((item, index) => (
            <div class="flex items-center gap-2">
              <div class="flex-[0_0_30px] text-right text-sm text-zinc-400">{index + 1}.</div>
              <div class="flex-auto">{this.renderItemEditor(column, arr, index, item)}</div>
              <Button variant="danger" size="sm" onclick={() => this.deleteItem(index)}>
                <span class="icon-[ic--baseline-delete-forever] text-lg"></span>
              </Button>
            </div>
          ))}
        </div>
        <div class="mt-3">
          <Button variant="success" size="sm" onclick={() => this.addItem()}>
            <span class="icon-[ic--baseline-add] text-lg"></span>
            項目追加
          </Button>
        </div>
      </div>,
    )
  }

  private renderItemEditor(column: DataObjectColumn, arr: any[], index: number, current: any) {
    const baseClass = 'w-full bg-zinc-800 border border-zinc-500 rounded px-2 py-1 outline-none focus:border-blue-500'

    if (column.type.classification === DataClassification.Enumeration) {
      const enumeration = preferences.getProjectInfo().enumerations.find((e) => e.name === column.type.typeName)
      return (
        <select
          class={baseClass}
          onchange={(e) => {
            arr[index] = Number((e.target as HTMLSelectElement).value)
          }}
        >
          {enumeration ? (
            enumeration.items.map((item) => (
              <option value={String(item.value)} selected={current === item.value}>
                {item.label}
              </option>
            ))
          ) : (
            <option value="" selected>
              (列挙型未定義)
            </option>
          )}
        </select>
      )
    }

    if (column.type.classification === DataClassification.RelationID) {
      const idColumn = this.relationTable?.columns.find((c) => c.type.classification === DataClassification.ID)
      const rows = this.relationTable?.data ?? []
      const cur = String(current ?? '')
      return (
        <select
          class={baseClass}
          onchange={(e) => {
            arr[index] = (e.target as HTMLSelectElement).value
          }}
        >
          <option value="" selected={cur === ''}>
            (未選択)
          </option>
          {rows.map((row) => {
            const v = `${row.values[idColumn?.name ?? ''] ?? ''}`
            return (
              <option value={v} selected={cur === v}>
                {v}
              </option>
            )
          })}
        </select>
      )
    }

    // scalar
    const typeName = column.type.typeName
    if (typeName === DataKind.Bool) {
      return (
        <input
          type="checkbox"
          checked={Boolean(current)}
          onchange={(e) => {
            arr[index] = (e.target as HTMLInputElement).checked
          }}
        />
      )
    }
    if (typeName === DataKind.Int || typeName === DataKind.Float || typeName === DataKind.Double) {
      return (
        <input
          type="number"
          value={current ?? 0}
          class={baseClass}
          onchange={(e) => {
            const v = (e.target as HTMLInputElement).value
            arr[index] = v === '' ? 0 : Number(v)
          }}
        />
      )
    }
    if (typeName === DataKind.Date || typeName === DataKind.Time || typeName === DataKind.Datetime) {
      const inputType = typeName === DataKind.Datetime ? 'datetime-local' : typeName
      return (
        <input
          type={inputType}
          value={current ?? ''}
          class={baseClass}
          onchange={(e) => {
            arr[index] = (e.target as HTMLInputElement).value
          }}
        />
      )
    }
    return (
      <input
        type="text"
        value={current ?? ''}
        class={baseClass}
        onchange={(e) => {
          arr[index] = (e.target as HTMLInputElement).value
        }}
      />
    )
  }

  async open(values: Record<string, any>, column: DataObjectColumn, onClose?: () => void) {
    this.targetValues = values
    this.targetColumn = column
    this.onCloseCallback = onClose
    if (!Array.isArray(values[column.name])) {
      values[column.name] = []
    }
    await this.render()
    super.open()
  }

  close() {
    super.close()
    const cb = this.onCloseCallback
    this.onCloseCallback = undefined
    this.targetValues = undefined
    this.targetColumn = undefined
    if (cb) {
      cb()
    }
  }

  private async addItem() {
    if (this.targetColumn && this.targetValues) {
      const arr = this.targetValues[this.targetColumn.name] as any[]
      arr.push(this.defaultItemValue(this.targetColumn))
      await this.render()
    }
  }

  private async deleteItem(index: number) {
    if (this.targetColumn && this.targetValues) {
      const arr = this.targetValues[this.targetColumn.name] as any[]
      arr.splice(index, 1)
      await this.render()
    }
  }

  private defaultItemValue(column: DataObjectColumn): any {
    if (column.type.classification === DataClassification.Enumeration) {
      const enumeration = preferences.getProjectInfo().enumerations.find((e) => e.name === column.type.typeName)
      return enumeration?.items[0]?.value ?? 0
    }
    if (column.type.classification === DataClassification.RelationID) {
      return ''
    }
    switch (column.type.typeName) {
      case DataKind.Bool:
        return false
      case DataKind.Int:
      case DataKind.Float:
      case DataKind.Double:
        return 0
      default:
        return ''
    }
  }
}
