import { createComponent, createRoot, createSignal } from 'solid-js'
import { canUseDom } from '../shared/portal'
import { NotificationHolder, mountNotificationHolder } from './holder'
import type {
  NotificationApi,
  NotificationArgs,
  NotificationConfig,
  NotificationHandle,
  NotificationInstance,
  NotificationKey,
  NotificationNotice,
  NotificationType,
} from './interface'

let seed = 0
let globalConfig: NotificationConfig = {}

interface TimerState {
  timeoutId?: ReturnType<typeof setTimeout>
  durationMs: number
  remainingMs: number
  startedAt: number
  paused: boolean
}

interface NotificationRuntime {
  api: NotificationApi
  dispose: () => void
  holder: () => import('solid-js').JSX.Element
  mount: () => () => void
}

function createNotificationRuntime(getConfig: () => NotificationConfig): NotificationRuntime {
  const [notices, setNotices] = createSignal<NotificationNotice[]>([])
  const timers = new Map<NotificationKey, TimerState>()

  function clearTimer(key: NotificationKey) {
    const timer = timers.get(key)
    if (timer?.timeoutId) clearTimeout(timer.timeoutId)
    timers.delete(key)
  }

  function remove(key: NotificationKey) {
    clearTimer(key)
    setNotices((items) => items.filter((item) => item.key !== key))
  }

  function closeNotice(key: NotificationKey) {
    let closing: NotificationNotice | undefined
    setNotices((items) => {
      closing = items.find((item) => item.key === key)
      return items.filter((item) => item.key !== key)
    })
    clearTimer(key)
    closing?.onClose?.()
    if (closing?.closable && typeof closing.closable === 'object') closing.closable.onClose?.()
  }

  function startTimer(key: NotificationKey, durationMs: number, remainingMs = durationMs) {
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

  function pauseNotice(key: NotificationKey) {
    const state = timers.get(key)
    if (!state || state.paused) return
    if (state.timeoutId) clearTimeout(state.timeoutId)
    state.remainingMs = Math.max(0, state.remainingMs - (Date.now() - state.startedAt))
    state.paused = true
    state.timeoutId = undefined
  }

  function resumeNotice(key: NotificationKey) {
    const state = timers.get(key)
    if (!state || !state.paused) return
    state.startedAt = Date.now()
    state.paused = false
    state.timeoutId = setTimeout(() => closeNotice(key), state.remainingMs)
  }

  function open(args: NotificationArgs): NotificationHandle {
    const config = getConfig()
    const key = args.key ?? `notification-${++seed}`
    const duration = args.duration ?? config.duration ?? 4.5
    const notice: NotificationNotice = {
      ...args,
      props: { ...config.props, ...args.props },
      duration,
      closeIcon: args.closeIcon ?? config.closeIcon,
      closable: args.closable ?? config.closable,
      showProgress: args.showProgress ?? config.showProgress,
      pauseOnHover: args.pauseOnHover ?? config.pauseOnHover ?? true,
      key,
      placement: args.placement ?? config.placement ?? 'topRight',
    }

    setNotices((items) => {
      const index = items.findIndex((item) => item.key === key)
      let next: NotificationNotice[]
      if (index === -1) {
        next = [...items, notice]
      } else {
        next = [...items]
        next[index] = notice
      }

      const maxCount = config.maxCount
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

  function destroy(key?: NotificationKey) {
    if (key !== undefined) {
      remove(key)
      return
    }

    timers.forEach((timer) => {
      if (timer.timeoutId) clearTimeout(timer.timeoutId)
    })
    timers.clear()
    setNotices([])
  }

  const holder = () =>
    createComponent(NotificationHolder, {
      notices,
      close: closeNotice,
      pause: pauseNotice,
      resume: resumeNotice,
      config: getConfig(),
    })

  return {
    api: {
      open,
      success: (args) => typed('success', args),
      info: (args) => typed('info', args),
      warning: (args) => typed('warning', args),
      error: (args) => typed('error', args),
      destroy,
    },
    holder,
    mount: () =>
      mountNotificationHolder({
        notices,
        close: closeNotice,
        pause: pauseNotice,
        resume: resumeNotice,
        config: getConfig(),
      }),
    dispose: () => {
      destroy()
    },
  }
}

let staticRuntime: NotificationRuntime | undefined
let disposeStaticRoot: (() => void) | undefined

function ensureStaticRuntime() {
  if (staticRuntime || !canUseDom()) return
  disposeStaticRoot = createRoot((dispose) => {
    const runtime = createNotificationRuntime(() => globalConfig)
    staticRuntime = runtime
    const unmount = runtime.mount()
    return () => {
      unmount()
      runtime.dispose()
      dispose()
    }
  })
}

export const notification: NotificationInstance = {
  open: (args) => {
    ensureStaticRuntime()
    return staticRuntime?.api.open(args) ?? { close: () => undefined }
  },
  success: (args) => {
    ensureStaticRuntime()
    return staticRuntime?.api.success(args) ?? { close: () => undefined }
  },
  info: (args) => {
    ensureStaticRuntime()
    return staticRuntime?.api.info(args) ?? { close: () => undefined }
  },
  warning: (args) => {
    ensureStaticRuntime()
    return staticRuntime?.api.warning(args) ?? { close: () => undefined }
  },
  error: (args) => {
    ensureStaticRuntime()
    return staticRuntime?.api.error(args) ?? { close: () => undefined }
  },
  destroy: (key?: NotificationKey) => {
    if (key !== undefined) {
      staticRuntime?.api.destroy(key)
      return
    }

    staticRuntime?.dispose()
    disposeStaticRoot?.()
    staticRuntime = undefined
    disposeStaticRoot = undefined
    globalConfig = {}
  },
  config: (options) => {
    globalConfig = { ...globalConfig, ...options }
    staticRuntime?.dispose()
    disposeStaticRoot?.()
    staticRuntime = undefined
    disposeStaticRoot = undefined
  },
  useNotification: (config = {}) => {
    const runtime = createNotificationRuntime(() => config)
    return [runtime.api, runtime.holder()]
  },
}
