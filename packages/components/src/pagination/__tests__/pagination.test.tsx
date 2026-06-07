import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  afterEach(() => cleanup())

  it('changes uncontrolled page and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <Pagination total={100} defaultCurrent={1} pageSize={10} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))

    expect(onChange).toHaveBeenLastCalledWith(2, 10)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('disables prev and next at boundaries', () => {
    render(() => <Pagination total={20} defaultCurrent={1} pageSize={10} />)

    expect(screen.getByRole('button', { name: 'Previous Page' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled()
  })

  it('supports controlled current', () => {
    function Demo() {
      const [current, setCurrent] = createSignal(1)
      return <Pagination total={30} current={current()} onChange={setCurrent} />
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('supports simple mode input commit', () => {
    const onChange = vi.fn()
    render(() => (
      <Pagination simple total={50} defaultCurrent={1} pageSize={10} onChange={onChange} />
    ))

    const input = screen.getByLabelText('Page')
    fireEvent.input(input, { target: { value: '4' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenLastCalledWith(4, 10)
  })

  it('scopes page size Select sizing styles to the selector element', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Pagination total={100} showSizeChanger />
      </StyleProvider>
    ))

    const styles = extractStyle(cache)

    expect(styles).toContain('.ads-pagination-select [role="combobox"]')
    expect(styles).not.toContain('.ads-pagination-select{height:')
    expect(styles).not.toContain('.ads-pagination-select{padding:')
  })

  it('uses the library Select for page size changes', () => {
    const onChange = vi.fn()
    const onShowSizeChange = vi.fn()
    const { container } = render(() => (
      <Pagination
        total={100}
        defaultCurrent={3}
        defaultPageSize={10}
        showSizeChanger
        pageSizeOptions={[10, 20]}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
      />
    ))

    expect(container.querySelector('select')).toBeNull()

    const pageSizeSelect = screen.getByRole('combobox', { name: 'Page Size' })
    expect(pageSizeSelect.closest('.ads-select')).toBeTruthy()

    fireEvent.click(pageSizeSelect)
    fireEvent.click(screen.getByRole('option', { name: '20 / page' }))

    expect(onShowSizeChange).toHaveBeenLastCalledWith(3, 20)
    expect(onChange).toHaveBeenLastCalledWith(3, 20)
  })

  it('supports quick jumper and hideOnSinglePage', () => {
    const onChange = vi.fn()
    const { container } = render(() => (
      <>
        <Pagination total={100} showQuickJumper onChange={onChange} />
        <Pagination total={5} hideOnSinglePage />
      </>
    ))

    const jumpInput = screen.getByLabelText('Quick jump to page')
    fireEvent.input(jumpInput, { target: { value: '5' } })
    fireEvent.keyDown(jumpInput, { key: 'Enter' })

    expect(onChange).toHaveBeenLastCalledWith(5, 10)
    expect(container.querySelectorAll('.ads-pagination').length).toBe(1)
  })

  it('does not double commit quick jumper when Enter is followed by blur', () => {
    const onChange = vi.fn()
    render(() => <Pagination total={100} showQuickJumper onChange={onChange} />)

    const jumpInput = screen.getByLabelText('Quick jump to page')
    fireEvent.input(jumpInput, { target: { value: '5' } })
    fireEvent.keyDown(jumpInput, { key: 'Enter' })
    fireEvent.blur(jumpInput)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(5, 10)
    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not reset simple mode when blank input blurs after Enter', () => {
    const onChange = vi.fn()
    render(() => (
      <Pagination simple total={50} defaultCurrent={1} pageSize={10} onChange={onChange} />
    ))

    const input = screen.getByLabelText('Page')
    fireEvent.input(input, { target: { value: '4' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.input(input, { target: { value: ' ' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(4, 10)
    expect(input).toHaveValue('4')
  })
  it('shows size changer automatically when total is above the default boundary', () => {
    render(() => <Pagination total={51} />)

    expect(screen.getByLabelText('Page Size')).toBeInTheDocument()
  })

  it('respects totalBoundaryShowSizeChanger for automatic size changer visibility', () => {
    render(() => <Pagination total={80} totalBoundaryShowSizeChanger={100} />)

    expect(screen.queryByLabelText('Page Size')).not.toBeInTheDocument()
  })

  it('supports custom item rendering for page, prev, and next items', () => {
    render(() => (
      <Pagination
        total={30}
        itemRender={(page, type, _originalElement) => {
          if (type === 'prev') return <span>Previous custom</span>
          if (type === 'next') return <span>Next custom</span>
          return <span>Page custom {page}</span>
        }}
      />
    ))

    expect(screen.getByRole('button', { name: 'Previous Page' })).toHaveTextContent(
      'Previous custom',
    )
    expect(screen.getByRole('button', { name: 'Next Page' })).toHaveTextContent('Next custom')
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveTextContent('Page custom 2')
  })

  it('supports readonly simple mode', () => {
    const onChange = vi.fn()
    render(() => (
      <Pagination
        simple={{ readOnly: true }}
        total={50}
        defaultCurrent={1}
        pageSize={10}
        onChange={onChange}
      />
    ))

    const input = screen.getByLabelText('Page')
    expect(input).toHaveAttribute('readonly')
    fireEvent.input(input, { target: { value: '4' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports quick jumper goButton object form', () => {
    const onChange = vi.fn()
    render(() => (
      <Pagination
        total={100}
        showQuickJumper={{ goButton: <button type="button">Go now</button> }}
        onChange={onChange}
      />
    ))

    fireEvent.input(screen.getByLabelText('Quick jump to page'), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('button', { name: 'Go now' }))

    expect(onChange).toHaveBeenLastCalledWith(6, 10)
  })

  it('renders fewer page buttons when showLessItems is enabled', () => {
    const { container: normalContainer } = render(() => (
      <Pagination total={200} defaultCurrent={10} pageSize={10} />
    ))
    const normalPageCount = normalContainer.querySelectorAll('.ads-pagination-item').length
    cleanup()

    const { container: lessContainer } = render(() => (
      <Pagination total={200} defaultCurrent={10} pageSize={10} showLessItems />
    ))
    const lessPageCount = lessContainer.querySelectorAll('.ads-pagination-item').length

    expect(lessPageCount).toBeLessThan(normalPageCount)
  })

  it('can disable title attributes on page controls', () => {
    render(() => <Pagination total={30} showTitle={false} />)

    expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('title')
    expect(screen.getByRole('button', { name: 'Previous Page' })).not.toHaveAttribute('title')
    expect(screen.getByRole('button', { name: 'Next Page' })).not.toHaveAttribute('title')
  })

  it('applies align, size, semantic classNames, and semantic styles', () => {
    const { container } = render(() => (
      <Pagination
        total={30}
        align="center"
        size="small"
        classNames={{ root: 'custom-root', itemButton: 'custom-button' }}
        styles={{ root: { color: 'red' }, itemButton: { background: 'blue' } }}
      />
    ))

    const root = container.querySelector('.ads-pagination')
    expect(root).toHaveClass('ads-pagination-align-center')
    expect(root).toHaveClass('ads-pagination-small')
    expect(root).toHaveClass('custom-root')
    expect(root).toHaveStyle('color: rgb(255, 0, 0)')

    const pageButton = screen.getByRole('button', { name: 'Page 2' })
    expect(pageButton).toHaveClass('custom-button')
    expect(pageButton).toHaveStyle('background: blue')
  })
})
