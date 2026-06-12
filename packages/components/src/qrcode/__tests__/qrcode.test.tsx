import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { QRCode } from '../index'

describe('QRCode', () => {
  it('renders a deterministic SVG matrix for a value', () => {
    const first = render(() => <QRCode value="https://example.com" />)
    const second = render(() => <QRCode value="https://example.com" />)
    const firstSvg = first.container.querySelector('svg') as SVGElement
    const secondSvg = second.container.querySelector('svg') as SVGElement
    expect(firstSvg).toBeInTheDocument()
    expect(firstSvg.innerHTML).toBe(secondSvg.innerHTML)
    expect(firstSvg.querySelectorAll('rect').length).toBeGreaterThan(20)
  })

  it('supports canvas rendering', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D)
    const result = render(() => <QRCode value="solid" type="canvas" data-testid="qr" />)

    expect(result.getByTestId('qr').querySelector('canvas')).toBeInTheDocument()
    expect(result.getByTestId('qr').querySelector('svg')).not.toBeInTheDocument()
  })

  it('supports svg rendering explicitly', () => {
    const result = render(() => <QRCode value="solid" type="svg" data-testid="qr" />)

    expect(result.getByTestId('qr').querySelector('svg')).toBeInTheDocument()
    expect(result.getByTestId('qr').querySelector('canvas')).not.toBeInTheDocument()
  })

  it('encodes array values and forwards error correction options', () => {
    const low = render(() => <QRCode value={['solid', 'qr']} errorLevel="L" />)
    const high = render(() => <QRCode value={['solid', 'qr']} errorLevel="H" boostLevel={false} />)

    const lowModules = low.container.querySelectorAll('rect[data-module="true"]').length
    const highModules = high.container.querySelectorAll('rect[data-module="true"]').length
    expect(lowModules).toBeGreaterThan(20)
    expect(highModules).toBeGreaterThan(20)
    expect(low.container.querySelector('svg')?.innerHTML).not.toBe(
      high.container.querySelector('svg')?.innerHTML,
    )
  })

  it('applies size, color, background and bordered classes', () => {
    const result = render(() => (
      <QRCode value="solid" size={120} color="#111111" bgColor="#eeeeee" data-testid="qr" />
    ))
    const root = result.getByTestId('qr')
    const svg = root.querySelector('svg') as SVGElement
    expect(root.className).toContain('ads-qrcode')
    expect(root.className).toContain('ads-qrcode-bordered')
    expect(root.style.width).toBe('120px')
    expect(root.style.height).toBe('120px')
    expect(root.style.backgroundColor).toBe('rgb(238, 238, 238)')
    expect(svg.getAttribute('width')).toBe('120')
    expect(svg.querySelector('rect[data-module="true"]')?.getAttribute('fill')).toBe('#111111')
  })

  it('supports bordered=false', () => {
    const result = render(() => <QRCode value="solid" bordered={false} data-testid="qr" />)
    expect(result.getByTestId('qr').className).not.toContain('ads-qrcode-bordered')
  })

  it('renders centered icon', () => {
    const result = render(() => <QRCode value="solid" icon="/logo.png" iconSize={32} />)
    const image = result.container.querySelector('image') as SVGImageElement
    expect(image).toBeInTheDocument()
    expect(image.getAttribute('href')).toBe('/logo.png')
    expect(image.getAttribute('width')).toBe('32')
    expect(image.getAttribute('height')).toBe('32')
  })

  it('supports iconSize as width and height', () => {
    const result = render(() => (
      <QRCode value="solid" icon="/logo.png" iconSize={{ width: 24, height: 32 }} />
    ))
    const image = result.container.querySelector('image') as SVGImageElement

    expect(image.getAttribute('width')).toBe('24')
    expect(image.getAttribute('height')).toBe('32')
    expect(image.getAttribute('x')).toBe('68')
    expect(image.getAttribute('y')).toBe('64')
  })

  it('applies marginSize as quiet zone modules', () => {
    const result = render(() => <QRCode value="solid" marginSize={2} />)
    const svg = result.container.querySelector('svg') as SVGElement
    const firstModule = svg.querySelector('rect[data-module="true"]') as SVGRectElement
    const moduleSize = Number(firstModule.getAttribute('width'))

    expect(Number(firstModule.getAttribute('x'))).toBe(moduleSize * 2)
    expect(Number(firstModule.getAttribute('y'))).toBe(moduleSize * 2)
  })

  it('shows loading and expired overlays', () => {
    const loading = render(() => <QRCode value="solid" status="loading" />)
    expect(loading.getByText('Loading...')).toBeInTheDocument()
    const expired = render(() => <QRCode value="solid" status="expired" />)
    expect(expired.getByText('Expired')).toBeInTheDocument()
  })

  it('shows scanned overlay', () => {
    const scanned = render(() => <QRCode value="solid" status="scanned" />)

    expect(scanned.getByText('Scanned')).toBeInTheDocument()
  })

  it('supports custom statusRender', () => {
    const result = render(() => (
      <QRCode
        value="solid"
        status="expired"
        statusRender={({ locale, onRefresh, status }) => (
          <button onClick={onRefresh}>{`${status}:${locale.expired}`}</button>
        )}
        onRefresh={() => undefined}
      />
    ))
    expect(result.getByRole('button', { name: 'expired:Expired' })).toBeInTheDocument()
  })

  it('supports semantic classes and styles', () => {
    const result = render(() => (
      <QRCode
        value="solid"
        status="loading"
        classes={{ root: 'root-class', image: 'image-class', cover: 'cover-class' }}
        styles={{ root: { margin: '4px' }, image: { opacity: 0.5 }, cover: { color: 'red' } }}
        data-testid="qr"
      />
    ))
    const root = result.getByTestId('qr')
    const svg = root.querySelector('svg') as SVGElement
    const cover = root.querySelector('.cover-class') as HTMLElement

    expect(root.className).toContain('root-class')
    expect(root.style.margin).toBe('4px')
    expect(svg.classList.contains('image-class')).toBe(true)
    expect(svg.style.opacity).toBe('0.5')
    expect(cover.style.color).toBe('red')
  })

  it('supports custom prefixCls', () => {
    const result = render(() => <QRCode prefixCls="custom-qr" value="solid" data-testid="qr" />)
    expect(result.getByTestId('qr').className).toContain('custom-qr')
  })

  it('uses ConfigProvider prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <QRCode value="solid" data-testid="qr" />
      </ConfigProvider>
    ))
    expect(result.getByTestId('qr').className).toContain('custom-qrcode')
  })
})
