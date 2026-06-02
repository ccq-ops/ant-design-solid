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

  it('supports page size changes', () => {
    const onChange = vi.fn()
    const onShowSizeChange = vi.fn()
    render(() => (
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

    fireEvent.change(screen.getByLabelText('Page Size'), { target: { value: '20' } })

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
})
