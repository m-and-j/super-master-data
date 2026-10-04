import { AppContent } from '@/AppContent'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { NavigationTab } from '@/components/wayFinders/NavigationTab'
import { preferences } from '@/systems/preferences'
import { MJRouter } from '@mj/router'

const appContent = new AppContent()
appContent.render().then((element) => {
  document.body.replaceChildren(element)
  preferences
    .load()
    .then(async () => {
      NavigationTab.instance.render()
      MJRouter.instance.reload()
    })
    .catch((e) => {
      console.error(e)
      if (location.pathname === '/') {
        ConfirmModal.instance?.open('読込みに失敗しました。プロジェクトを開くことができません。')
      } else {
        window.location.href = '/'
      }
    })
})
