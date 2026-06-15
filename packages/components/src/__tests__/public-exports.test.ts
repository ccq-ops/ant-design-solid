import { describe, expect, it } from 'vitest'
import * as Core from '../index'

describe('public component exports', () => {
  it('does not export deprecated List component', () => {
    expect('List' in Core).toBe(false)
  })
})
