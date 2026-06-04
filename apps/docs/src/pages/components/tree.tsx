import { Tree } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
