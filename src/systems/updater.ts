import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { LoadingMessage } from '@/components/notifications/LoadingMessage'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { getVersion } from '@tauri-apps/api/app'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, Update } from '@tauri-apps/plugin-updater'

/**
 * 現在のアプリバージョンを取得する
 */
export async function getCurrentVersion(): Promise<string> {
  return await getVersion()
}

/**
 * 更新確認 → 更新ありなら確認モーダル → 「今すぐ更新」でダウンロード+再起動
 */
export async function checkUpdate(): Promise<void> {
  try {
    const update = await check()
    if (update) {
      promptUpdate(update)
    } else {
      ToastMessage.instance.open('success', '最新バージョンです。')
    }
  } catch (e) {
    console.error('更新の確認に失敗:', e)
    const message = e instanceof Error ? e.message : String(e)
    ToastMessage.instance.open('danger', `更新の確認に失敗しました。\n${message}`)
  }
}

function promptUpdate(update: Update) {
  const notes = update.body ?? ''
  const message = `新しいバージョン v${update.version} が利用可能です。\n\n${notes}`.trim()
  ConfirmModal.instance?.open(message, {
    headerTitle: 'アップデート',
    positive: {
      label: '今すぐ更新',
      variant: 'primary',
      callback: () => {
        void downloadAndInstall(update)
      },
    },
    negative: {
      label: '後で',
      callback: () => {},
    },
  })
}

async function downloadAndInstall(update: Update) {
  LoadingMessage.instance?.attach()
  try {
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started': {
          console.log(`ダウンロード開始: ${event.data.contentLength ?? 0} bytes`)
          break
        }
        case 'Progress': {
          break
        }
        case 'Finished': {
          console.log('ダウンロード完了')
          break
        }
      }
    })
    await relaunch()
  } catch (e) {
    console.error('更新に失敗:', e)
    const message = e instanceof Error ? e.message : String(e)
    ToastMessage.instance.open('danger', `更新に失敗しました。\n${message}`)
  } finally {
    LoadingMessage.instance?.detach()
  }
}
