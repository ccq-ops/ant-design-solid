import { createContext, useContext } from 'solid-js'

const baseZIndex = 1000
const containerOffset = 100
const consumerOffset = 50
const zIndexStep = 10
let currentZIndex = baseZIndex - zIndexStep

export type ZIndexContainer =
  | 'Modal'
  | 'Drawer'
  | 'Popover'
  | 'Popconfirm'
  | 'Tooltip'
  | 'Tour'
  | 'FloatButton'
  | 'ColorPicker'

export type ZIndexConsumer = 'SelectLike' | 'Dropdown' | 'DatePicker' | 'Menu' | 'ImagePreview'
export type ZIndexComponentType = ZIndexContainer | ZIndexConsumer

export const containerBaseZIndexOffset: Record<ZIndexContainer, number> = {
  Modal: containerOffset,
  Drawer: containerOffset,
  Popover: containerOffset,
  Popconfirm: containerOffset,
  Tooltip: containerOffset,
  Tour: containerOffset,
  FloatButton: containerOffset,
  ColorPicker: containerOffset,
}

export const consumerBaseZIndexOffset: Record<ZIndexConsumer, number> = {
  SelectLike: consumerOffset,
  Dropdown: consumerOffset,
  DatePicker: consumerOffset,
  Menu: consumerOffset,
  ImagePreview: 1,
}

export const ZIndexContext = createContext<number | undefined>(undefined)

function isContainerType(type: ZIndexComponentType): type is ZIndexContainer {
  return type in containerBaseZIndexOffset
}

export function useZIndex(
  componentType: ZIndexComponentType,
  customZIndex?: number,
): [zIndex: number, contextZIndex: number] {
  const parentZIndex = useContext(ZIndexContext)

  if (customZIndex !== undefined) return [customZIndex, customZIndex]

  const offset = isContainerType(componentType)
    ? containerBaseZIndexOffset[componentType]
    : consumerBaseZIndexOffset[componentType]
  const zIndex = (parentZIndex ?? baseZIndex) + offset
  const effectiveZIndex = parentZIndex === undefined && !isContainerType(componentType) ? 0 : zIndex

  return [effectiveZIndex, zIndex]
}

export function allocateZIndex() {
  currentZIndex += zIndexStep
  return currentZIndex
}

export function resetZIndexForTests() {
  currentZIndex = baseZIndex - zIndexStep
}
