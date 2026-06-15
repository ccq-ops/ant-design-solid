import type { JSX } from 'solid-js'
import type { MessageConfigOptions, MessageInstance } from '../message'
import type { ModalHookApi } from '../modal'

export interface AppProps {
  children?: JSX.Element
  message?: MessageConfigOptions
}

export interface AppContextValue {
  message: MessageInstance
  modal: ModalHookApi
}
