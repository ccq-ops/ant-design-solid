import { createRoot, createSignal } from 'solid-js'
import { canUseDom } from '../shared/portal'
import { mountNotificationHolder } from './holder'
import type {
  NotificationArgs,
  NotificationHandle,
  NotificationInstance,
  NotificationNotice,
  NotificationType,
} from './interface'

let seed = 0
let disposeRoot: (() => void) | undefined
let setNotices:
  | ((
      updater: NotificationNotice[] | ((value: NotificationNotice[]) => NotificationNotice[]),
    ) => NotificationNotice[])
  | undefined
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function ensureHolder() {
  if (setNotices || !canUseDom()) return
  disposeRoot = createRoot((dispose) => {
    const [notices, nextNotices] = createSignal<NotificationNotice[]>([])
    setNotices = nextNotices
    const unmount = mountNotificationHolder({ notices, close: remove })
    return () => {
      unmount()
      dispose()
    }
  })
}

function remove(key: string) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  setNotices?.((items) => items.filter((item) => item.key !== key))
}

function open(args: NotificationArgs): NotificationHandle {
  ensureHolder()
  const key = args.key ?? `notification-${++seed}`
  const notice: NotificationNotice = { ...args, key, placement: args.placement ?? 'topRight' }

  setNotices?.((items) => {
    const index = items.findIndex((item) => item.key === key)
    if (index === -1) return [...items, notice]

    const next = [...items]
    next[index] = notice
    return next
  })

  const oldTimer = timers.get(key)
  if (oldTimer) clearTimeout(oldTimer)
  timers.delete(key)

  const duration = args.duration ?? 4.5
  if (duration > 0 && canUseDom()) {
    timers.set(
      key,
      setTimeout(() => {
        remove(key)
        args.onClose?.()
      }, duration * 1000),
    )
  }

  return { close: () => remove(key) }
}

function typed(type: NotificationType, args: NotificationArgs) {
  return open({ ...args, type })
}

export const notification: NotificationInstance = {
  open,
  success: (args) => typed('success', args),
  info: (args) => typed('info', args),
  warning: (args) => typed('warning', args),
  error: (args) => typed('error', args),
  destroy: (key?: string) => {
    if (key) {
      remove(key)
      return
    }

    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    setNotices?.([])
    disposeRoot?.()
    disposeRoot = undefined
    setNotices = undefined
  },
}
