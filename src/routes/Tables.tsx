import { MJPage } from '@mj/router'

export default class Tables extends MJPage {
  async beforeRender() {}

  createNode() {
    return (
      <div class="mt-10 flex flex-col items-center">
        <h1>テーブル</h1>
      </div>
    )
  }
}
