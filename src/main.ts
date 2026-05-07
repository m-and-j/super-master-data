import AppContent from '@/AppContent'
import preferences from '@/systems/preferences'

preferences.load().then(async (result) => {
  if (result || location.pathname === '/') {
    document.body.appendChild(await new AppContent().render())
  } else {
    window.location.href = '/'
  }
})
