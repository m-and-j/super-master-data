import { OutputKind } from '@/systems/defines'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputProjectOtherRaw, OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { deepCopy } from '@/utilities/helper'

export class OutputProject {
  private name = ''
  private description = ''
  private codeExtension = ''
  private masterDataPath = ''
  private masterDataTargets = new Set<string>()
  private constantsDataPath = ''
  private constantsDataTargets = new Set<string>()
  private entity: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private schema: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private enumeration: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private constant: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private others: OutputProjectOtherRaw[] = []

  setRaw(raw?: OutputProjectRaw) {
    if (raw) {
      const copy = deepCopy(raw)
      this.name = copy.name
      this.description = copy.description
      this.codeExtension = copy.codeExtension
      this.masterDataPath = copy.masterData.path
      this.masterDataTargets = new Set(copy.masterData.targets)
      this.constantsDataPath = copy.constantsData.path
      this.constantsDataTargets = new Set(copy.constantsData.targets)
      this.entity = copy.entity
      this.schema = copy.schema
      this.enumeration = copy.enumeration
      this.constant = copy.constant
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

  getConstantsDataPath() {
    return this.constantsDataPath
  }

  hasConstantsDataTarget(name: string) {
    return this.constantsDataTargets.has(name)
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

  getConstant() {
    return this.constant
  }

  getOthers() {
    return this.others
  }

  toRaw(): OutputProjectRaw {
    const masterDataTargets = Array.from(this.masterDataTargets)
      .filter((name) => masterDataAccessor.getNames().includes(name))
      .sort()
    const constantsDataTargets = Array.from(this.constantsDataTargets).sort()
    return {
      name: this.name,
      description: this.description,
      codeExtension: this.codeExtension,
      masterData: { path: this.masterDataPath, targets: masterDataTargets },
      constantsData: { path: this.constantsDataPath, targets: constantsDataTargets },
      entity: this.entity,
      schema: this.schema,
      enumeration: this.enumeration,
      constant: this.constant,
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

  changeConstantsDataPath(e: Event) {
    this.constantsDataPath = (e.target as HTMLInputElement).value
  }

  changeConstantsDataTarget(e: Event) {
    const checkbox = e.target as HTMLInputElement
    if (checkbox.checked) {
      this.constantsDataTargets.add(checkbox.value)
    } else {
      this.constantsDataTargets.delete(checkbox.value)
    }
  }

  allCheckMasterDataTargets() {
    masterDataAccessor.getNames().forEach((name) => this.masterDataTargets.add(name))
  }

  allClearMasterDataTargets() {
    this.masterDataTargets.clear()
  }

  addOther() {
    this.others.push({ name: '新規出力', kind: OutputKind.Single, path: '', sourceCodeTemplate: '' })
    return this.others.length - 1
  }

  removeOther(index: number) {
    this.others.splice(index, 1)
  }
}
