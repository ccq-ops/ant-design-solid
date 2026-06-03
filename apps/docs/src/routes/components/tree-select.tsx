import { createSignal } from 'solid-js'
import { TreeSelect } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const treeData = [
  {
    title: 'Asia',
    value: 'asia',
    children: [
      { title: 'China', value: 'china' },
      { title: 'Japan', value: 'japan', disabled: true },
    ],
  },
  { title: 'Europe', value: 'europe' },
]

export default function TreeSelectPage() {
  const [value, setValue] = createSignal<string | number | boolean | undefined>('europe')

  return (
    <div class="doc-page">
      <h1>TreeSelect</h1>
      <p>Select a value from hierarchical tree data.</p>

      <DemoBlock
        title="Basic"
        code={`<TreeSelect placeholder="Select area" treeData={treeData} />`}
      >
        <TreeSelect placeholder="Select area" treeData={treeData} />
      </DemoBlock>

      <DemoBlock
        title="Default expanded"
        code={`<TreeSelect defaultExpandedKeys={['asia']} treeData={treeData} />`}
      >
        <TreeSelect defaultExpandedKeys={['asia']} placeholder="Expanded" treeData={treeData} />
      </DemoBlock>

      <DemoBlock
        title="Clearable"
        code={`<TreeSelect allowClear defaultValue="china" treeData={treeData} />`}
      >
        <TreeSelect
          allowClear
          defaultExpandedKeys={['asia']}
          defaultValue="china"
          treeData={treeData}
        />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`<TreeSelect value={value()} onChange={setValue} treeData={treeData} />`}
      >
        <TreeSelect value={value()} onChange={(next) => setValue(next)} treeData={treeData} />
      </DemoBlock>
    </div>
  )
}
