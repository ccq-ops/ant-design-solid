import { createRoot, createSignal, onCleanup } from 'solid-js'
import { createMessageHolder, mountMessageHolder } from './holder'
import type { JSX } from 'solid-js'
import type {
  MessageArgs,
  MessageConfigOptions,
  MessageContent,
  MessageHandle,
  MessageInstance,
  MessageKey,
  MessageNotice,
  MessageStatic,
  MessageTypeOpen,
  MessageVisualType,
} from './interface'

let seed = 0
let globalConfig: MessageConfigOptions = {}

type NoticesSetter = (
  updater: MessageNotice[] | ((value: MessageNotice[]) => MessageNotice[]),
) => MessageNotice[]

interface NoticeRuntime {
  key: MessageKey
  close: () => void
  resolve: (value: boolean) => void
  promise: Promise<boolean>
  timer?: ReturnType<typeof setTimeout>
  duration: number
  remaining: number
  startedAt: number
  closed: boolean
  onClose?: () => void
}

interface Runtime {
  open: (args: MessageArgs) => MessageHandle
  destroy: (key?: MessageKey) => void
  pause: (key: MessageKey) => void
  resume: (key: MessageKey) => void
  setNotices?: NoticesSetter
}

function durationOf(args: MessageArgs, config: MessageConfigOptions) {
  return args.duration ?? (args.type === 'loading' ? 0 : undefined) ?? config.duration ?? 3
}

function createHandle(runtime: NoticeRuntime): MessageHandle {
  const close = () => runtime.close()
  const handle = (() => close()) as MessageHandle
  handle.close = close
  // oxlint-disable-next-line unicorn/no-thenable -- antd-compatible message handles are intentionally thenable.
  handle.then = runtime.promise.then.bind(runtime.promise)
  return handle
}

function createRuntime(
  options: {
    getConfig?: () => MessageConfigOptions
    onFirstOpen?: (runtime: Runtime) => void
    onEmpty?: () => void
    initialSetNotices?: NoticesSetter
  } = {},
): Runtime {
  let noticesSnapshot: MessageNotice[] = []
  let setNotices = options.initialSetNotices
  const runtimes = new Map<MessageKey, NoticeRuntime>()
  const getConfig = options.getConfig ?? (() => globalConfig)
  const runtime: Runtime = {
    get setNotices() {
      return setNotices
    },
    set setNotices(value: NoticesSetter | undefined) {
      setNotices = value
      if (value) value(noticesSnapshot)
    },
    open,
    destroy,
    pause,
    resume,
  }

  function updateNotices(updater: (items: MessageNotice[]) => MessageNotice[]) {
    const apply = (items: MessageNotice[]) => {
      noticesSnapshot = updater(items)
      return noticesSnapshot
    }
    if (setNotices) {
      setNotices((items) => apply(items))
    } else {
      apply(noticesSnapshot)
    }
  }

  function finishRuntime(noticeRuntime: NoticeRuntime) {
    if (noticeRuntime.closed) return false
    noticeRuntime.closed = true
    if (noticeRuntime.timer) clearTimeout(noticeRuntime.timer)
    runtimes.delete(noticeRuntime.key)
    noticeRuntime.onClose?.()
    noticeRuntime.resolve(true)
    if (runtimes.size === 0) options.onEmpty?.()
    return true
  }

  function closeRuntime(noticeRuntime: NoticeRuntime) {
    if (!finishRuntime(noticeRuntime)) return
    updateNotices((items) => items.filter((item) => item.key !== noticeRuntime.key))
  }

  function schedule(noticeRuntime: NoticeRuntime) {
    if (noticeRuntime.timer) clearTimeout(noticeRuntime.timer)
    if (noticeRuntime.remaining <= 0) return
    noticeRuntime.startedAt = Date.now()
    noticeRuntime.timer = setTimeout(() => closeRuntime(noticeRuntime), noticeRuntime.remaining)
  }

  function pause(key: MessageKey) {
    const noticeRuntime = runtimes.get(key)
    if (!noticeRuntime || noticeRuntime.closed || !noticeRuntime.timer) return
    clearTimeout(noticeRuntime.timer)
    noticeRuntime.timer = undefined
    noticeRuntime.remaining = Math.max(
      0,
      noticeRuntime.remaining - (Date.now() - noticeRuntime.startedAt),
    )
  }

  function resume(key: MessageKey) {
    const noticeRuntime = runtimes.get(key)
    if (!noticeRuntime || noticeRuntime.closed || noticeRuntime.timer) return
    schedule(noticeRuntime)
  }

  function destroy(key?: MessageKey) {
    if (key !== undefined) {
      const noticeRuntime = runtimes.get(key)
      if (noticeRuntime) closeRuntime(noticeRuntime)
      return
    }
    Array.from(runtimes.values()).forEach(closeRuntime)
  }

  function open(args: MessageArgs): MessageHandle {
    options.onFirstOpen?.(runtime)
    const config = getConfig()
    const type = args.type ?? 'info'
    const key = args.key ?? `message-${++seed}`
    const oldRuntime = runtimes.get(key)
    if (oldRuntime) {
      if (oldRuntime.timer) clearTimeout(oldRuntime.timer)
      runtimes.delete(key)
    }

    let resolve!: (value: boolean) => void
    const promise = new Promise<boolean>((nextResolve) => {
      resolve = nextResolve
    })
    const duration = durationOf({ ...args, type }, config)
    const noticeRuntime: NoticeRuntime = {
      key,
      close: () => closeRuntime(noticeRuntime),
      resolve,
      promise,
      duration,
      remaining: duration * 1000,
      startedAt: 0,
      closed: false,
      onClose: args.onClose,
    }
    runtimes.set(key, noticeRuntime)

    const notice: MessageNotice = { ...args, key, type }
    updateNotices((items) => {
      const index = items.findIndex((item) => item.key === key)
      const next =
        index === -1
          ? [...items, notice]
          : [...items.slice(0, index), notice, ...items.slice(index + 1)]
      const maxCount = config.maxCount
      if (!maxCount || next.length <= maxCount) return next
      next.slice(0, next.length - maxCount).forEach((item) => {
        const overflowRuntime = runtimes.get(item.key)
        if (overflowRuntime) finishRuntime(overflowRuntime)
      })
      return next.slice(-maxCount)
    })

    if (duration > 0) schedule(noticeRuntime)
    return createHandle(noticeRuntime)
  }

  return runtime
}

