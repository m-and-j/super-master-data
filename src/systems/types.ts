import { ConstantKindType, DataClassificationType, DataKindExtensionType, OutputKindType } from '@/systems/define'

export interface ProjectInfoRaw {
  name: string
  description: string
  schemas: DataStructRaw[]
  enumerations: EnumerationStructRaw[]
  outputs: OutputProjectRaw[]
}

export interface TableRaw {
  name: string
  description: string
  columns: DataStructColumnRaw[]
  data: MasterRecord[]
}

export type MasterRecord = Record<string, any>

export interface DataStructRaw {
  name: string
  description: string
  columns: DataStructColumnRaw[]
}

export interface DataStructColumnRaw {
  name: string
  label: string
  type: DataStructColumnTypeRaw
  description: string
}

export interface DataStructColumnTypeRaw {
  classification: DataClassificationType
  extension: DataKindExtensionType
  typeName: string
}

export type DataStructColumnLabel = 'name' | 'label' | 'typeClassification' | 'typeName' | 'typeExtension' | 'description'

export interface EnumerationStructRaw {
  name: string
  description: string
  items: EnumerationStructItemRaw[]
}

export interface EnumerationStructItemRaw {
  label: string
  value: number
  description: string
}

export interface ConstantGroupRaw {
  name: string
  description: string
  items: ConstantGroupItemRaw[]
}

export type ConstantValue = number | string | number[] | string[]

export interface ConstantGroupItemRaw {
  name: string
  label: string
  type: ConstantKindType
  value: ConstantValue
}

export interface OutputProjectRaw {
  name: string
  description: string
  codeExtension: string
  masterData: OutputProjectMasterDataRaw
  constantsData: OutputProjectMasterDataRaw
  entity: OutputProjectStandardRaw
  schema: OutputProjectStandardRaw
  enumeration: OutputProjectStandardRaw
  constant: OutputProjectStandardRaw
  others: OutputProjectOtherRaw[]
}

export interface OutputProjectMasterDataRaw {
  path: string
  targets: string[]
}

export interface OutputProjectStandardRaw {
  path: string
  fileNameTemplate: string
  sourceCodeTemplate: string
}

export interface OutputProjectOtherRaw {
  name: string
  kind: OutputKindType
  path: string
  fileNameTemplate?: string
  sourceCodeTemplate: string
}
