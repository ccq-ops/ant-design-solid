import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Empty } from '../index'

describe('Empty', () => {
  it('renders default empty state with prefix classes', () => {
    const result = render(() => <Empty />)

    expect(result.getByText('No Data')).toBeInTheDocument()
    expect(result.container.firstElementChild?.className).toContain('ads-empty')
    expect(result.container.querySelector('.ads-empty-image svg')).toBeTruthy()
  })

  it('renders string image as img with wrapper style', () => {
    const result = render(() => <Empty image="/empty.svg" imageStyle={{ height: '48px' }} />)
    const image = result.getByRole('img') as HTMLImageElement
    const imageWrapper = result.container.querySelector<HTMLElement>('.ads-empty-image')

    expect(image).toHaveAttribute('src', '/empty.svg')
    expect(image).toHaveAttribute('alt', 'No Data')
    expect(imageWrapper?.style.height).toBe('48px')
  })

  it('renders custom JSX image description and action children', () => {
    const result = render(() => (
      <Empty
        image={<span data-testid="custom-image">◎</span>}
        description={<span>Nothing here</span>}
      >
        <button>Reload</button>
      </Empty>
    ))

    expect(result.getByTestId('custom-image')).toBeInTheDocument()
    expect(result.getByText('Nothing here')).toBeInTheDocument()
    expect(result.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(result.container.querySelector('.ads-empty-footer')).toBeTruthy()
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Empty />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-empty')).toBeTruthy()
    expect(result.container.querySelector('.ads-empty')).toBeFalsy()
  })
})