let disposeRoot: (() => void) | undefined
let globalRuntime: Runtime | undefined
let globalConfigSignal: ((value: MessageConfigOptions) => MessageConfigOptions) | undefined

function ensureGlobalHolder(runtime: Runtime) {
  if (runtime.setNotices) return
  disposeRoot = createRoot((dispose) => {
    const [notices, setNotices] = createSignal<MessageNotice[]>([])
    const [, setConfig] = createSignal<MessageConfigOptions>(globalConfig)
    runtime.setNotices = setNotices
    globalConfigSignal = setConfig
    const unmount = mountMessageHolder({
      notices,
      config: () => globalConfig,
      onMouseEnter: runtime.pause,
      onMouseLeave: runtime.resume,
    })
    return () => {
      unmount()
      dispose()
    }
  })
}

function getGlobalRuntime() {
  if (!globalRuntime) {
    globalRuntime = createRuntime({
      getConfig: () => globalConfig,
      onFirstOpen: (runtime) => {
        if (!runtime.setNotices) ensureGlobalHolder(runtime)
      },
    })
  }
  return globalRuntime
}

function normalize(
  type: MessageVisualType,
  content: MessageContent,
  duration?: number | (() => void),
  onClose?: () => void,
): MessageArgs {
  if (typeof content === 'object' && content !== null && 'content' in content) {
    return { type, ...content }
  }
  if (typeof duration === 'function') {
    return { type, content, onClose: duration }
  }
  return { type, content, duration, onClose }
}

function typeOpen(type: MessageVisualType): MessageTypeOpen {
  return (content, duration, onClose) =>
    getGlobalRuntime().open(normalize(type, content, duration, onClose))
}

function config(options: MessageConfigOptions) {
  const previousContainer = globalConfig.getContainer?.()
  globalConfig = { ...globalConfig, ...options }
  globalConfigSignal?.(globalConfig)
  const nextContainer = globalConfig.getContainer?.()
  if (globalRuntime?.setNotices && previousContainer !== nextContainer) {
    disposeRoot?.()
    disposeRoot = undefined
    globalRuntime.setNotices = undefined
    globalConfigSignal = undefined
    ensureGlobalHolder(globalRuntime)
  }
}

function destroy(key?: MessageKey) {
  getGlobalRuntime().destroy(key)
  if (key === undefined) {
    disposeRoot?.()
    disposeRoot = undefined
    globalRuntime = undefined
    globalConfigSignal = undefined
  }
}

function useMessage(localConfig?: MessageConfigOptions): [MessageInstance, JSX.Element] {
  const [notices, setNotices] = createSignal<MessageNotice[]>([])
  const runtime = createRuntime({
    initialSetNotices: setNotices,
    getConfig: () => localConfig ?? {},
  })
  onCleanup(() => runtime.destroy())
  return [createInstance(runtime), createMessageHolder({
    notices,
    config: () => localConfig ?? {},
    onMouseEnter: runtime.pause,
    onMouseLeave: runtime.resume,
  })]
}

function createInstance(runtime: Runtime): MessageInstance {
  return {
    open: runtime.open,
    info: (content, duration, onClose) =>
      runtime.open(normalize('info', content, duration, onClose)),
    success: (content, duration, onClose) =>
      runtime.open(normalize('success', content, duration, onClose)),
    error: (content, duration, onClose) =>
      runtime.open(normalize('error', content, duration, onClose)),
    warning: (content, duration, onClose) =>
      runtime.open(normalize('warning', content, duration, onClose)),
    loading: (content, duration, onClose) =>
      runtime.open(normalize('loading', content, duration, onClose)),
    destroy: runtime.destroy,
  }
}

export const message: MessageStatic = {
  open: (args) => getGlobalRuntime().open(args),
  info: typeOpen('info'),
  success: typeOpen('success'),
  error: typeOpen('error'),
  warning: typeOpen('warning'),
  loading: typeOpen('loading'),
  destroy,
  config,
  useMessage,
}
