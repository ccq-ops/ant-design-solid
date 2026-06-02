import { describe, expect, it } from 'vitest'
import { getDropdownPosition, getTooltipPosition } from '../placement'

const rect: DOMRect = {
  x: 10,
  y: 20,
  top: 20,
  left: 10,
  right: 110,
  bottom: 60,
  width: 100,
  height: 40,
  toJSON: () => ({}),
}

describe('placement helpers', () => {
  it('positions tooltip for each side', () => {
    expect(getTooltipPosition(rect, 'top', 8)).toEqual({ top: '12px', left: '60px', transform: 'translate(-50%, -100%)' })
    expect(getTooltipPosition(rect, 'bottom', 8)).toEqual({ top: '68px', left: '60px', transform: 'translateX(-50%)' })
    expect(getTooltipPosition(rect, 'left', 8)).toEqual({ top: '40px', left: '2px', transform: 'translate(-100%, -50%)' })
    expect(getTooltipPosition(rect, 'right', 8)).toEqual({ top: '40px', left: '118px', transform: 'translateY(-50%)' })
  })

  it('positions dropdown for corner placements', () => {
    expect(getDropdownPosition(rect, 'bottomLeft', 4)).toEqual({ top: '64px', left: '10px' })
    expect(getDropdownPosition(rect, 'bottomRight', 4)).toEqual({ top: '64px', left: '110px', transform: 'translateX(-100%)' })
    expect(getDropdownPosition(rect, 'topLeft', 4)).toEqual({ top: '16px', left: '10px', transform: 'translateY(-100%)' })
    expect(getDropdownPosition(rect, 'topRight', 4)).toEqual({ top: '16px', left: '110px', transform: 'translate(-100%, -100%)' })
  })
})
