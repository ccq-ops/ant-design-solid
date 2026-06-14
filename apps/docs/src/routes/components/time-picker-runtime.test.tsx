import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import TimePickerPage from './time-picker.mdx'

function renderTimePickerPage() {
  return renderDocsPage(() => <TimePickerPage />)
}

describe('TimePicker docs page', () => {
  it('does not open the semantic styles demo popup on initial render', () => {
    const result = renderTimePickerPage()

    expect(result.getByRole('heading', { name: 'TimePicker', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Semantic styles', level: 3 })).toBeInTheDocument()
    expect(document.body.querySelector('.custom-time-popup')).not.toBeInTheDocument()
    expect(document.body.querySelector('.ads-time-picker-dropdown')).not.toBeInTheDocument()
  })
})
