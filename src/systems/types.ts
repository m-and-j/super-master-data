import { DataClassificationType, DataKindExtensionType, OutputKind, OutputKindType } from '@/systems/define'
import { deepCopy } from '@/utilities/helper'

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

export interface OutputProjectRaw {
  name: string
  description: string
  codeExtension: string
  masterData: OutputProjectMasterDataRaw
  entity: OutputProjectStandardRaw
  schema: OutputProjectStandardRaw
  enumeration: OutputProjectStandardRaw
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

export class OutputProject {
  private name = ''
  private description = ''
  private codeExtension = ''
  private masterDataPath = ''
  private masterDataTargets = new Set<string>()
  private entity: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private schema: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private enumeration: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private others: OutputProjectOtherRaw[] = []

  setRaw(raw?: OutputProjectRaw) {
    if (raw) {
      const copy = deepCopy(raw)
      this.name = copy.name
      this.description = copy.description
      this.codeExtension = copy.codeExtension
      this.masterDataPath = copy.masterData.path
      this.masterDataTargets = new Set(copy.masterData.targets)
      this.entity = copy.entity
      this.schema = copy.schema
      this.enumeration = copy.enumeration
      this.others = copy.others
    }
  }

  getName() {
    return this.name
  }

  getDescription() {
    return this.description
  }

  getCodeExtension() {
    return this.codeExtension
  }

  getMasterDataPath() {
    return this.masterDataPath
  }

  hasMasterDataTarget(name: string) {
    return this.masterDataTargets.has(name)
  }

  getEntity() {
    return this.entity
  }

  getSchema() {
    return this.schema
  }

  getEnumeration() {
    return this.enumeration
  }

  getOthers() {
    return this.others
  }

  toRaw(): OutputProjectRaw {
    return {
      name: this.name,
      description: this.description,
      codeExtension: this.codeExtension,
      masterData: { path: this.masterDataPath, targets: Array.from(this.masterDataTargets) },
      entity: this.entity,
      schema: this.schema,
      enumeration: this.enumeration,
      others: this.others,
    }
  }

  changeName(e: Event) {
    this.name = (e.target as HTMLInputElement).value
  }

  changeDescription(e: Event) {
    this.description = (e.target as HTMLInputElement).value
  }

  changeCodeExtension(e: Event) {
    this.codeExtension = (e.target as HTMLInputElement).value
  }

  changeMasterDataPath(e: Event) {
    this.masterDataPath = (e.target as HTMLInputElement).value
  }

  changeMasterDataTarget(e: Event) {
    const checkbox = e.target as HTMLInputElement
    if (checkbox.checked) {
      this.masterDataTargets.add(checkbox.value)
    } else {
      this.masterDataTargets.delete(checkbox.value)
    }
  }

  addOther() {
    this.others.push({ name: '新規出力', kind: OutputKind.Single, path: '', sourceCodeTemplate: '' })
    return this.others.length - 1
  }

  removeOther(index: number) {
    this.others.splice(index, 1)
  }
}
