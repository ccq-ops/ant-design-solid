import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  QRCode,
  Table,
  TimePicker,
  Transfer,
  Upload,
} from '../../index'
import enUS from '../en_US'
import jaJP from '../ja_JP'
import koKR from '../ko_KR'
import zhCN from '../zh_CN'
import zhTW from '../zh_TW'

describe('public locale packages', () => {
  it('exports the five supported locale identifiers', () => {
    expect([enUS.locale, zhCN.locale, zhTW.locale, jaJP.locale, koKR.locale]).toEqual([
      'en',
      'zh-cn',
      'zh-tw',
      'ja',
      'ko',
    ])
  })

  it('applies ConfigProvider locale across component families', async () => {
    const result = render(() => (
      <ConfigProvider locale={zhCN}>
        <DatePicker />
        <TimePicker />
        <Pagination simple total={20} />
        <Table columns={[{ title: 'Name', dataIndex: 'name' }]} dataSource={[]} />
        <Empty />
        <Transfer showSearch dataSource={[]} />
        <QRCode value="locale" status="expired" />
        <Upload
          defaultFileList={[{ uid: '1', name: 'report.pdf', status: 'done', url: '/report.pdf' }]}
          onPreview={() => undefined}
        />
        <Form requiredMark="optional">
          <Form.Item label="Nickname" name="nickname">
            <Input />
          </Form.Item>
        </Form>
        <Modal open title="Localized modal" />
        <Popconfirm open title="Localized confirm">
          <Button>Delete</Button>
        </Popconfirm>
      </ConfigProvider>
    ))

    expect(result.getByPlaceholderText('请选择日期')).toBeInTheDocument()
    expect(result.getByRole('combobox', { name: '请选择时间' })).toBeInTheDocument()
    expect(result.getByRole('textbox', { name: '页' })).toBeInTheDocument()
    expect(result.getAllByText('暂无数据').length).toBeGreaterThanOrEqual(2)
    expect(result.getAllByPlaceholderText('请输入搜索内容')).toHaveLength(2)
    expect(result.getByText('二维码过期')).toBeInTheDocument()
    expect(result.getByRole('button', { name: '预览文件 report.pdf' })).toBeInTheDocument()
    expect(result.getByText('（可选）')).toBeInTheDocument()

    await waitFor(() => {
      expect(document.body).toHaveTextContent('Localized modal')
      expect(document.body).toHaveTextContent('Localized confirm')
      const buttonLabels = Array.from(document.body.querySelectorAll('button')).map((button) =>
        button.textContent?.replaceAll(/\s/g, ''),
      )
      expect(buttonLabels.filter((label) => label === '确定').length).toBeGreaterThanOrEqual(2)
      expect(buttonLabels.filter((label) => label === '取消').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('lets component locale props override ConfigProvider locale', () => {
    const result = render(() => (
      <ConfigProvider locale={zhCN}>
        <DatePicker locale={{ lang: { placeholder: 'Custom date' } }} />
        <Pagination simple total={20} locale={{ page: 'Custom page' }} />
        <Transfer showSearch dataSource={[]} locale={{ searchPlaceholder: 'Custom search' }} />
      </ConfigProvider>
    ))

    expect(result.getByPlaceholderText('Custom date')).toBeInTheDocument()
    expect(result.getByRole('textbox', { name: 'Custom page' })).toBeInTheDocument()
    expect(result.getAllByPlaceholderText('Custom search')).toHaveLength(2)
  })

  it('uses locale validation messages from ConfigProvider', async () => {
    const result = render(() => (
      <ConfigProvider locale={zhCN}>
        <Form>
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form>
      </ConfigProvider>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByText('请输入用户名')).toBeInTheDocument())
  })
})
