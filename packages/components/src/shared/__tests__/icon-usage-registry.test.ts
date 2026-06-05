import { describe, expect, it } from 'vitest'
import { filesThatShouldUseIconComponents } from '../icon-usage-registry'

describe('component icon usage registry', () => {
  it('tracks components whose handwritten glyph icons were replaced with icon components', () => {
    expect(filesThatShouldUseIconComponents).toEqual([
      'auto-complete/auto-complete.tsx',
      'cascader/cascader.tsx',
      'date-picker/date-picker.tsx',
      'drawer/drawer.tsx',
      'image/image.tsx',
      'mentions/mentions.tsx',
      'message/holder.tsx',
      'modal/modal.tsx',
      'notification/holder.tsx',
      'progress/progress.tsx',
      'result/result.tsx',
      'select/select.tsx',
      'steps/steps.tsx',
      'tag/tag.tsx',
      'time-picker/time-picker.tsx',
      'tour/tour.tsx',
      'tree-select/tree-select.tsx',
      'upload/upload.tsx',
    ])
  })
})
