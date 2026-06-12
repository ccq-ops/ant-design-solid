import { createComponent, createRoot, createSignal, getOwner, runWithOwner } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '../config-provider'
import { ConfigContext } from '../config-provider/context'
import { canUseDom } from '../shared/portal'
import { ConfirmDialog } from './confirm'
import type {
  ModalFuncProps,
  ModalFuncReturn,
  ModalFuncReturnWithThen,
  ModalFuncType,
  ModalFuncUpdate,
  ModalHookApi,
} from './interface'

const instances = new Set<ModalFuncReturn>()
let defaultRootPrefixCls: string | undefined

function noopInstance(): ModalFuncReturn {
  return { destroy: () => undefined, update: () => undefined }
}

function normalizeType(type: ModalFuncType) {
  return type === 'warn' ? 'warning' : type
}

function openConfirm(
  config: ModalFuncProps,
  holder?: HTMLElement,
  rootPrefixCls?: string,
): ModalFuncReturn {
  if (!canUseDom()) return noopInstance()

  const container = document.createElement('div')
  ;(holder ?? document.body).appendChild(container)
  let disposeRoot: (() => void) | undefined
  let setConfig!: (value: ModalFuncProps) => ModalFuncProps
  let currentConfig = config
  let destroyed = false

  const destroy = () => {
    if (destroyed) return
    destroyed = true
    const afterClose = currentConfig.afterClose
    disposeRoot?.()
    disposeRoot = undefined
    container.remove()
    instances.delete(instance)
    afterClose?.()
  }

  const instance: ModalFuncReturn = {
    destroy,
    update: (next: ModalFuncUpdate) => {
      if (destroyed) return
      const patch = typeof next === 'function' ? next(currentConfig) : next
      currentConfig = { ...currentConfig, ...patch }
      setConfig(currentConfig)
    },
  }

  disposeRoot = createRoot((dispose) => {
    const [current, nextConfig] = createSignal(config)
    setConfig = nextConfig
    const disposeRender = render(
      () =>
        createComponent(ConfigProvider, {
          prefixCls: rootPrefixCls ?? defaultRootPrefixCls,
          get children() {
            return createComponent(ConfirmDialog, {
              get config() {
                return current()
              },
              close: destroy,
            })
          },
        }),
      container,
    )
    return () => {
      disposeRender()
      dispose()
    }
  })

  instances.add(instance)
  return instance
}

function typed(type: ModalFuncType, config: ModalFuncProps) {
  return openConfirm({ ...config, type: normalizeType(type) })
}

function createHookInstance(
  type: ModalFuncType,
  config: ModalFuncProps,
  holder: HTMLElement,
  prefixCls: string,
  closeHolderChild: () => void,
): ModalFuncReturnWithThen {
  let resolveResult!: (value: boolean) => void
  const promise = new Promise<boolean>((resolve) => {
    resolveResult = resolve
  })
  const wrappedConfig: ModalFuncProps = {
    ...config,
    type: normalizeType(type),
    prefixCls: config.prefixCls ?? `${prefixCls}-modal`,
    afterClose: () => {
      config.afterClose?.()
      closeHolderChild()
    },
    onOk: async (close) => {
      let result: void | Promise<void>
      try {
        result = config.onOk?.(close)
      } catch {
        return
      }
      if (result && typeof (result as Promise<void>).then === 'function') {
        try {
          await result
        } catch {
          return
        }
      }
      resolveResult(true)
      close?.()
    },
    onCancel: async (close) => {
      let result: void | Promise<void>
      try {
        result = config.onCancel?.(close)
      } catch {
        return
      }
      if (result && typeof (result as Promise<void>).then === 'function') {
        try {
          await result
        } catch {
          return
        }
      }
      resolveResult(false)
      close?.()
    },
  }
  const instance = openConfirm(wrappedConfig, holder, prefixCls)
  return {
    destroy: instance.destroy,
    update: instance.update,
    // oxlint-disable-next-line unicorn/no-thenable -- antd-compatible hook modal handles are intentionally thenable.
    then: (onfulfilled, onrejected) => promise.then(onfulfilled, onrejected),
  }
}

function useModal(): readonly [ModalHookApi, import('solid-js').JSX.Element] {
  const owner = getOwner()
  const [holder, setHolder] = createSignal<HTMLDivElement>()
  const [prefixCls, setPrefixCls] = createSignal('ads')
  const pending: Array<() => void> = []

  const createTyped = (type: ModalFuncType) => (modalConfig: ModalFuncProps) => {
    const mount = holder()
    if (!mount || !owner) {
      let target: ModalFuncReturnWithThen | undefined
      let resolveResult!: (value: boolean) => void
      const promise = new Promise<boolean>((resolve) => {
        resolveResult = resolve
      })
      pending.push(() => {
        const nextMount = holder()
        if (!nextMount || !owner) {
          resolveResult(false)
          return
        }
        target = runWithOwner(owner, () =>
          createHookInstance(type, modalConfig, nextMount, prefixCls(), () => undefined),
        ) as ModalFuncReturnWithThen
        target.then((value) => resolveResult(Boolean(value)))
      })
      return {
        destroy: () => target?.destroy(),
        update: (configUpdate) => target?.update(configUpdate),
        // oxlint-disable-next-line unicorn/no-thenable -- antd-compatible hook modal handles are intentionally thenable.
        then: (onfulfilled, onrejected) => promise.then(onfulfilled, onrejected),
      } as ModalFuncReturnWithThen
    }
    return runWithOwner(owner, () =>
      createHookInstance(type, modalConfig, mount, prefixCls(), () => undefined),
    ) as ModalFuncReturnWithThen
  }

  const api: ModalHookApi = {
    confirm: createTyped('confirm'),
    info: createTyped('info'),
    success: createTyped('success'),
    error: createTyped('error'),
    warning: createTyped('warning'),
    warn: createTyped('warn'),
  }

  const ContextHolder = () => {
    const config = useConfig()
    setPrefixCls(config.prefixCls())
    const assignHolder = (element: HTMLDivElement) => {
      setHolder(element)
      pending.splice(0).forEach((action) => action())
    }
    return (
      <ConfigContext.Provider value={config}>
        <div ref={assignHolder} />
      </ConfigContext.Provider>
    )
  }

  const contextHolder = <ContextHolder />

  return [api, contextHolder] as const
}

export const modalStaticMethods = {
  confirm: (config: ModalFuncProps) => typed('confirm', config),
  info: (config: ModalFuncProps) => typed('info', config),
  success: (config: ModalFuncProps) => typed('success', config),
  error: (config: ModalFuncProps) => typed('error', config),
  warning: (config: ModalFuncProps) => typed('warning', config),
  get warn() {
    return this.warning
  },
  destroyAll: () => {
    Array.from(instances).forEach((instance) => instance.destroy())
  },
  useModal,
  config: (options: { rootPrefixCls?: string }) => {
    defaultRootPrefixCls = options.rootPrefixCls
  },
}
