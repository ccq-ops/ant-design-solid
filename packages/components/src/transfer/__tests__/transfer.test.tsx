import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Transfer } from '../index'

const dataSource = [
  { key: '1', title: 'Alpha', description: 'First item' },
  { key: '2', title: 'Beta', description: 'Second item' },
  { key: '3', title: 'Gamma', disabled: true },
]

describe('Transfer', () => {
  it('renders source and target panels with default titles', () => {
    const result = render(() => <Transfer dataSource={dataSource} targetKeys={['2']} />)

    expect(result.getByText('Source')).toBeTruthy()
    expect(result.getByText('Target')).toBeTruthy()
    expect(result.getByRole('option', { name: /Alpha/ })).toBeTruthy()
    expect(result.getByRole('option', { name: /Beta/ })).toBeTruthy()
  })

  it('selects source items and moves them right', () => {
    const onChange = vi.fn()
    const onSelectChange = vi.fn()
    const result = render(() => (
      <Transfer dataSource={dataSource} onChange={onChange} onSelectChange={onSelectChange} />
    ))

    fireEvent.click(result.getByRole('option', { name: /Alpha/ }))
    expect(onSelectChange).toHaveBeenCalledWith(['1'], [])

    fireEvent.click(result.getByRole('button', { name: 'move selected right' }))

    expect(onChange).toHaveBeenCalledWith(['1'], 'right', ['1'])
    expect(result.getByRole('option', { name: /Alpha/ })).toHaveAttribute('data-direction', 'right')
  })

  it('selects target items and moves them left', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Transfer defaultTargetKeys={['1', '2']} dataSource={dataSource} onChange={onChange} />
    ))

    fireEvent.click(result.getByRole('option', { name: /Beta/ }))
    fireEvent.click(result.getByRole('button', { name: 'move selected left' }))

    expect(onChange).toHaveBeenCalledWith(['1'], 'left', ['2'])
    expect(result.getByRole('option', { name: /Beta/ })).toHaveAttribute('data-direction', 'left')
  })

  it('supports controlled target keys and selected keys', () => {
    const [targetKeys, setTargetKeys] = createSignal<string[]>([])
    const [selectedKeys, setSelectedKeys] = createSignal<string[]>(['1'])
    const result = render(() => (
      <Transfer
        dataSource={dataSource}
        selectedKeys={selectedKeys()}
        targetKeys={targetKeys()}
        onChange={(next) => setTargetKeys(next)}
        onSelectChange={(source, target) => setSelectedKeys([...source, ...target])}
      />
    ))

    expect(result.getByRole('option', { name: /Alpha/ })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(result.getByRole('button', { name: 'move selected right' }))

    expect(result.getByRole('option', { name: /Alpha/ })).toHaveAttribute('data-direction', 'right')
  })

  it('supports search and custom titles and operations', () => {
    const result = render(() => (
      <Transfer
        showSearch
        dataSource={dataSource}
        titles={['Available', 'Chosen']}
        operations={['Add', 'Remove']}
      />
    ))

    expect(result.getByText('Available')).toBeTruthy()
    expect(result.getByText('Chosen')).toBeTruthy()
    expect(result.getByRole('button', { name: 'move selected right' })).toBeTruthy()

    fireEvent.input(result.getByPlaceholderText('Search source'), { target: { value: 'second' } })

    expect(result.queryByRole('option', { name: /Alpha/ })).toBeNull()
    expect(result.getByRole('option', { name: /Beta/ })).toBeTruthy()
  })

  it('ignores disabled component and item interactions', () => {
    const onChange = vi.fn()
    const result = render(() => <Transfer disabled dataSource={dataSource} onChange={onChange} />)

    fireEvent.click(result.getByRole('option', { name: /Alpha/ }))
    fireEvent.click(result.getByRole('button', { name: 'move selected right' }))

    expect(onChange).not.toHaveBeenCalled()

    const itemDisabled = render(() => <Transfer dataSource={dataSource} />)
    fireEvent.click(itemDisabled.getByRole('option', { name: /Gamma/ }))
    fireEvent.click(itemDisabled.getByRole('button', { name: 'move selected right' }))

    expect(itemDisabled.getByRole('option', { name: /Gamma/ })).toHaveAttribute(
      'data-direction',
      'left',
    )
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Transfer prefixCls="custom-transfer" dataSource={dataSource} />)
    expect(withProp.container.querySelector('.custom-transfer')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Transfer dataSource={dataSource} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-transfer')).toBeTruthy()
  })
})
