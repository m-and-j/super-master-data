import { OutputBuilderEntity } from '@/systems/output-distributor/output-builder-entity'
import { OutputBuilderEnumeration } from '@/systems/output-distributor/output-builder-enumeration'
import { OutputBuilderMasterData } from '@/systems/output-distributor/output-builder-master-data'
import { OutputBuilderOther } from '@/systems/output-distributor/output-builder-other'
import { OutputBuilderSchema } from '@/systems/output-distributor/output-builder-schema'
import { OutputProjectRaw } from '@/systems/types'

export async function outputDistribution(outputProject: OutputProjectRaw) {
  const outputs = []
  outputs.push(await OutputBuilderMasterData.create(outputProject))
  outputs.push(await OutputBuilderEntity.create(outputProject))
  outputs.push(await OutputBuilderSchema.create(outputProject))
  outputs.push(await OutputBuilderEnumeration.create(outputProject))
  for (const other of outputProject.others) {
    outputs.push(await OutputBuilderOther.create(outputProject, other))
  }
  for (const output of outputs) {
    await output.write()
  }
}
