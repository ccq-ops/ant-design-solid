import { createRoot, createSignal } from 'solid-js'
import { canUseDom } from '../shared/portal'
import { mountNotificationHolder } from './holder'
import type {
  NotificationArgs,
  NotificationConfig,
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
const timers = new Map<string, TimerState>()
let globalConfig: NotificationConfig = {}

interface TimerState {
  timeoutId?: ReturnType<typeof setTimeout>
  durationMs: number
  remainingMs: number
  startedAt: number
  paused: boolean
}

function ensureHolder() {
  if (setNotices || !canUseDom()) return
  disposeRoot = createRoot((dispose) => {
    const [notices, nextNotices] = createSignal<NotificationNotice[]>([])
    setNotices = nextNotices
    const unmount = mountNotificationHolder({
      notices,
      close: closeNotice,
      pause: pauseNotice,
      resume: resumeNotice,
      config: globalConfig,
    })
    return () => {
      unmount()
      dispose()
    }
  })
}

function clearTimer(key: string) {
  const timer = timers.get(key)
  if (timer?.timeoutId) clearTimeout(timer.timeoutId)
  timers.delete(key)
}

function remove(key: string) {
  clearTimer(key)
  setNotices?.((items) => items.filter((item) => item.key !== key))
}

function closeNotice(key: string) {
  let closing: NotificationNotice | undefined
  setNotices?.((items) => {
    closing = items.find((item) => item.key === key)
    return items.filter((item) => item.key !== key)
  })
  clearTimer(key)
  closing?.onClose?.()
  if (typeof closing?.closable === 'object') closing.closable.onClose?.()
}

function startTimer(key: string, durationMs: number, remainingMs = durationMs) {
  if (!canUseDom()) return
  const state: TimerState = {
    durationMs,
    remainingMs,
    startedAt: Date.now(),
    paused: false,
  }
  state.timeoutId = setTimeout(() => closeNotice(key), remainingMs)
  timers.set(key, state)
}

function pauseNotice(key: string) {
  const state = timers.get(key)
  if (!state || state.paused) return
  if (state.timeoutId) clearTimeout(state.timeoutId)
  state.remainingMs = Math.max(0, state.remainingMs - (Date.now() - state.startedAt))
  state.paused = true
  state.timeoutId = undefined
}

function resumeNotice(key: string) {
  const state = timers.get(key)
  if (!state || !state.paused) return
  state.startedAt = Date.now()
  state.paused = false
  state.timeoutId = setTimeout(() => closeNotice(key), state.remainingMs)
}

function open(args: NotificationArgs): NotificationHandle {
  ensureHolder()
  const key = args.key ?? `notification-${++seed}`
  const duration = args.duration ?? globalConfig.duration ?? 4.5
  const notice: NotificationNotice = {
    ...args,
    duration,
    closeIcon: args.closeIcon ?? globalConfig.closeIcon,
    showProgress: args.showProgress ?? globalConfig.showProgress,
    pauseOnHover: args.pauseOnHover ?? globalConfig.pauseOnHover ?? true,
    key,
    placement: args.placement ?? globalConfig.placement ?? 'topRight',
  }

  setNotices?.((items) => {
    const index = items.findIndex((item) => item.key === key)
    let next: NotificationNotice[]
    if (index === -1) {
      next = [...items, notice]
    } else {
      next = [...items]
      next[index] = notice
    }

    const maxCount = globalConfig.maxCount
    if (maxCount && maxCount > 0 && next.length > maxCount) {
      const dropped = next.slice(0, next.length - maxCount)
      dropped.forEach((item) => clearTimer(item.key))
      next = next.slice(next.length - maxCount)
    }

    return next
  })

  clearTimer(key)

  if (duration !== false && duration > 0 && canUseDom()) {
    startTimer(key, duration * 1000)
  }

  return { close: () => closeNotice(key) }
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

    timers.forEach((timer) => {
      if (timer.timeoutId) clearTimeout(timer.timeoutId)
    })
    timers.clear()
    setNotices?.([])
    disposeRoot?.()
    disposeRoot = undefined
    setNotices = undefined
    globalConfig = {}
  },
  config: (options) => {
    globalConfig = { ...globalConfig, ...options }
    if (setNotices) {
      timers.forEach((timer) => {
        if (timer.timeoutId) clearTimeout(timer.timeoutId)
      })
      timers.clear()
      setNotices([])
      disposeRoot?.()
      disposeRoot = undefined
      setNotices = undefined
    }
  },
}
