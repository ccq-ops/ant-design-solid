export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type DropdownPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

export interface OverlayPosition {
  top: string
  left: string
  transform?: string
}

export function getTooltipPosition(
  rect: DOMRect,
  placement: TooltipPlacement,
  offset = 8,
): OverlayPosition {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  switch (placement) {
    case 'top':
      return {
        top: `${rect.top - offset}px`,
        left: `${centerX}px`,
        transform: 'translate(-50%, -100%)',
      }
    case 'bottom':
      return {
        top: `${rect.bottom + offset}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      }
    case 'left':
      return {
        top: `${centerY}px`,
        left: `${rect.left - offset}px`,
        transform: 'translate(-100%, -50%)',
      }
    case 'right':
      return {
        top: `${centerY}px`,
        left: `${rect.right + offset}px`,
        transform: 'translateY(-50%)',
      }
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
