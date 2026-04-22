import { MJPage } from '@mj/router'

export default class Home extends MJPage {
  async beforeRender() {}

  createNode() {
    return (
      <div class="mt-10 flex flex-col items-center">
        <h1>Home</h1>
      </div>
    )
  }
}
