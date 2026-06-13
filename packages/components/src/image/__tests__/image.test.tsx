import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Image } from '../index'

afterEach(() => cleanup())

describe('Image', () => {
  test('renders image attributes', () => {
    const result = render(() => <Image src="/photo.png" alt="Photo" width={120} height="80px" />)
    const image = result.getByAltText('Photo') as HTMLImageElement

    expect(image.getAttribute('src')).toBe('/photo.png')
    expect(image.style.width).toBe('120px')
    expect(image.style.height).toBe('80px')
  })

  test('passes native image attributes and semantic classes to the correct nodes', () => {
    const result = render(() => (
      <Image
        src="/photo.png"
        alt="Semantic"
        loading="lazy"
        srcSet="/photo-2x.png 2x"
        crossOrigin="anonymous"
        class="root-class"
        rootClass="root-extra"
        classNames={{ root: 'semantic-root', image: 'semantic-image' }}
        styles={{ root: { margin: '4px' }, image: { 'object-fit': 'cover' } }}
      />
    ))
    const root = result.container.querySelector('.ads-image') as HTMLElement
    const image = result.getByAltText('Semantic') as HTMLImageElement

    expect(root).toHaveClass('root-class')
    expect(root).toHaveClass('root-extra')
    expect(root).toHaveClass('semantic-root')
    expect(root.style.margin).toBe('4px')
    expect(image).toHaveClass('semantic-image')
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.getAttribute('srcset')).toBe('/photo-2x.png 2x')
    expect(image.getAttribute('crossorigin')).toBe('anonymous')
    expect(image.style.objectFit).toBe('cover')
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

  test('supports preview object config with controlled open state', () => {
    const onOpenChange = vi.fn()
    const popupContainer = document.createElement('div')
    document.body.appendChild(popupContainer)
    const result = render(() => (
      <Image
        src="/thumb.png"
        alt="Controlled"
        preview={{
          open: true,
          src: '/preview.png',
          alt: 'Preview alt',
          zIndex: 1500,
          getContainer: () => popupContainer,
          onOpenChange,
        }}
      />
    ))

    expect(result.getByAltText('Controlled')).toBeTruthy()
    const preview = popupContainer.querySelector<HTMLElement>('.ads-image-preview')!
    const previewImage = popupContainer.querySelector<HTMLImageElement>('.ads-image-preview-img')!
    expect(preview).toBeTruthy()
    expect(preview.style.zIndex).toBe('1500')
    expect(previewImage.getAttribute('src')).toBe('/preview.png')
    expect(previewImage.getAttribute('alt')).toBe('Preview alt')

    fireEvent.click(popupContainer.querySelector('.ads-image-preview-close') as Element)
    expect(onOpenChange).toHaveBeenCalledWith(false, true)
    expect(popupContainer.querySelector('.ads-image-preview')).toBeTruthy()
  })

  test('supports uncontrolled preview object and deprecated visible callback', () => {
    const onVisibleChange = vi.fn()
    const result = render(() => (
      <Image src="/photo.png" alt="Uncontrolled" preview={{ onVisibleChange }} />
    ))

    fireEvent.click(result.getByAltText('Uncontrolled'))
    expect(document.body.querySelector('.ads-image-preview')).toBeTruthy()
    expect(onVisibleChange).toHaveBeenCalledWith(true, false)

    fireEvent.click(document.body.querySelector('.ads-image-preview-close') as Element)
    expect(onVisibleChange).toHaveBeenCalledWith(false, true)
    expect(document.body.querySelector('.ads-image-preview')).toBeNull()
  })

  test('updates controlled preview when parent changes open', () => {
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Image src="/photo.png" alt="Signal" preview={{ open: open() }} />
        </>
      )
    }
    const result = render(() => <Demo />)

    expect(document.body.querySelector('.ads-image-preview')).toBeNull()
    fireEvent.click(result.getByText('Open'))
    expect(document.body.querySelector('.ads-image-preview')).toBeTruthy()
  })

  test('supports preview transform toolbar actions', () => {
    const onTransform = vi.fn()
    const result = render(() => (
      <Image src="/photo.png" alt="Transform" preview={{ onTransform, scaleStep: 0.5 }} />
    ))

    fireEvent.click(result.getByAltText('Transform'))
    const previewImage = document.body.querySelector<HTMLElement>('.ads-image-preview-img')!

    fireEvent.click(document.body.querySelector('[aria-label="Zoom in"]') as Element)
    expect(previewImage.style.transform).toContain('scale3d(1.5, 1.5, 1)')
    expect(onTransform).toHaveBeenLastCalledWith({
      transform: { x: 0, y: 0, rotate: 0, scale: 1.5, flipX: false, flipY: false },
      action: 'zoomIn',
    })

    fireEvent.click(document.body.querySelector('[aria-label="Rotate right"]') as Element)
    expect(previewImage.style.transform).toContain('rotate(90deg)')
    expect(onTransform).toHaveBeenLastCalledWith({
      transform: { x: 0, y: 0, rotate: 90, scale: 1.5, flipX: false, flipY: false },
      action: 'rotateRight',
    })

    fireEvent.click(document.body.querySelector('[aria-label="Flip X"]') as Element)
    expect(previewImage.style.transform).toContain('scale3d(-1.5, 1.5, 1)')
    expect(onTransform).toHaveBeenLastCalledWith({
      transform: { x: 0, y: 0, rotate: 90, scale: 1.5, flipX: true, flipY: false },
      action: 'flipX',
    })

    fireEvent.dblClick(previewImage)
    expect(previewImage.style.transform).toContain('scale3d(1, 1, 1)')
    expect(onTransform).toHaveBeenLastCalledWith({
      transform: { x: 0, y: 0, rotate: 0, scale: 1, flipX: false, flipY: false },
      action: 'reset',
    })
  })

  test('supports progress placeholder configuration', () => {
    const result = render(() => (
      <Image
        src="/photo.png"
        alt="Progress"
        width={120}
        height={80}
        placeholder={{ progress: { percent: 37 } }}
      />
    ))
    const progress = result.getByRole('progressbar')

    expect(progress).toHaveClass('ads-image-progress-wrapper')
    expect(progress.getAttribute('aria-valuenow')).toBe('37')
    expect(result.getByText('37%')).toBeTruthy()
  })

  test('supports preview customization hooks and aliases', () => {
    const closeIcon = <span>Close custom</span>
    const result = render(() => (
      <Image
        src="/photo.png"
        alt="Custom hooks"
        preview={{
          mask: false,
          closeIcon,
          cover: <span>Preview cover</span>,
          imageRender: (node) => <div data-testid="image-render">{node}</div>,
          actionsRender: (node) => <div data-testid="actions-render">{node}</div>,
          toolbarRender: (node) => <div data-testid="toolbar-render">{node}</div>,
        }}
      />
    ))

    expect(result.getByText('Preview cover').closest('.ads-image-cover')).toBeTruthy()
    fireEvent.click(result.getByAltText('Custom hooks'))

    expect(document.body.querySelector('.ads-image-preview-mask-hidden')).toBeTruthy()
    expect(document.body.textContent).toContain('Close custom')
    expect(document.body.querySelector('[data-testid="image-render"]')).toBeTruthy()
    expect(document.body.querySelector('[data-testid="actions-render"]')).toBeTruthy()
    expect(document.body.querySelector('[data-testid="toolbar-render"]')).toBeTruthy()
  })

  test('supports PreviewGroup child registration and switching', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Image.PreviewGroup preview={{ onChange, onOpenChange }}>
        <Image src="/one.png" alt="One" />
        <Image src="/two.png" alt="Two" />
      </Image.PreviewGroup>
    ))

    fireEvent.click(result.getByAltText('Two'))
    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('src')).toBe(
      '/two.png',
    )
    expect(onOpenChange).toHaveBeenCalledWith(true, { current: 1 })

    fireEvent.click(document.body.querySelector('[aria-label="Previous image"]') as Element)
    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('src')).toBe(
      '/one.png',
    )
    expect(onChange).toHaveBeenCalledWith(0, 1)

    fireEvent.click(document.body.querySelector('[aria-label="Next image"]') as Element)
    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('src')).toBe(
      '/two.png',
    )
    expect(onChange).toHaveBeenCalledWith(1, 0)
  })

  test('supports PreviewGroup items and countRender', () => {
    render(() => (
      <Image.PreviewGroup
        items={['/one.png', { src: '/two.png', alt: 'Second' }]}
        preview={{
          defaultOpen: true,
          defaultCurrent: 1,
          countRender: (current, total) => `${current}/${total}`,
        }}
      />
    ))

    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('src')).toBe(
      '/two.png',
    )
    expect(document.body.querySelector('.ads-image-preview-img')?.getAttribute('alt')).toBe(
      'Second',
    )
    expect(document.body.textContent).toContain('2/2')
  })

  test('renders antd v6 preview and progress class structure', () => {
    const result = render(() => (
      <Image
        src="/photo.png"
        alt="Classes"
        placeholder={{ progress: true }}
        preview={{ cover: <span>Cover</span> }}
      />
    ))

    expect(result.container.querySelector('.ads-image-cover')).toBeTruthy()
    expect(result.container.querySelector('.ads-image-progress-wrapper')).toBeTruthy()

    fireEvent.click(result.getByAltText('Classes'))
    expect(document.body.querySelector('.ads-image-preview-mask')).toBeTruthy()
    expect(document.body.querySelector('.ads-image-preview-body')).toBeTruthy()
    expect(document.body.querySelector('.ads-image-preview-footer')).toBeTruthy()
    expect(document.body.querySelector('.ads-image-preview-actions')).toBeTruthy()
  })
})
