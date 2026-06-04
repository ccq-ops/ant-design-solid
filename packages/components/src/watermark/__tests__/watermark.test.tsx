import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Watermark } from '../index'

describe('Watermark', () => {
  it('renders children and a generated watermark overlay', () => {
    const result = render(() => (
      <Watermark content="Confidential">
        <div>Document</div>
      </Watermark>
    ))

    expect(result.getByText('Document')).toBeTruthy()
    const watermark = result.container.querySelector('.ads-watermark')
    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(watermark).toBeTruthy()
    expect(overlay).toBeTruthy()
    expect(overlay.style.backgroundImage).toContain('data:image/svg+xml')
    expect(overlay.style.zIndex).toBe('9')
  })

  it('supports image, size, gap, offset, rotate, zIndex and className aliases', () => {
    const result = render(() => (
      <Watermark
        className="secure"
        image="/logo.svg"
        width={120}
        height={48}
        gap={[20, 30]}
        offset={[5, 6]}
        rotate={-10}
        zIndex={20}
      >
        Content
      </Watermark>
    ))

    const root = result.container.querySelector('.ads-watermark') as HTMLElement
    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(root.className).toContain('secure')
    expect(overlay.style.zIndex).toBe('20')
    expect(overlay.style.backgroundSize).toBe('140px 78px')
    expect(overlay.style.backgroundPosition).toBe('5px 6px')
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Watermark prefixCls="custom-watermark" content="A" />)
    expect(withProp.container.querySelector('.custom-watermark')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Watermark content="A" />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-watermark')).toBeTruthy()
  })
})
