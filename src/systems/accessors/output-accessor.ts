import { AccessorBase } from '@/systems/accessors/accessor-base'
import { ProjectFolder } from '@/systems/defines'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { ChangeNameInfo, OutputProjectOtherRaw, OutputProjectRaw } from '@/systems/types'
import { arrayRemove, arrayReplace } from '@/utilities/helper-collection'

class OutputAccessor extends AccessorBase<OutputProjectRaw> {
  constructor() {
    super('Outputs', ProjectFolder.Outputs)
  }

  async write(output: OutputProjectRaw, oldName?: string) {
    // JSONパラメータ整列のためのデータ再構築
    const { uuid, name, description, codeExtension, masterData, masterList, masterConstants, entity, schema, enumeration, constant } = output
    const paths = [masterData.path, masterList.path, masterConstants.path, entity.path, schema.path, enumeration.path, constant.path]
    const others: OutputProjectOtherRaw[] = []
    for (const { name, kind, path, fileNameTemplate, sourceCodeTemplate } of output.others) {
      others.push({ name, kind, path, fileNameTemplate, sourceCodeTemplate })
      paths.push(path)
    }
    if (paths.length !== new Set(paths).size) {
      throw new Error('重複する出力先があります')
    }
    await super.write(
      {
        uuid,
        name,
        description,
        codeExtension,
        masterData: {
          path: masterData.path,
          targets: masterData.targets.sort(),
        },
        masterList: {
          path: masterList.path,
          targets: masterList.targets.sort(),
        },
        masterConstants: {
          path: masterConstants.path,
          targets: masterConstants.targets.sort(),
        },
        entity: {
          path: entity.path,
          fileNameTemplate: entity.fileNameTemplate,
          sourceCodeTemplate: entity.sourceCodeTemplate,
        },
        schema: {
          path: schema.path,
          fileNameTemplate: schema.fileNameTemplate,
          sourceCodeTemplate: schema.sourceCodeTemplate,
        },
        enumeration: {
          path: enumeration.path,
          fileNameTemplate: enumeration.fileNameTemplate,
          sourceCodeTemplate: enumeration.sourceCodeTemplate,
        },
        constant: {
          path: constant.path,
          fileNameTemplate: constant.fileNameTemplate,
          sourceCodeTemplate: constant.sourceCodeTemplate,
        },
        others,
      },
      oldName,
    )
  }

  async remove(outputRaw: OutputProjectRaw) {
    const outputProject = new OutputProject(outputRaw)
    outputProject.clearBasePath()
    await super.remove(outputRaw)
  }

  /**
   * 対象のデータ名を変更
   */
  async changeName({ table, listStruct, constantGroup }: { table?: ChangeNameInfo; listStruct?: ChangeNameInfo; constantGroup?: ChangeNameInfo }) {
    for (const output of this.contents) {
      arrayReplace(output.masterData.targets, table?.oldName, table?.newName)
      arrayReplace(output.masterList.targets, listStruct?.oldName, listStruct?.newName)
      arrayReplace(output.masterConstants.targets, constantGroup?.oldName, constantGroup?.newName)
      await this.write(output, output.name)
    }
  }

  /**
   * 対象のデータを削除
   */
  async deleteName({ tableName, listStructName, constantGroupName }: { tableName?: string; listStructName?: string; constantGroupName?: string }) {
    for (const output of this.contents) {
      arrayRemove(output.masterData.targets, tableName)
      arrayRemove(output.masterList.targets, listStructName)
      arrayRemove(output.masterConstants.targets, constantGroupName)
      await this.write(output, output.name)
    }
  }
}

export const outputAccessor = new OutputAccessor()
