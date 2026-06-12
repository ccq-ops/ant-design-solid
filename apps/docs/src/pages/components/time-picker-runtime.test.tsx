import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import TimePickerPage from './time-picker.mdx'

function renderTimePickerPage() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <TimePickerPage />
      </ConfigProvider>
    </StyleProvider>
  ))
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
