import { DataClassificationType } from '@/systems/define'

export interface ProjectInfo {
  name: string
  description: string
  tables: DataObject[]
  schemas: DataObject[]
  enumerations: EnumerationObject[]
  outputs: OutputProject[]
}

export interface DataObject {
  uuid: string
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
  uuid: string
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
  uuid: string
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
