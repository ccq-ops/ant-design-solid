import { StyleProvider, createCache, extractStyle } from '@solid-ant-design/cssinjs'
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { DirectoryTree, Tree, TreeNode } from '../index'
import type { TreeKey, TreeRef } from '../index'

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

function largeTreeData(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    title: `Node ${index}`,
    key: `node-${index}`,
  }))
}

describe('Tree', () => {
  it('renders tree nodes and expands nested nodes', () => {
    const onExpand = vi.fn()
    const result = render(() => <Tree treeData={treeData} onExpand={onExpand} />)

    expect(result.getByRole('tree')).toBeTruthy()
    expect(result.getByRole('treeitem', { name: /Asia/ })).toBeTruthy()
    expect(result.queryByRole('treeitem', { name: /China/ })).toBeNull()
    expect(result.getByRole('button', { name: 'expand Asia' }).querySelector('svg')).toBeTruthy()

    fireEvent.click(result.getByRole('button', { name: 'expand Asia' }))

    expect(result.getByRole('treeitem', { name: /China/ })).toBeTruthy()
    expect(onExpand).toHaveBeenCalledWith(['asia'], expect.objectContaining({ expanded: true }))
  })

  it('keeps visible root nodes after collapsing an expanded node', () => {
    const result = render(() => <Tree defaultExpandedKeys={['asia']} treeData={treeData} />)

    fireEvent.click(result.getByRole('button', { name: 'collapse Asia' }))

    expect(result.getByRole('treeitem', { name: /Asia/ })).not.toHaveStyle({ opacity: '0' })
    expect(result.getByRole('treeitem', { name: /Europe/ })).not.toHaveStyle({ opacity: '0' })
    expect(result.queryByRole('treeitem', { name: /China/ })).toBeNull()
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

    expect(onCheck).toHaveBeenCalledWith(
      ['china', 'asia'],
      expect.objectContaining({ checked: true }),
    )
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

    expect(result.getByRole('treeitem', { name: /Europe/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
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

  it('supports fieldNames, titleRender, defaultExpandAll, and defaultExpandParent', () => {
    const customData = [
      {
        label: 'Root',
        id: 'root',
        nodes: [{ label: 'Leaf', id: 'leaf' }],
      },
    ]

    const expandedParent = render(() => (
      <Tree
        defaultExpandedKeys={['leaf']}
        defaultExpandParent
        fieldNames={{ title: 'label', key: 'id', children: 'nodes' }}
        treeData={customData}
        titleRender={(node) => <span>Rendered {String(node.label)}</span>}
      />
    ))

    expect(expandedParent.getByText('Rendered Root')).toBeTruthy()
    expect(expandedParent.getByText('Rendered Leaf')).toBeTruthy()

    const expandedAll = render(() => (
      <Tree
        defaultExpandAll
        fieldNames={{ title: 'label', key: 'id', children: 'nodes' }}
        treeData={customData}
      />
    ))

    expect(expandedAll.getByRole('treeitem', { name: /Leaf/ })).toBeTruthy()
  })

  it('supports multiple selection and emits native select events', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <Tree multiple defaultExpandedKeys={['asia']} treeData={treeData} onSelect={onSelect} />
    ))

    fireEvent.click(result.getByRole('treeitem', { name: /China/ }))
    fireEvent.click(result.getByRole('treeitem', { name: /Europe/ }))

    expect(onSelect).toHaveBeenLastCalledWith(
      ['china', 'europe'],
      expect.objectContaining({
        event: expect.any(MouseEvent),
        selected: true,
      }),
    )
    expect(result.getByRole('treeitem', { name: /China/ })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByRole('treeitem', { name: /Europe/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('conducts checks between parents and children and reports half checked keys', () => {
    const onCheck = vi.fn()
    const result = render(() => (
      <Tree checkable defaultExpandedKeys={['asia']} treeData={treeData} onCheck={onCheck} />
    ))

    fireEvent.click(result.getByRole('checkbox', { name: 'check Asia' }))

    expect(onCheck).toHaveBeenLastCalledWith(
      ['asia', 'china'],
      expect.objectContaining({
        checked: true,
        halfCheckedKeys: [],
      }),
    )
    expect(result.getByRole('checkbox', { name: 'check China' })).toBeChecked()
    expect(result.getByRole('checkbox', { name: 'check Japan' })).not.toBeChecked()

    fireEvent.click(result.getByRole('checkbox', { name: 'check China' }))

    expect(onCheck).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        checked: false,
        halfCheckedKeys: [],
      }),
    )
  })

  it('supports checkStrictly without parent-child conduction', () => {
    const onCheck = vi.fn()
    const result = render(() => (
      <Tree
        checkable
        checkStrictly
        defaultExpandedKeys={['asia']}
        treeData={treeData}
        onCheck={onCheck}
      />
    ))

    fireEvent.click(result.getByRole('checkbox', { name: 'check Asia' }))

    expect(onCheck).toHaveBeenLastCalledWith(
      { checked: ['asia'], halfChecked: [] },
      expect.objectContaining({ checked: true }),
    )
    expect(result.getByRole('checkbox', { name: 'check China' })).not.toBeChecked()
  })

  it('supports icons, switcherIcon, showLeafIcon, and mouse callbacks', () => {
    const onDoubleClick = vi.fn()
    const onRightClick = vi.fn()
    const result = render(() => (
      <Tree
        defaultExpandAll
        showIcon
        showLine={{ showLeafIcon: <span data-testid="leaf-icon">leaf</span> }}
        switcherIcon={({ expanded }) => <span data-testid="switcher">{expanded ? '-' : '+'}</span>}
        icon={({ selected }) => <span data-testid="node-icon">{selected ? 'S' : 'N'}</span>}
        treeData={treeData}
        onDoubleClick={onDoubleClick}
        onRightClick={onRightClick}
      />
    ))

    expect(result.getAllByTestId('node-icon')).toHaveLength(4)
    expect(result.getByTestId('switcher')).toHaveTextContent('-')
    expect(result.getAllByTestId('leaf-icon')).toHaveLength(3)

    fireEvent.doubleClick(result.getByRole('treeitem', { name: /China/ }))
    fireEvent.contextMenu(result.getByRole('treeitem', { name: /China/ }))

    expect(onDoubleClick).toHaveBeenCalledWith(expect.any(MouseEvent), treeData[0].children?.[0])
    expect(onRightClick).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.any(MouseEvent),
        node: treeData[0].children?.[0],
      }),
    )
  })

  it('supports loadData, loadedKeys, switcherLoadingIcon, and onLoad', async () => {
    const asyncData = [{ title: 'Async', key: 'async', isLeaf: false }]
    const loadData = vi.fn(() => Promise.resolve())
    const onLoad = vi.fn()
    const result = render(() => (
      <Tree
        treeData={asyncData}
        loadData={loadData}
        onLoad={onLoad}
        switcherLoadingIcon={<span data-testid="loading">loading</span>}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'expand Async' }))

    expect(loadData).toHaveBeenCalledWith(asyncData[0])
    expect(result.getByTestId('loading')).toBeTruthy()

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(
        ['async'],
        expect.objectContaining({ node: asyncData[0] }),
      )
    })
  })

  it('respects controlled loadedKeys by not loading already loaded nodes', () => {
    const asyncData = [{ title: 'Async', key: 'async', isLeaf: false }]
    const loadData = vi.fn()
    const result = render(() => (
      <Tree treeData={asyncData} loadData={loadData} loadedKeys={['async']} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'expand Async' }))

    expect(loadData).not.toHaveBeenCalled()
  })

  it('supports filterTreeNode and semantic classNames/styles/rootStyle', () => {
    const result = render(() => (
      <Tree
        defaultExpandAll
        treeData={treeData}
        rootStyle={{ color: 'rgb(1, 2, 3)' }}
        classNames={{
          root: 'tree-root',
          item: 'tree-item',
          itemTitle: 'tree-title',
          itemSwitcher: 'tree-switcher',
        }}
        styles={{ itemTitle: { 'font-weight': '700' } }}
        filterTreeNode={(node) => node.key === 'china'}
      />
    ))

    expect(result.getByRole('tree')).toHaveClass('tree-root')
    expect(result.getByRole('tree')).toHaveStyle({ color: 'rgb(1, 2, 3)' })
    expect(result.getByRole('treeitem', { name: /China/ })).toHaveClass('tree-item')
    expect(
      result.getByRole('treeitem', { name: /China/ }).querySelector('.tree-title'),
    ).toHaveStyle({
      'font-weight': '700',
    })
    expect(result.getByRole('treeitem', { name: /China/ })).toHaveClass('ads-tree-node-filtered')
    expect(result.getByRole('button', { name: 'collapse Asia' })).toHaveClass('tree-switcher')
  })

  it('supports semantic classNames and styles as functions', () => {
    const result = render(() => (
      <Tree
        defaultExpandAll
        treeData={treeData}
        classNames={() => ({ itemTitle: 'fn-title' })}
        styles={() => ({ itemTitle: { color: 'rgb(4, 5, 6)' } })}
      />
    ))

    expect(result.getByRole('treeitem', { name: /China/ }).querySelector('.fn-title')).toHaveStyle({
      color: 'rgb(4, 5, 6)',
    })
  })

  it('supports TreeNode children syntax', () => {
    const result = render(() => (
      <Tree defaultExpandAll>
        <TreeNode title="Parent" key="parent">
          <TreeNode title="Child" key="child" />
        </TreeNode>
      </Tree>
    ))

    expect(result.getByRole('treeitem', { name: /Parent/ })).toBeTruthy()
    expect(result.getByRole('treeitem', { name: /Child/ })).toBeTruthy()
  })

  it('supports scrollTo through Tree ref', () => {
    let treeRef: TreeRef | undefined
    const result = render(() => (
      <Tree
        defaultExpandAll
        height={80}
        ref={(ref) => {
          treeRef = ref
        }}
        treeData={treeData}
      />
    ))
    const root = result.getByRole('tree')
    const china = result.getByRole('treeitem', { name: /China/ })
    china.scrollIntoView = vi.fn()

    treeRef?.scrollTo({ key: 'china', align: 'top', offset: 12 })

    expect(china.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    expect(root.scrollTop).toBe(12)
  })

  it('virtualizes visible nodes when height is set and virtual is enabled', () => {
    const result = render(() => <Tree height={120} treeData={largeTreeData(100)} />)
    const root = result.getByRole('tree')

    expect(root).toHaveAttribute('data-virtual', 'true')
    expect(root).toHaveStyle({ height: '120px', overflow: 'auto' })
    expect(result.getAllByRole('treeitem').length).toBeLessThan(100)
    expect(result.container.querySelector('.ads-tree-virtual-holder')).toHaveStyle({
      height: `${100 * 24}px`,
    })
  })

  it('updates virtualized nodes after collapsing an expanded node', async () => {
    const result = render(() => <Tree defaultExpandAll height={120} treeData={treeData} />)

    expect(result.getByRole('treeitem', { name: /China/ })).toBeTruthy()
    expect(result.container.querySelector('.ads-tree-virtual-holder')).toHaveStyle({
      height: `${4 * 24}px`,
    })

    await waitFor(() => {
      expect(result.getByRole('tree')).toHaveAttribute('data-virtual', 'true')
    })
    fireEvent.click(result.getByRole('button', { name: 'collapse Asia' }))

    expect(result.queryByRole('treeitem', { name: /China/ })).toBeNull()
    expect(result.queryByRole('treeitem', { name: /Japan/ })).toBeNull()
    expect(result.getByRole('button', { name: 'expand Asia' })).toBeTruthy()
    expect(result.container.querySelector('.ads-tree-virtual-holder')).toHaveStyle({
      height: `${2 * 24}px`,
    })
  })

  it('renders all visible nodes when virtual is disabled', () => {
    const result = render(() => <Tree height={120} virtual={false} treeData={largeTreeData(100)} />)

    expect(result.getByRole('tree')).not.toHaveAttribute('data-virtual', 'true')
    expect(result.getAllByRole('treeitem')).toHaveLength(100)
  })

  it('renders tree nodes through solid-motionone and supports custom motion config', () => {
    const result = render(() => (
      <Tree
        defaultExpandAll
        treeData={treeData}
        motion={{
          initial: { opacity: 0.25 },
          animate: { opacity: 0.75 },
          transition: { duration: 0.12 },
        }}
      />
    ))

    expect(result.getByRole('treeitem', { name: /China/ })).toHaveClass('ads-tree-motion-node')
    expect(result.getByRole('treeitem', { name: /China/ })).toHaveStyle({ opacity: '0.25' })
  })

  it('supports disabling motion', () => {
    const result = render(() => <Tree defaultExpandAll treeData={treeData} motion={false} />)

    expect(result.getByRole('treeitem', { name: /China/ })).not.toHaveClass('ads-tree-motion-node')
    expect(result.getByRole('treeitem', { name: /China/ })).not.toHaveStyle({ opacity: '0' })
  })

  it('does not apply default transform motion when selecting visible nodes', () => {
    const result = render(() => <Tree defaultExpandAll treeData={treeData} />)

    fireEvent.click(result.getByRole('treeitem', { name: /China/ }))

    expect(result.getByRole('treeitem', { name: /China/ })).not.toHaveStyle({
      transform: 'translateY(-2px)',
    })
  })

  it('supports basic drag callbacks and allowDrop', () => {
    const onDragStart = vi.fn()
    const onDragEnter = vi.fn()
    const onDragOver = vi.fn()
    const onDragLeave = vi.fn()
    const onDragEnd = vi.fn()
    const onDrop = vi.fn()
    const result = render(() => (
      <Tree
        defaultExpandAll
        draggable
        allowDrop={({ dropNode }) => dropNode.key !== 'china'}
        treeData={treeData}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
      />
    ))

    const china = result.getByRole('treeitem', { name: /China/ })
    const europe = result.getByRole('treeitem', { name: /Europe/ })

    expect(china).toHaveAttribute('draggable', 'true')
    fireEvent.dragStart(china)
    fireEvent.dragEnter(europe)
    fireEvent.dragOver(europe)
    fireEvent.dragLeave(europe)
    fireEvent.drop(europe)
    fireEvent.dragEnd(china)

    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ node: treeData[0].children?.[0] }),
    )
    expect(onDragEnter).toHaveBeenCalledWith(expect.objectContaining({ node: treeData[1] }))
    expect(onDragOver).toHaveBeenCalledWith(expect.objectContaining({ node: treeData[1] }))
    expect(onDragLeave).toHaveBeenCalledWith(expect.objectContaining({ node: treeData[1] }))
    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        dragNode: treeData[0].children?.[0],
        node: treeData[1],
      }),
    )
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ node: treeData[0].children?.[0] }),
    )

    fireEvent.dragStart(europe)
    fireEvent.drop(china)
    expect(onDrop).toHaveBeenCalledTimes(1)
  })

  it('supports draggable icon handles and nodeDraggable config', () => {
    const onDragStart = vi.fn()
    const result = render(() => (
      <Tree
        defaultExpandAll
        draggable={{
          icon: <span data-testid="drag-handle">drag</span>,
          nodeDraggable: (node) => node.key !== 'japan',
        }}
        treeData={treeData}
        onDragStart={onDragStart}
      />
    ))

    const china = result.getByRole('treeitem', { name: /China/ })
    const japan = result.getByRole('treeitem', { name: /Japan/ })

    expect(result.getAllByTestId('drag-handle')).toHaveLength(3)
    expect(china).toHaveAttribute('draggable', 'true')
    expect(japan).toHaveAttribute('draggable', 'false')

    fireEvent.dragStart(china)
    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ node: treeData[0].children?.[0] }),
    )
  })

  it('supports DirectoryTree expandAction and directory selection behavior', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <DirectoryTree treeData={treeData} expandAction="doubleClick" onSelect={onSelect} />
    ))

    fireEvent.click(result.getByRole('treeitem', { name: /Asia/ }))
    expect(result.queryByRole('treeitem', { name: /China/ })).toBeNull()
    expect(onSelect).toHaveBeenLastCalledWith(['asia'], expect.objectContaining({ selected: true }))

    fireEvent.doubleClick(result.getByRole('treeitem', { name: /Asia/ }))
    expect(result.getByRole('treeitem', { name: /China/ })).toBeTruthy()
    expect(result.getByRole('tree')).toHaveClass('ads-tree-directory')
  })

  it('keeps selected DirectoryTree item colors while hovered', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DirectoryTree defaultSelectedKeys={['asia']} treeData={treeData} />
      </StyleProvider>
    ))

    const styles = extractStyle(cache)

    expect(styles).toContain(
      '.ads-tree-directory .ads-tree-node-selected, .ads-tree-directory .ads-tree-node-selected:hover{background:#1677ff;color:#fff;',
    )
    expect(styles).toContain(
      '.ads-tree-directory .ads-tree-node-selected .ads-tree-icon, .ads-tree-directory .ads-tree-node-selected:hover .ads-tree-icon{color:inherit;',
    )
  })

  it('does not apply generic hover styles to selected tree nodes', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Tree defaultSelectedKeys={['asia']} treeData={treeData} />
      </StyleProvider>
    ))

    const styles = extractStyle(cache)

    expect(styles).toContain(
      '.ads-tree-node:not(.ads-tree-node-selected):not(.ads-tree-node-disabled):hover{background:rgba(0,0,0,0.02);',
    )
    expect(styles).not.toContain('.ads-tree-node:hover{background:rgba(0,0,0,0.02);')
  })

  it('registers switcher loading icon rotation styles on the loading wrapper svg', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Tree treeData={[{ title: 'Async', key: 'async', isLeaf: false }]} />
      </StyleProvider>
    ))

    const styles = extractStyle(cache)

    expect(styles).toContain('@keyframes adsIconRotate{to{transform:rotate(360deg);}}')
    expect(styles).toContain(
      '.ads-tree-switcher-loading-icon svg{animation:adsIconRotate 1s linear infinite;',
    )
  })

  it('supports DirectoryTree ctrl and shift multiple selection', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <DirectoryTree multiple defaultExpandAll treeData={treeData} onSelect={onSelect} />
    ))

    fireEvent.click(result.getByRole('treeitem', { name: /China/ }))
    fireEvent.click(result.getByRole('treeitem', { name: /Europe/ }), { ctrlKey: true })
    expect(onSelect).toHaveBeenLastCalledWith(
      ['china', 'europe'],
      expect.objectContaining({ selected: true }),
    )

    fireEvent.click(result.getByRole('treeitem', { name: /Asia/ }))
    fireEvent.click(result.getByRole('treeitem', { name: /Europe/ }), { shiftKey: true })
    expect(onSelect).toHaveBeenLastCalledWith(
      ['asia', 'china', 'japan', 'europe'],
      expect.objectContaining({ selected: true }),
    )
  })
})
