import { render } from '@solidjs/testing-library'
import { darkAlgorithm } from '@ant-design-solid/theme'
import { describe, expect, test } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Result } from '../index'

function expectExceptionSvgUsesThemeVariables(svg: SVGElement) {
  expect(svg.querySelector('.ads-result-image-bg')?.getAttribute('fill')).toBe(
    'var(--ads-result-image-bg-color)',
  )
  expect(svg.querySelector('.ads-result-image-surface')?.getAttribute('fill')).toBe(
    'var(--ads-result-image-surface-color)',
  )
  expect(svg.querySelector('.ads-result-image-muted')?.getAttribute('fill')).toBe(
    'var(--ads-result-image-muted-color)',
  )
  expect(svg.querySelector('.ads-result-image-muted')?.getAttribute('stroke')).toBeNull()
  expect(svg.querySelector('path.ads-result-image-muted')?.getAttribute('stroke')).toBe(
    'var(--ads-result-image-muted-color)',
  )
  expect(svg.querySelector('.ads-result-image-accent')?.getAttribute('fill')).toBe(
    'var(--ads-result-image-accent-color)',
  )
  expect(svg.querySelector('text.ads-result-image-accent')?.getAttribute('fill')).toBe(
    'var(--ads-result-image-accent-color)',
  )
}

