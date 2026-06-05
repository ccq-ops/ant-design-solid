import { Tree } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const treeRows: ApiTableRow[] = [
  { property: 'treeData', description: 'Tree node data.', type: 'TreeDataNode[]' },
  { property: 'expandedKeys', description: 'Controlled expanded node keys.', type: 'TreeKey[]' },
  {
    property: 'defaultExpandedKeys',
    description: 'Initial expanded node keys.',
    type: 'TreeKey[]',
  },
  { property: 'selectedKeys', description: 'Controlled selected node keys.', type: 'TreeKey[]' },
  {
    property: 'defaultSelectedKeys',
    description: 'Initial selected node keys.',
    type: 'TreeKey[]',
  },
  { property: 'checkedKeys', description: 'Controlled checked node keys.', type: 'TreeKey[]' },
  { property: 'defaultCheckedKeys', description: 'Initial checked node keys.', type: 'TreeKey[]' },
  {
    property: 'selectable',
    description: 'Whether nodes can be selected.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'checkable',
    description: 'Shows checkboxes for checkable nodes.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabled',
    description: 'Disables the entire tree.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showLine',
    description: 'Shows line styling.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'blockNode',
    description: 'Makes node content fill the row.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  {
    property: 'onExpand',
    description: 'Called when node expansion changes.',
    type: '(expandedKeys: TreeKey[], info: TreeExpandInfo) => void',
  },
  {
    property: 'onSelect',
    description: 'Called when node selection changes.',
    type: '(selectedKeys: TreeKey[], info: TreeSelectInfo) => void',
  },
  {
    property: 'onCheck',
    description: 'Called when node checked state changes.',
    type: '(checkedKeys: TreeKey[], info: TreeCheckInfo) => void',
  },
]

const treeDataNodeRows: ApiTableRow[] = [
  { property: 'title', description: 'Node title content.', type: 'JSX.Element' },
  { property: 'key', description: 'Unique node key.', type: 'TreeKey' },
  {
    property: 'disabled',
    description: 'Disables the node.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disableCheckbox',
    description: 'Disables this node checkbox.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'selectable',
    description: 'Overrides whether this node can be selected.',
    type: 'boolean',
  },
  {
    property: 'checkable',
    description: 'Overrides whether this node shows a checkbox.',
    type: 'boolean',
  },
  { property: 'children', description: 'Child tree nodes.', type: 'TreeDataNode[]' },
]

const treeData = [
  {
    title: 'Parent 1',
    key: 'parent-1',
    children: [
      { title: 'Child 1', key: 'child-1' },
      { title: 'Child 2', key: 'child-2', disabled: true },
    ],
  },
  {
    title: 'Parent 2',
    key: 'parent-2',
    children: [{ title: 'Child 3', key: 'child-3' }],
  },
]

export default function TreePage() {
  return (
    <>
      <h1>Tree</h1>
      <DemoBlock
        title="Basic"
        code={`<Tree defaultExpandedKeys={['parent-1']} treeData={treeData} />`}
      >
        <Tree defaultExpandedKeys={['parent-1']} treeData={treeData} />
      </DemoBlock>
      <DemoBlock
        title="Checkable"
        code={`<Tree checkable defaultExpandedKeys={['parent-1']} treeData={treeData} />`}
      >
        <Tree checkable defaultExpandedKeys={['parent-1']} treeData={treeData} />
      </DemoBlock>
      <DemoBlock
        title="Line and block node"
        code={`<Tree showLine blockNode defaultExpandedKeys={['parent-2']} treeData={treeData} />`}
      >
        <Tree showLine blockNode defaultExpandedKeys={['parent-2']} treeData={treeData} />
      </DemoBlock>

      <h2>API</h2>
      <h3>Tree</h3>
      <ApiTable rows={treeRows} aria-label="Tree API" />
      <h3>TreeDataNode</h3>
      <ApiTable rows={treeDataNodeRows} aria-label="Tree Data Node API" />
    </>
  )
}
