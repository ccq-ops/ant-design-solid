import { createRoot, createSignal } from 'solid-js'
import { mountMessageHolder } from './holder'
import type { JSX } from 'solid-js'
import type {
  MessageArgs,
  MessageHandle,
  MessageInstance,
  MessageNotice,
  MessageType,
} from './interface'

let seed = 0
let disposeRoot: (() => void) | undefined
let setNotices:
  | ((updater: MessageNotice[] | ((value: MessageNotice[]) => MessageNotice[])) => MessageNotice[])
  | undefined
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function ensureHolder() {
  if (setNotices) return
  disposeRoot = createRoot((dispose) => {
    const [notices, nextNotices] = createSignal<MessageNotice[]>([])
    setNotices = nextNotices
    const unmount = mountMessageHolder({ notices })
    return () => {
      unmount()
      dispose()
    }
  })
}

function normalize(
  type: MessageType,
  content: JSX.Element | MessageArgs,
  duration?: number,
): MessageArgs {
  if (typeof content === 'object' && content !== null && 'content' in content) {
    return { type, ...content }
  }
  return { type, content, duration }
}

function remove(key: string) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  setNotices?.((items) => items.filter((item) => item.key !== key))
}

function open(args: MessageArgs): MessageHandle {
  ensureHolder()
  const type = args.type ?? 'info'
  const key = args.key ?? `message-${++seed}`
  const notice: MessageNotice = { ...args, key, type }
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

  const duration = args.duration ?? (type === 'loading' ? 0 : 3)
  if (duration > 0) {
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

export const message: MessageInstance = {
  open,
  info: (content, duration) => open(normalize('info', content, duration)),
  success: (content, duration) => open(normalize('success', content, duration)),
  error: (content, duration) => open(normalize('error', content, duration)),
  warning: (content, duration) => open(normalize('warning', content, duration)),
  loading: (content, duration) => open(normalize('loading', content, duration)),
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