function expectNoAbsoluteSvgColors(svg: SVGElement) {
  expect(svg.innerHTML).not.toMatch(/(?:fill|stroke)="(?:#[\da-fA-F]{3,8}|rgba?\()/)
}

describe('Result', () => {
  test('renders default info result content', () => {
    const result = render(() => <Result title="Information" subTitle="Helpful details" />)

    expect(result.getByText('Information')).toBeTruthy()
    expect(result.getByText('Helpful details')).toBeTruthy()
    expect(result.container.querySelector('.ads-result-info')).toBeTruthy()
    expect(result.container.querySelector('.ads-result-icon svg')).toBeTruthy()
  })

  test('renders status classes for common and http statuses', () => {
    const success = render(() => <Result status="success" title="Done" />)
    expect(success.container.querySelector('.ads-result-success')).toBeTruthy()

    const error = render(() => <Result status="error" title="Failed" />)
    expect(error.container.querySelector('.ads-result-error')).toBeTruthy()

    const warning = render(() => <Result status="warning" title="Careful" />)
    expect(warning.container.querySelector('.ads-result-warning')).toBeTruthy()

    const notFound = render(() => <Result status="404" title="Missing" />)
    expect(notFound.container.querySelector('.ads-result-404')).toBeTruthy()
  })

  test('supports custom icon extra and children', () => {
    const result = render(() => (
      <Result
        icon={<span data-testid="rocket">🚀</span>}
        title="Launched"
        subTitle="Everything is ready"
        extra={<button type="button">Continue</button>}
      >
        <div>More details</div>
      </Result>
    ))

    expect(result.getByTestId('rocket')).toBeTruthy()
    expect(result.getByRole('button', { name: 'Continue' })).toBeTruthy()
    expect(result.getByText('More details')).toBeTruthy()
  })

  test('supports semantic classNames and styles as objects or functions', () => {
    const result = render(() => (
      <Result
        status="success"
        title="Styled"
        subTitle="Semantic slots"
        extra={<button type="button">Continue</button>}
        classNames={({ props }) => ({
          root: props.status === 'success' ? 'semantic-root' : undefined,
          icon: 'semantic-icon',
          title: 'semantic-title',
          subTitle: 'semantic-subtitle',
          extra: 'semantic-extra',
          body: 'semantic-body',
        })}
        styles={{
          root: { margin: '4px' },
          icon: { color: 'rgb(1, 2, 3)' },
          title: { color: 'rgb(4, 5, 6)' },
          subTitle: { color: 'rgb(7, 8, 9)' },
          extra: { margin: '8px' },
          body: { padding: '12px' },
        }}
      >
        Body content
      </Result>
    ))

    const root = result.container.firstElementChild as HTMLElement
    expect(root).toHaveClass('semantic-root')
    expect(root).toHaveStyle({ margin: '4px' })
    expect(result.container.querySelector('.ads-result-icon')).toHaveClass('semantic-icon')
    expect(result.container.querySelector('.ads-result-icon')).toHaveStyle({
      color: 'rgb(1, 2, 3)',
    })
    expect(result.getByText('Styled')).toHaveClass('semantic-title')
    expect(result.getByText('Styled')).toHaveStyle({ color: 'rgb(4, 5, 6)' })
    expect(result.getByText('Semantic slots')).toHaveClass('semantic-subtitle')
    expect(result.getByText('Semantic slots')).toHaveStyle({ color: 'rgb(7, 8, 9)' })
    expect(result.getByRole('button', { name: 'Continue' }).parentElement).toHaveClass(
      'semantic-extra',
    )
    expect(result.getByRole('button', { name: 'Continue' }).parentElement).toHaveStyle({
      margin: '8px',
    })
    const body = result.container.querySelector('.ads-result-body')
    expect(body).toHaveClass('semantic-body')
    expect(body).toHaveStyle({ padding: '12px' })
  })

  test('renders exception images for string and numeric statuses', () => {
    const notFound = render(() => <Result status="404" title="Missing" />)
    expect(notFound.container.querySelector('.ads-result-image svg')).toBeTruthy()

    const forbidden = render(() => <Result status={403} title="Forbidden" />)
    expect(forbidden.container.querySelector('.ads-result-403')).toBeTruthy()
    expect(forbidden.container.querySelector('.ads-result-image svg')).toBeTruthy()

    const crashed = render(() => <Result status={500} title="Crashed" />)
    expect(crashed.container.querySelector('.ads-result-500')).toBeTruthy()
    expect(crashed.container.querySelector('.ads-result-image svg')).toBeTruthy()
  })

  test('uses semantic classes for exception image neutral colors', () => {
    const result = render(() => <Result status="404" title="Missing" />)
    const svg = result.container.querySelector('.ads-result-image svg') as SVGElement

    expect(svg.querySelectorAll('.ads-result-image-muted')).toHaveLength(3)
    expectExceptionSvgUsesThemeVariables(svg)
    expectNoAbsoluteSvgColors(svg)
  })

  test('uses dark theme tokens for every built-in exception image', () => {
    const result = render(() => (
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <Result status={403} title="Forbidden" />
        <Result status={404} title="Missing" />
        <Result status={500} title="Crashed" />
        <Result.PRESENTED_IMAGE_403 />
        <Result.PRESENTED_IMAGE_404 />
        <Result.PRESENTED_IMAGE_500 />
      </ConfigProvider>
    ))

    for (const svg of Array.from(result.container.querySelectorAll('svg'))) {
      expectExceptionSvgUsesThemeVariables(svg)
      expectNoAbsoluteSvgColors(svg)
      expect(svg.style.getPropertyValue('--ads-result-image-bg-color')).toBe(
        'rgba(255,255,255,0.08)',
      )
      expect(svg.style.getPropertyValue('--ads-result-image-surface-color')).toBe('#141414')
      expect(svg.style.getPropertyValue('--ads-result-image-muted-color')).toBe('#303030')
    }
  })

  test('keeps visual spacing between exception image and status code', () => {
    const result = render(() => <Result status={404} title="Missing" />)
    const svg = result.container.querySelector('.ads-result-image svg') as SVGElement
    const imageBg = svg.querySelector('.ads-result-image-bg') as SVGRectElement
    const code = svg.querySelector('text.ads-result-image-accent') as SVGTextElement
    const imageBottom = Number(imageBg.getAttribute('y')) + Number(imageBg.getAttribute('height'))
    const codeTop = Number(code.getAttribute('y')) - Number(code.getAttribute('font-size') ?? '0')

    expect(svg.getAttribute('viewBox')).toBe('0 0 252 252')
    expect(svg.getAttribute('height')).toBe('252')
    expect(imageBg.getAttribute('y')).toBe('38')
    expect(code.getAttribute('y')).toBe('230')
    expect(codeTop - imageBottom).toBeGreaterThanOrEqual(24)
  })

  test('exposes presented exception image components', () => {
    const result = render(() => (
      <>
        <Result.PRESENTED_IMAGE_403 />
        <Result.PRESENTED_IMAGE_404 />
        <Result.PRESENTED_IMAGE_500 />
      </>
    ))

    expect(result.container.querySelectorAll('svg')).toHaveLength(3)
  })

  test('does not render slots for false or null content', () => {
    const result = render(() => (
      <Result icon={null} title={false} subTitle={false} extra={false}>
        {false}
      </Result>
    ))

    expect(result.container.querySelector('.ads-result-icon')).toBeNull()
    expect(result.container.querySelector('.ads-result-title')).toBeNull()
    expect(result.container.querySelector('.ads-result-subtitle')).toBeNull()
    expect(result.container.querySelector('.ads-result-extra')).toBeNull()
    expect(result.container.querySelector('.ads-result-body')).toBeNull()
  })

  test('registers centered icon layout styles', () => {
    render(() => <Result icon={<span>custom icon</span>} title="Centered" />)

    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toContain('.ads-result-icon')
    expect(styles).toContain('display:flex')
    expect(styles).toContain('justify-content:center')
  })

  test('supports custom and config provider prefixes', () => {
    const custom = render(() => <Result prefixCls="custom-result" title="Custom" />)
    expect(custom.container.querySelector('.custom-result')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Result title="Configured" />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-result')).toBeTruthy()
  })
})
