import { DataClassificationType } from '@/systems/define'

export interface ProjectInfo {
  name: string
  description: string
  schemas: DataObject[]
  enumerations: EnumerationObject[]
  outputs: OutputProject[]
}

export interface Table {
  name: string
  description: string
  columns: DataObjectColumn[]
  data: MasterRecord[]
}

export type MasterRecord = { [columnName: string]: any }

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

export interface OutputProject {
  name: string
  description: string
  dataPath: string
  codeExtension: string
  entity: OutputItem
  schema: OutputItem
  enumeration: OutputItem
}

export interface OutputItem {
  path: string
  fileNameTemplate: string
  sourceCodeTemplate: string
}
