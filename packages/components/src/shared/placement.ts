export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom'
export type DropdownPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

export interface OverlayPosition {
  top: string
  left: string
  transform?: string
}

export interface TooltipAlignConfig {
  points?: [string, string]
  offset?: [number | string, number | string]
  targetOffset?: [number | string, number | string]
  overflow?: { adjustX?: boolean; adjustY?: boolean }
  useCssRight?: boolean
  useCssBottom?: boolean
  useCssTransform?: boolean
}

export interface TooltipOverflowConfig {
  adjustX?: boolean
  adjustY?: boolean
}

function toNumber(value: number | string | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function viewportSize() {
  if (typeof window === 'undefined')
    return { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY }
  return { width: window.innerWidth, height: window.innerHeight }
}

function oppositePlacement(placement: TooltipPlacement): TooltipPlacement {
  const map: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
    topLeft: 'bottomLeft',
    topRight: 'bottomRight',
    bottomLeft: 'topLeft',
    bottomRight: 'topRight',
    leftTop: 'rightTop',
    leftBottom: 'rightBottom',
    rightTop: 'leftTop',
    rightBottom: 'leftBottom',
  }
  return map[placement]
}

function isTopPlacement(placement: TooltipPlacement) {
  return placement === 'top' || placement === 'topLeft' || placement === 'topRight'
}

function isBottomPlacement(placement: TooltipPlacement) {
  return placement === 'bottom' || placement === 'bottomLeft' || placement === 'bottomRight'
}

function isLeftPlacement(placement: TooltipPlacement) {
  return placement === 'left' || placement === 'leftTop' || placement === 'leftBottom'
}

function isRightPlacement(placement: TooltipPlacement) {
  return placement === 'right' || placement === 'rightTop' || placement === 'rightBottom'
}

function shouldFlip(rect: DOMRect, placement: TooltipPlacement, offset: number): boolean {
  const viewport = viewportSize()
  if (isTopPlacement(placement)) return rect.top - offset < 0
  if (isBottomPlacement(placement)) return rect.bottom + offset > viewport.height
  if (isLeftPlacement(placement)) return rect.left - offset < 0
  if (isRightPlacement(placement)) return rect.right + offset > viewport.width
  return false
}

export function getAdjustedTooltipPlacement(
  rect: DOMRect,
  placement: TooltipPlacement,
  offset = 8,
  autoAdjustOverflow: boolean | TooltipOverflowConfig = true,
): TooltipPlacement {
  if (!autoAdjustOverflow) return placement
  const overflow =
    typeof autoAdjustOverflow === 'object' ? autoAdjustOverflow : { adjustX: true, adjustY: true }
  const canAdjustY = overflow.adjustY !== false
  const canAdjustX = overflow.adjustX !== false
  const vertical = isTopPlacement(placement) || isBottomPlacement(placement)
  const horizontal = isLeftPlacement(placement) || isRightPlacement(placement)

  if ((vertical && canAdjustY) || (horizontal && canAdjustX)) {
    return shouldFlip(rect, placement, offset) ? oppositePlacement(placement) : placement
  }

  return placement
}

export function getTooltipPosition(
  rect: DOMRect,
  placement: TooltipPlacement,
  offset = 8,
  align?: TooltipAlignConfig,
): OverlayPosition {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const alignOffset = align?.offset ?? [0, 0]
  const offsetX = toNumber(alignOffset[0])
  const offsetY = toNumber(alignOffset[1])
  const withOffset = (position: OverlayPosition): OverlayPosition => ({
    ...position,
    top: `${Number.parseFloat(position.top) + offsetY}px`,
    left: `${Number.parseFloat(position.left) + offsetX}px`,
  })

  switch (placement) {
    case 'top':
      return withOffset({
        top: `${rect.top - offset}px`,
        left: `${centerX}px`,
        transform: 'translate(-50%, -100%)',
      })
    case 'topLeft':
      return withOffset({
        top: `${rect.top - offset}px`,
        left: `${rect.left}px`,
        transform: 'translateY(-100%)',
      })
    case 'topRight':
      return withOffset({
        top: `${rect.top - offset}px`,
        left: `${rect.right}px`,
        transform: 'translate(-100%, -100%)',
      })
    case 'bottom':
      return withOffset({
        top: `${rect.bottom + offset}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      })
    case 'bottomLeft':
      return withOffset({
        top: `${rect.bottom + offset}px`,
        left: `${rect.left}px`,
      })
    case 'bottomRight':
      return withOffset({
        top: `${rect.bottom + offset}px`,
        left: `${rect.right}px`,
        transform: 'translateX(-100%)',
      })
    case 'left':
      return withOffset({
        top: `${centerY}px`,
        left: `${rect.left - offset}px`,
        transform: 'translate(-100%, -50%)',
      })
    case 'leftTop':
      return withOffset({
        top: `${rect.top}px`,
        left: `${rect.left - offset}px`,
        transform: 'translateX(-100%)',
      })
    case 'leftBottom':
      return withOffset({
        top: `${rect.bottom}px`,
        left: `${rect.left - offset}px`,
        transform: 'translate(-100%, -100%)',
      })
    case 'right':
      return withOffset({
        top: `${centerY}px`,
        left: `${rect.right + offset}px`,
        transform: 'translateY(-50%)',
      })
    case 'rightTop':
      return withOffset({
        top: `${rect.top}px`,
        left: `${rect.right + offset}px`,
      })
    case 'rightBottom':
      return withOffset({
        top: `${rect.bottom}px`,
        left: `${rect.right + offset}px`,
        transform: 'translateY(-100%)',
      })
  }
}

export function getDropdownPosition(
  rect: DOMRect,
  placement: DropdownPlacement,
  offset = 4,
): OverlayPosition {
  switch (placement) {
    case 'bottomLeft':
      return {
        top: `${rect.bottom + offset}px`,
        left: `${rect.left}px`,
      }
    case 'bottomRight':
      return {
        top: `${rect.bottom + offset}px`,
        left: `${rect.right}px`,
        transform: 'translateX(-100%)',
      }
    case 'topLeft':
      return {
        top: `${rect.top - offset}px`,
        left: `${rect.left}px`,
        transform: 'translateY(-100%)',
      }
    case 'topRight':
      return {
        top: `${rect.top - offset}px`,
        left: `${rect.right}px`,
        transform: 'translate(-100%, -100%)',
      }
  }
}
