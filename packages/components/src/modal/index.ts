import type { ModalComponent } from './interface'
import { ModalBase } from './modal'
import { modalStaticMethods } from './modal-method'

export * from './interface'
export const Modal = Object.assign(ModalBase, modalStaticMethods) as ModalComponent
