import { OutputBuilderConstant } from '@/systems/output-distributors/output-builder-constant'
import { OutputBuilderEntity } from '@/systems/output-distributors/output-builder-entity'
import { OutputBuilderEnumeration } from '@/systems/output-distributors/output-builder-enumeration'
import { OutputBuilderMasterConstants } from '@/systems/output-distributors/output-builder-master-constants'
import { OutputBuilderMasterData } from '@/systems/output-distributors/output-builder-master-data'
import { OutputBuilderMasterList } from '@/systems/output-distributors/output-builder-master-list'
import { OutputBuilderOther } from '@/systems/output-distributors/output-builder-other'
import { OutputBuilderSchema } from '@/systems/output-distributors/output-builder-schema'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectRaw } from '@/systems/types'

export async function outputDistribution(outputProjectRaw: OutputProjectRaw) {
  const outputProject = new OutputProject(outputProjectRaw)
  const outputs = await Promise.all([
    OutputBuilderMasterData.create(outputProject),
    OutputBuilderMasterList.create(outputProject),
    OutputBuilderMasterConstants.create(outputProject),
    OutputBuilderEntity.create(outputProject),
    OutputBuilderSchema.create(outputProject),
    OutputBuilderEnumeration.create(outputProject),
    OutputBuilderConstant.create(outputProject),
    ...outputProject.getOthers().map((_, index) => OutputBuilderOther.create(outputProject, index)),
  ])
  await Promise.all(outputs.map((output) => output.write()))
}
