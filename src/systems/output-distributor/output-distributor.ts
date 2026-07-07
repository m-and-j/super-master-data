import { OutputBuilderConstant } from '@/systems/output-distributor/output-builder-constant'
import { OutputBuilderConstantsData } from '@/systems/output-distributor/output-builder-constants-data'
import { OutputBuilderEntity } from '@/systems/output-distributor/output-builder-entity'
import { OutputBuilderEnumeration } from '@/systems/output-distributor/output-builder-enumeration'
import { OutputBuilderMasterData } from '@/systems/output-distributor/output-builder-master-data'
import { OutputBuilderOther } from '@/systems/output-distributor/output-builder-other'
import { OutputBuilderSchema } from '@/systems/output-distributor/output-builder-schema'
import { OutputProjectRaw } from '@/systems/types'

export async function outputDistribution(outputProject: OutputProjectRaw) {
  const outputs = await Promise.all([
    OutputBuilderMasterData.create(outputProject),
    OutputBuilderConstantsData.create(outputProject),
    OutputBuilderEntity.create(outputProject),
    OutputBuilderSchema.create(outputProject),
    OutputBuilderEnumeration.create(outputProject),
    OutputBuilderConstant.create(outputProject),
    ...outputProject.others.map((other) => OutputBuilderOther.create(outputProject, other)),
  ])
  await Promise.all(outputs.map((output) => output.write()))
}
