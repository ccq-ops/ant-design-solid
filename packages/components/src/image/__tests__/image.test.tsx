import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Image } from '../index'

describe('Image', () => {
  test('renders image attributes', () => {
    const result = render(() => <Image src="/photo.png" alt="Photo" width={120} height="80px" />)
    const image = result.getByAltText('Photo') as HTMLImageElement

    expect(image.getAttribute('src')).toBe('/photo.png')
    expect(image.style.width).toBe('120px')
    expect(image.style.height).toBe('80px')
  })

  test('shows placeholder before load and hides it after load', async () => {
    const result = render(() => <Image src="/photo.png" alt="Photo" placeholder="Loading image" />)
    const image = result.getByAltText('Photo')

    expect(result.getByText('Loading image')).toBeTruthy()
    fireEvent.load(image)
    expect(result.queryByText('Loading image')).toBeNull()
  })

  test('uses fallback after image error', () => {
    const result = render(() => <Image src="/broken.png" fallback="/fallback.png" alt="Broken" />)
    const image = result.getByAltText('Broken') as HTMLImageElement

    fireEvent.error(image)
    expect(image.getAttribute('src')).toBe('/fallback.png')
  })

  test('opens and closes preview when enabled', () => {
    const result = render(() => <Image src="/photo.png" alt="Previewable" />)
    const image = result.getByAltText('Previewable')

    fireEvent.click(image)
    expect(document.body.querySelector('.ads-image-preview')).toBeTruthy()
    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('src')).toBe(
      '/photo.png',
    )

    fireEvent.click(document.body.querySelector('.ads-image-preview-close') as Element)
    expect(document.body.querySelector('.ads-image-preview')).toBeNull()
  })

  test('does not open preview when preview is false', () => {
    const result = render(() => <Image preview={false} src="/photo.png" alt="Static" />)

    fireEvent.click(result.getByAltText('Static'))
    expect(document.body.querySelector('.ads-image-preview')).toBeNull()
  })

  test('supports custom and config provider prefixes', () => {
    const custom = render(() => <Image prefixCls="custom-image" src="/photo.png" alt="Custom" />)
    expect(custom.container.querySelector('.custom-image')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Image src="/photo.png" alt="Configured" />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-image')).toBeTruthy()
  })

  test('uses shared zIndex and custom popup container for preview', () => {
    const popupContainer = document.createElement('div')
    document.body.appendChild(popupContainer)
    const result = render(() => (
      <Image
        src="/photo.png"
        alt="Custom preview"
        zIndex={1411}
        getPopupContainer={() => popupContainer}
      />
    ))

    fireEvent.click(result.getByAltText('Custom preview'))

    const preview = popupContainer.querySelector<HTMLElement>('.ads-image-preview')!
    expect(preview).toBeTruthy()
    expect(document.body.firstElementChild).not.toBe(preview)
    expect(preview.style.zIndex).toBe('1411')
  })
})
