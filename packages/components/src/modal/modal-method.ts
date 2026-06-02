import { createComponent, createRoot, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider } from '../config-provider'
import { canUseDom } from '../shared/portal'
import { ConfirmDialog } from './confirm'
import type { ModalFuncProps, ModalFuncReturn, ModalFuncType } from './interface'

const instances = new Set<ModalFuncReturn>()

function noopInstance(): ModalFuncReturn {
  return { destroy: () => undefined, update: () => undefined }
}

function openConfirm(config: ModalFuncProps): ModalFuncReturn {
  if (!canUseDom()) return noopInstance()

  const container = document.createElement('div')
  document.body.appendChild(container)
  let disposeRoot: (() => void) | undefined
  let setConfig!: (value: ModalFuncProps) => ModalFuncProps
  let currentConfig = config
  let destroyed = false

  const destroy = () => {
    if (destroyed) return
    destroyed = true
    disposeRoot?.()
    disposeRoot = undefined
    container.remove()
    instances.delete(instance)
  }

  const instance: ModalFuncReturn = {
    destroy,
    update: (next) => {
      if (destroyed) return
      currentConfig = { ...currentConfig, ...next }
      setConfig(currentConfig)
    },
  }

  disposeRoot = createRoot((dispose) => {
    const [current, nextConfig] = createSignal(config)
    setConfig = nextConfig
    const disposeRender = render(
      () =>
        createComponent(ConfigProvider, {
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
  return openConfirm({ ...config, type })
}

export const modalStaticMethods = {
  confirm: (config: ModalFuncProps) => typed('confirm', config),
  info: (config: ModalFuncProps) => typed('info', config),
  success: (config: ModalFuncProps) => typed('success', config),
  error: (config: ModalFuncProps) => typed('error', config),
  warning: (config: ModalFuncProps) => typed('warning', config),
  destroyAll: () => {
    Array.from(instances).forEach((instance) => instance.destroy())
  },
}
