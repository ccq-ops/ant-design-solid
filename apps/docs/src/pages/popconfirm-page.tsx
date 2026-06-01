import { Button, Popconfirm, message } from '@ant-design-solid/core'
import { DemoBlock } from '../site/demo-block'

export function PopconfirmPage() {
  return (
    <>
      <h1>Popconfirm</h1>
      <DemoBlock
        title="Basic"
        code={`<Popconfirm title="Delete?" onConfirm={remove}><Button danger>Delete</Button></Popconfirm>`}
      >
        <Popconfirm
          title="Delete?"
          description="This action cannot be undone."
          onConfirm={() => {
            message.success('Deleted')
          }}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      </DemoBlock>
    </>
  )
}
