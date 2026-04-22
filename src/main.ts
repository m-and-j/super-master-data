import AppContent from '@/AppContent'
import preferences from '@/systems/preferences'

preferences.load().then(async () => {
  document.body.appendChild(await new AppContent().render())
})
