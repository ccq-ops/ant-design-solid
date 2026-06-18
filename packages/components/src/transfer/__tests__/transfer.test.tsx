import { fireEvent, render } from '@solidjs/testing-library'
import { For, createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Transfer } from '../index'
import type { TransferKey } from '../index'

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
    expect(
      result.getByRole('button', { name: 'move selected right' }).querySelector('svg'),
    ).toBeTruthy()

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
    const [targetKeys, setTargetKeys] = createSignal<TransferKey[]>([])
    const [selectedKeys, setSelectedKeys] = createSignal<TransferKey[]>(['1'])
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

  it('supports render, rowKey, actions, and direction-aware filtering', () => {
    const filterOption = vi.fn((input: string, item: { name: string }, direction: string) =>
      direction === 'left' ? item.name.toLowerCase().includes(input) : true,
    )
    const result = render(() => (
      <Transfer
        showSearch={{ placeholder: 'Find item', defaultValue: 'al' }}
        dataSource={[
          { id: 1, name: 'Alpha', description: 'First item' },
          { id: 2, name: 'Beta', description: 'Second item' },
        ]}
        rowKey={(record) => record.id}
        render={(item) => ({ label: <strong>{item.name}</strong>, value: item.name })}
        actions={['Choose', 'Return']}
        filterOption={filterOption}
      />
    ))

    expect(result.getAllByPlaceholderText('Find item')[0]).toHaveValue('al')
    expect(result.getByRole('button', { name: 'move selected right' })).toHaveTextContent('Choose')
    expect(result.getByRole('option', { name: /Alpha/ })).toBeTruthy()
    expect(result.queryByRole('option', { name: /Beta/ })).toBeNull()
    expect(filterOption).toHaveBeenCalledWith(
      'al',
      expect.objectContaining({ name: 'Alpha' }),
      'left',
    )
  })

  it('calls search and scroll callbacks for each panel', () => {
    const onSearch = vi.fn()
    const onScroll = vi.fn()
    const result = render(() => (
      <Transfer showSearch dataSource={dataSource} onSearch={onSearch} onScroll={onScroll} />
    ))

    fireEvent.input(result.getByPlaceholderText('Search source'), { target: { value: 'alp' } })
    fireEvent.scroll(result.getByRole('listbox', { name: 'source' }))

    expect(onSearch).toHaveBeenCalledWith('left', 'alp')
    expect(onScroll).toHaveBeenCalledWith('left', expect.any(Event))
  })

  it('keeps search input focused after typing', () => {
    const result = render(() => <Transfer showSearch dataSource={dataSource} />)
    const sourceSearch = result.getByPlaceholderText('Search source')

    sourceSearch.focus()
    fireEvent.input(sourceSearch, { target: { value: 'a' } })

    expect(document.activeElement).toBe(sourceSearch)
  })

  it('supports footer and children custom list body render props', () => {
    const result = render(() => (
      <Transfer dataSource={dataSource} footer={(_, info) => <span>{info?.direction} footer</span>}>
        {(listProps) => (
          <div data-testid={`${listProps.direction}-custom-body`}>
            <For each={listProps.filteredItems}>
              {(item) => (
                <button type="button" onClick={() => listProps.onItemSelect(item.key, true)}>
                  Pick {item.title}
                </button>
              )}
            </For>
          </div>
        )}
      </Transfer>
    ))

    expect(result.getByText('left footer')).toBeTruthy()
    expect(result.getByTestId('left-custom-body')).toBeTruthy()
    fireEvent.click(result.getByRole('button', { name: 'Pick Alpha' }))
    fireEvent.click(result.getByRole('button', { name: 'move selected right' }))
    expect(result.getByTestId('right-custom-body')).toHaveTextContent('Pick Alpha')
  })

  it('supports select all labels, oneWay mode, pagination, locale, status, and semantic styles', () => {
    const result = render(() => (
      <Transfer
        class="outer-transfer"
        dataSource={[
          { key: '1', title: 'Alpha' },
          { key: '2', title: 'Beta' },
          { key: '3', title: 'Gamma' },
        ]}
        locale={{
          titles: ['Left title', 'Right title'],
          notFoundContent: 'Nothing here',
          searchPlaceholder: 'Lookup',
        }}
        showSearch
        actions={['Add']}
        oneWay
        pagination={{ pageSize: 2 }}
        status="error"
        selectionsIcon={<span data-testid="selection-icon">S</span>}
        selectAllLabels={[
          ({ selectedCount, totalCount }) => `${selectedCount}/${totalCount} source`,
          'target selected',
        ]}
        classNames={{ root: 'semantic-root', item: 'semantic-item', actions: 'semantic-actions' }}
        styles={{ section: { width: '240px' }, actions: { margin: '4px' } }}
        listStyle={({ direction }) => ({
          'min-height': direction === 'left' ? '220px' : '210px',
        })}
        operationStyle={{ padding: '8px' }}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('outer-transfer')
    expect(result.container.firstElementChild).toHaveClass('semantic-root')
    expect(result.container.firstElementChild).toHaveClass('ads-transfer-status-error')
    expect(result.getByText('Left title')).toBeTruthy()
    expect(result.getAllByPlaceholderText('Lookup')).toHaveLength(2)
    expect(result.getAllByTestId('selection-icon')).toHaveLength(2)
    expect(result.getByText('0/2 source')).toBeTruthy()
    expect(result.getAllByRole('option')).toHaveLength(2)
    expect(result.queryByRole('button', { name: 'move selected left' })).toBeNull()
    expect(result.container.querySelector('.semantic-item')).toBeTruthy()
    expect(result.container.querySelector('.semantic-actions')).toHaveStyle({ margin: '4px' })
    expect(result.container.querySelector('[data-direction="left"]')).toHaveStyle({
      width: '240px',
    })
    expect(result.container.querySelector('[data-direction="left"]')).toHaveStyle({
      'min-height': '220px',
    })
    expect(result.getByRole('button', { name: 'move selected right' })).toHaveStyle({
      padding: '8px',
    })
  })

  it('exports Transfer.List, Transfer.Search, and Transfer.Operation helpers', () => {
    const result = render(() => (
      <>
        <Transfer.Search value="abc" onChange={() => {}} />
        <Transfer.Operation direction="right">Move</Transfer.Operation>
        <Transfer.List
          direction="left"
          items={dataSource}
          selectedKeys={[]}
          onItemSelect={() => {}}
        />
      </>
    ))

    expect(result.getByDisplayValue('abc')).toBeTruthy()
    expect(result.getByRole('button', { name: 'Move' })).toBeTruthy()
    expect(result.getByRole('option', { name: /Alpha/ })).toBeTruthy()
  })
})
