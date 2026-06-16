import { render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { darkAlgorithm } from '@solid-ant-design/theme'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Watermark, useWatermarkPanelRef } from '../index'

class MockImage {
  onerror: (() => void) | null = null

  set src(_value: string) {
    queueMicrotask(() => this.onerror?.())
  }
}

describe('Watermark', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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
    expect(overlay.style.zIndex).toBe('999')
  })

  it('supports image, size, gap, offset, rotate, zIndex and class aliases', () => {
    const result = render(() => (
      <Watermark
        class="secure"
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

  it('uses half gap as the default offset', () => {
    const result = render(() => <Watermark content="A" gap={[80, 40]} />)

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(overlay.style.backgroundPosition).toBe('40px 20px')
  })

  it('supports rootClassName and keeps className as a compatibility alias', () => {
    const result = render(() => (
      <Watermark class="secure" className="legacy" rootClassName="rooted" content="A" />
    ))

    const root = result.container.querySelector('.ads-watermark') as HTMLElement
    expect(root.className).toContain('secure')
    expect(root.className).toContain('legacy')
    expect(root.className).toContain('rooted')
  })

  it('supports font textAlign and string fontSize', () => {
    const result = render(() => (
      <Watermark content="A" font={{ fontSize: '18px', textAlign: 'left' }} />
    ))

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    const background = decodeURIComponent(overlay.style.backgroundImage)
    expect(background).toContain('font-size="18px"')
    expect(background).toContain('text-anchor="start"')
  })

  it('uses a theme-aware default text color in dark theme', () => {
    const result = render(() => (
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <Watermark content="Confidential" />
      </ConfigProvider>
    ))

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain(
      'fill="rgba(255,255,255,0.15)"',
    )
  })

  it('refreshes the generated text color when switching from dark theme to light theme', async () => {
    function Demo() {
      const [dark, setDark] = createSignal(true)

      return (
        <ConfigProvider theme={dark() ? { algorithm: darkAlgorithm } : {}}>
          <button onClick={() => setDark(false)}>light</button>
          <Watermark content="Confidential" />
        </ConfigProvider>
      )
    }

    const result = render(() => <Demo />)
    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain(
      'fill="rgba(255,255,255,0.15)"',
    )

    result.getByText('light').click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain('fill="rgba(0,0,0,0.15)"')
  })

  it('keeps custom font color when dark theme is active', () => {
    const result = render(() => (
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <Watermark content="Confidential" font={{ color: 'rgba(22, 119, 255, 0.18)' }} />
      </ConfigProvider>
    ))

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain(
      'fill="rgba(22, 119, 255, 0.18)"',
    )
  })

  it('keeps the default watermark opacity when the text token is a hex color', () => {
    const result = render(() => (
      <ConfigProvider theme={{ token: { colorText: '#123456' } }}>
        <Watermark content="Confidential" />
      </ConfigProvider>
    ))

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain(
      'fill="rgba(18,52,86,0.15)"',
    )
  })

  it('falls back to content when an image watermark fails to load', async () => {
    vi.stubGlobal('Image', MockImage)
    const result = render(() => (
      <Watermark image="/missing.svg" content="Fallback">
        Content
      </Watermark>
    ))

    await new Promise((resolve) => setTimeout(resolve, 0))

    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement
    expect(decodeURIComponent(overlay.style.backgroundImage)).toContain('Fallback')
  })

  it('calls onRemove when the watermark element is removed', async () => {
    const onRemove = vi.fn()
    const result = render(() => <Watermark content="A" onRemove={onRemove} />)
    const overlay = result.container.querySelector('.ads-watermark-watermark') as HTMLElement

    overlay.remove()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(result.container.querySelector('.ads-watermark-watermark')).toBeTruthy()
  })

  it('passes watermark to registered panels when inherit is enabled', () => {
    function Panel() {
      const ref = useWatermarkPanelRef()
      return <div ref={ref}>Panel</div>
    }

    const result = render(() => (
      <Watermark content="A">
        <Panel />
      </Watermark>
    ))

    expect(result.getByText('Panel').querySelector('.ads-watermark-watermark')).toBeTruthy()
  })

  it('does not pass watermark to registered panels when inherit is disabled', () => {
    function Panel() {
      const ref = useWatermarkPanelRef()
      return <div ref={ref}>Panel</div>
    }

    const result = render(() => (
      <Watermark content="A" inherit={false}>
        <Panel />
      </Watermark>
    ))

    expect(result.getByText('Panel').querySelector('.ads-watermark-watermark')).toBeFalsy()
  })

  it('removes inherited watermarks when panels unmount', () => {
    function Panel() {
      const ref = useWatermarkPanelRef()
      return <div ref={ref}>Panel</div>
    }

    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <Watermark content="A">
          <button onClick={() => setOpen(false)}>close</button>
          {open() && <Panel />}
        </Watermark>
      )
    }

    const result = render(() => <Demo />)
    const panel = result.getByText('Panel')
    result.getByText('close').click()

    expect(panel.querySelector('.ads-watermark-watermark')).toBeFalsy()
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
