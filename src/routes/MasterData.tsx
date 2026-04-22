import { MJPage } from '@mj/router'

export default class MasterData extends MJPage {
  async beforeRender() {}

  createNode() {
    return (
      <div class="mt-10 flex flex-col items-center">
        <h1>マスターデータ</h1>
      </div>
    )
  }
}
