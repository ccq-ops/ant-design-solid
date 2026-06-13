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

  it('renders string image as img with semantic image style', () => {
    const result = render(() => <Empty image="/empty.svg" styles={{ image: { height: '48px' } }} />)
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

  it('supports component prefixCls rootClassName and semantic class names', () => {
    const result = render(() => (
      <Empty
        prefixCls="my-empty"
        class="outer"
        rootClassName="root-extra"
        classNames={{
          root: 'semantic-root',
          image: 'semantic-image',
          description: 'semantic-description',
          footer: 'semantic-footer',
        }}
      >
        Action
      </Empty>
    ))

    const root = result.container.firstElementChild
    expect(root?.className).toContain('my-empty')
    expect(root?.className).toContain('outer')
    expect(root?.className).toContain('root-extra')
    expect(root?.className).toContain('semantic-root')
    expect(result.container.querySelector('.my-empty-image')?.className).toContain('semantic-image')
    expect(result.container.querySelector('.my-empty-description')?.className).toContain(
      'semantic-description',
    )
    expect(result.container.querySelector('.my-empty-footer')?.className).toContain(
      'semantic-footer',
    )
  })

  it('supports semantic class names and styles as functions', () => {
    const result = render(() => (
      <Empty
        description="Functional"
        classNames={({ props }) => ({
          root: props.description === 'Functional' ? 'fn-root' : undefined,
          image: 'fn-image',
        })}
        styles={({ props }) => ({
          root: props.description === 'Functional' ? { margin: '12px' } : undefined,
          description: { color: 'rgb(1, 2, 3)' },
        })}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const description = result.container.querySelector<HTMLElement>('.ads-empty-description')
    expect(root.className).toContain('fn-root')
    expect(root.style.margin).toBe('12px')
    expect(result.container.querySelector('.ads-empty-image')?.className).toContain('fn-image')
    expect(description?.style.color).toBe('rgb(1, 2, 3)')
  })

  it('hides description and footer when values are falsy', () => {
    const result = render(() => <Empty description={false}>{false}</Empty>)

    expect(result.queryByText('No Data')).toBeNull()
    expect(result.container.querySelector('.ads-empty-description')).toBeFalsy()
    expect(result.container.querySelector('.ads-empty-footer')).toBeFalsy()
  })

  it('exposes default and simple presented images', () => {
    const defaultResult = render(() => <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} />)
    const simpleResult = render(() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />)

    expect(defaultResult.container.querySelector('.ads-empty-image svg')).toBeTruthy()
    expect(simpleResult.container.querySelector('.ads-empty-image svg')).toBeTruthy()
    expect(simpleResult.container.firstElementChild?.className).toContain('ads-empty-normal')
  })

  it('merges empty config from ConfigProvider and supports rtl class', () => {
    const result = render(() => (
      <ConfigProvider
        direction="rtl"
        empty={{
          class: 'context-empty',
          style: { margin: '8px' },
          image: <span data-testid="context-image" />,
          classNames: { image: 'context-image-slot' },
          styles: { description: { color: 'rgb(4, 5, 6)' } },
        }}
      >
        <Empty />
      </ConfigProvider>
    ))

    const root = result.container.firstElementChild as HTMLElement
    const image = result.container.querySelector('.ads-empty-image')
    const description = result.container.querySelector<HTMLElement>('.ads-empty-description')
    expect(root.className).toContain('context-empty')
    expect(root.className).toContain('ads-empty-rtl')
    expect(root.style.margin).toBe('8px')
    expect(result.getByTestId('context-image')).toBeInTheDocument()
    expect(image?.className).toContain('context-image-slot')
    expect(description?.style.color).toBe('rgb(4, 5, 6)')
  })
})
