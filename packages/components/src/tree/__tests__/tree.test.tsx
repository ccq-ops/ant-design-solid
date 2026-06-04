import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tree } from '../index'
import type { TreeKey } from '../index'

const treeData = [
  {
    title: 'Asia',
    key: 'asia',
    children: [
      { title: 'China', key: 'china' },
      { title: 'Japan', key: 'japan', disabled: true },
    ],
  },
  { title: 'Europe', key: 'europe' },
]

describe('Tree', () => {
  it('renders tree nodes and expands nested nodes', () => {
    const onExpand = vi.fn()
    const result = render(() => <Tree treeData={treeData} onExpand={onExpand} />)

    expect(result.getByRole('tree')).toBeTruthy()
    expect(result.getByRole('treeitem', { name: /Asia/ })).toBeTruthy()
    expect(result.queryByRole('treeitem', { name: /China/ })).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'expand Asia' }))

    expect(result.getByRole('treeitem', { name: /China/ })).toBeTruthy()
    expect(onExpand).toHaveBeenCalledWith(['asia'], expect.objectContaining({ expanded: true }))
  })

  it('supports selectable, selectedKeys, disabled nodes, and onSelect', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <Tree defaultExpandedKeys={['asia']} treeData={treeData} onSelect={onSelect} />
    ))

    fireEvent.click(result.getByRole('treeitem', { name: /China/ }))
    expect(onSelect).toHaveBeenCalledWith(['china'], expect.objectContaining({ selected: true }))
    expect(result.getByRole('treeitem', { name: /China/ })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(result.getByRole('treeitem', { name: /Japan/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('supports checkable trees and checkedKeys', () => {
    const onCheck = vi.fn()
    const result = render(() => (
      <Tree checkable defaultExpandedKeys={['asia']} treeData={treeData} onCheck={onCheck} />
    ))

    fireEvent.click(result.getByRole('checkbox', { name: 'check China' }))

    expect(onCheck).toHaveBeenCalledWith(['china'], expect.objectContaining({ checked: true }))
    expect(result.getByRole('checkbox', { name: 'check China' })).toBeChecked()
  })

  it('supports controlled expanded and selected keys', () => {
    const [expandedKeys, setExpandedKeys] = createSignal<TreeKey[]>([])
    const [selectedKeys, setSelectedKeys] = createSignal<TreeKey[]>(['europe'])
    const result = render(() => (
      <Tree
        expandedKeys={expandedKeys()}
        selectedKeys={selectedKeys()}
        treeData={treeData}
        onExpand={(keys) => setExpandedKeys(keys)}
        onSelect={(keys) => setSelectedKeys(keys)}
      />
    ))

    expect(result.getByRole('treeitem', { name: /Europe/ })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(result.getByRole('button', { name: 'expand Asia' }))
    expect(result.getByRole('treeitem', { name: /China/ })).toBeTruthy()
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Tree prefixCls="custom-tree" treeData={treeData} />)
    expect(withProp.container.querySelector('.custom-tree')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tree treeData={treeData} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-tree')).toBeTruthy()
  })
})
