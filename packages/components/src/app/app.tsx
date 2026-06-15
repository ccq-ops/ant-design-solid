import { createContext, useContext } from 'solid-js'
import { message as staticMessage } from '../message'
import { Modal } from '../modal'
import type { ModalHookApi } from '../modal'
import type { AppContextValue, AppProps } from './interface'

const noopModalInstance = {
  destroy: () => undefined,
  update: () => undefined,
  // oxlint-disable-next-line unicorn/no-thenable -- Modal hook handles are intentionally thenable.
  then: (onfulfilled, _onrejected) => Promise.resolve(onfulfilled?.(false) ?? false),
} satisfies ReturnType<ModalHookApi['confirm']>
const noopModal: ModalHookApi = {
  confirm: () => noopModalInstance,
  info: () => noopModalInstance,
  success: () => noopModalInstance,
  error: () => noopModalInstance,
  warning: () => noopModalInstance,
  warn: () => noopModalInstance,
}
const AppContext = createContext<AppContextValue>({ message: staticMessage, modal: noopModal })

function AppComponent(props: AppProps) {
  const [messageApi, messageHolder] = staticMessage.useMessage(props.message)
  const [modalApi, modalHolder] = Modal.useModal()

  return (
    <AppContext.Provider value={{ message: messageApi, modal: modalApi }}>
      {messageHolder}
      {modalHolder}
      {props.children}
    </AppContext.Provider>
  )
}

function useApp(): AppContextValue {
  return useContext(AppContext)
}

export const App = Object.assign(AppComponent, { useApp })
