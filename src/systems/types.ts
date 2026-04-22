import { DataClassificationType } from '@/systems/define'

export interface ProjectInfo {
  name: string
  description: string
  tables: DataObject[]
  schemas: DataObject[]
  enumerations: EnumerationObject[]
}

export interface DataObject {
  name: string
  description: string
  columns: DataObjectColumn[]
}

export interface DataObjectColumn {
  name: string
  label: string
  type: DataObjectColumnType
  description: string
}

export interface DataObjectColumnType {
  classification: DataClassificationType
  array: boolean
  nullable: boolean
  typeName: string
}

export interface EnumerationObject {
  name: string
  description: string
  items: EnumerationItem[]
}

export interface EnumerationItem {
  label: string
  value: number
  description: string
}
