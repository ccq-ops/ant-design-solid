import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Divider } from '../index'

describe('Divider', () => {
  it('renders a horizontal solid separator by default', () => {
    const result = render(() => <Divider data-testid="divider" />)
    const divider = result.getByTestId('divider')

    expect(divider).toHaveAttribute('role', 'separator')
    expect(divider.className).toContain('ads-divider')
    expect(divider.className).toContain('ads-divider-horizontal')
    expect(divider.className).toContain('ads-divider-rail')
    expect(divider.className).not.toContain('ads-divider-dashed')
    expect(divider.className).not.toContain('ads-divider-dotted')
  })

  it('renders horizontal text with title placement and plain classes', () => {
    const result = render(() => (
      <Divider titlePlacement="start" plain>
        Text
      </Divider>
    ))
    const divider = result.container.firstElementChild as HTMLElement

    expect(divider.className).toContain('ads-divider-with-text')
    expect(divider.className).toContain('ads-divider-with-text-start')
    expect(divider.className).toContain('ads-divider-plain')
    expect(result.getByText('Text')).toHaveClass('ads-divider-inner-text')
    expect(result.container.querySelector('.ads-divider-rail-start')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-divider-rail-end')).toBeInTheDocument()
  })

  it('renders a vertical dotted separator without text', () => {
    const result = render(() => (
      <Divider orientation="vertical" variant="dotted">
        Ignored
      </Divider>
    ))
    const divider = result.container.firstElementChild as HTMLElement

    expect(divider).toHaveAttribute('role', 'separator')
    expect(divider.className).toContain('ads-divider-vertical')
    expect(divider.className).toContain('ads-divider-dotted')
    expect(divider.className).not.toContain('ads-divider-with-text')
    expect(result.queryByText('Ignored')).toBeNull()
  })

  it('supports vertical shorthand, size, prefixCls, rootClass, semantic classes and styles', () => {
    const result = render(() => (
      <Divider
        prefixCls="custom-divider"
        vertical
        size="small"
        rootClass="root-extra"
        class="local-extra"
        style={{ color: 'red' }}
        classNames={{ root: 'semantic-root', rail: 'semantic-rail', content: 'semantic-content' }}
        styles={{ root: { margin: '1px' }, rail: { 'border-color': 'blue' } }}
        data-testid="divider"
      />
    ))
    const divider = result.getByTestId('divider')

    expect(divider).toHaveClass('custom-divider')
    expect(divider).toHaveClass('custom-divider-vertical')
    expect(divider).toHaveClass('custom-divider-sm')
    expect(divider).toHaveClass('custom-divider-rail')
    expect(divider).toHaveClass('semantic-rail')
    expect(divider).toHaveClass('semantic-root')
    expect(divider).toHaveClass('local-extra')
    expect(divider).toHaveClass('root-extra')
    expect(divider).toHaveStyle({ margin: '1px', color: 'rgb(255, 0, 0)' })
    expect(divider.style.borderColor).toBe('blue')
  })

  it('maps left and right title placement by direction and applies orientationMargin to content', () => {
    const result = render(() => (
      <ConfigProvider direction="rtl">
        <Divider
          titlePlacement="left"
          orientationMargin={24}
          classNames={({ props }) => ({
            root: props.titlePlacement === 'end' ? 'placement-end' : 'placement-other',
            content: 'semantic-content',
          })}
          styles={({ props }) => ({
            content: { padding: props.titlePlacement === 'end' ? '2px' : '4px' },
          })}
        >
          Text
        </Divider>
      </ConfigProvider>
    ))
    const divider = result.container.querySelector('.ads-divider') as HTMLElement
    const content = result.getByText('Text')

    expect(divider).toHaveClass('ads-divider-with-text-end')
    expect(divider).toHaveClass('ads-divider-no-default-orientation-margin-end')
    expect(divider).toHaveClass('placement-end')
    expect(content).toHaveClass('semantic-content')
    expect(content).toHaveStyle({ 'margin-inline-end': '24px', padding: '2px' })
  })
})
