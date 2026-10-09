import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Calendar,
  Card,
  Descriptions,
  Divider,
  Empty,
  FloatButton,
  Masonry,
  Menu,
  QRCode,
  Result,
  Skeleton,
  Spin,
  Splitter,
  Statistic,
  Table,
  Tabs,
  Transfer,
  Upload,
  Watermark,
} from '../index'
import type {
  AlertRef,
  AvatarGroupRef,
  BreadcrumbRef,
  CalendarRef,
  CardGridRef,
  CardMetaRef,
  DescriptionsRef,
  DividerRef,
  EmptyRef,
  FloatButtonGroupRef,
  FloatButtonRef,
  MasonryRef,
  MenuRef,
  QRCodeRef,
  ResultRef,
  SkeletonRef,
  SpinRef,
  SplitterRef,
  StatisticRef,
  TableRef,
  TabsRef,
  TransferRef,
  UploadRef,
  WatermarkRef,
  RibbonRef,
} from '../index'

describe('nativeElement refs', () => {
  it('exposes root elements for simple display components', () => {
    let alertRef: AlertRef | undefined
    let breadcrumbRef: BreadcrumbRef | undefined
    let calendarRef: CalendarRef | undefined
    let dividerRef: DividerRef | undefined
    let emptyRef: EmptyRef | undefined
    let resultRef: ResultRef | undefined

    const result = render(() => (
      <>
        <Alert ref={(ref) => (alertRef = ref)} title="Alert" />
        <Breadcrumb ref={(ref) => (breadcrumbRef = ref)} items={[{ title: 'Home', href: '/' }]} />
        <Calendar ref={(ref) => (calendarRef = ref)} fullscreen={false} />
        <Divider ref={(ref) => (dividerRef = ref)} />
        <Empty ref={(ref) => (emptyRef = ref)} />
        <Result ref={(ref) => (resultRef = ref)} title="Result" />
      </>
    ))

    expect(alertRef?.nativeElement).toBe(result.container.querySelector('.ads-alert'))
    expect(breadcrumbRef?.nativeElement).toBe(result.container.querySelector('.ads-breadcrumb'))
    expect(calendarRef?.nativeElement).toBe(result.container.querySelector('.ads-calendar'))
    expect(dividerRef?.nativeElement).toBe(result.container.querySelector('.ads-divider'))
    expect(emptyRef?.nativeElement).toBe(result.container.querySelector('.ads-empty'))
    expect(resultRef?.nativeElement).toBe(result.container.querySelector('.ads-result'))
  })

  it('exposes refs for compound display components', () => {
    let avatarGroupRef: AvatarGroupRef | undefined
    let cardGridRef: CardGridRef | undefined
    let cardMetaRef: CardMetaRef | undefined
    let descriptionsRef: DescriptionsRef | undefined
    let ribbonRef: RibbonRef | undefined
    let statisticRef: StatisticRef | undefined

    const result = render(() => (
      <>
        <Avatar.Group ref={(ref) => (avatarGroupRef = ref)}>
          <Avatar>A</Avatar>
        </Avatar.Group>
        <Card.Grid ref={(ref) => (cardGridRef = ref)}>Grid</Card.Grid>
        <Card.Meta ref={(ref) => (cardMetaRef = ref)} title="Meta" />
        <Descriptions
          ref={(ref) => (descriptionsRef = ref)}
          items={[{ key: 'one', label: 'One', children: 'Value' }]}
        />
        <Badge.Ribbon ref={(ref) => (ribbonRef = ref)} text="New">
          <div>Ribbon content</div>
        </Badge.Ribbon>
        <Statistic ref={(ref) => (statisticRef = ref)} value={42} />
      </>
    ))

    expect(avatarGroupRef?.nativeElement).toBe(result.container.querySelector('.ads-avatar-group'))
    expect(cardGridRef?.nativeElement).toBe(result.container.querySelector('.ads-card-grid'))
    expect(cardMetaRef?.nativeElement).toBe(result.container.querySelector('.ads-card-meta'))
    expect(descriptionsRef?.nativeElement).toBe(result.container.querySelector('.ads-descriptions'))
    expect(ribbonRef?.nativeElement).toBe(result.container.querySelector('.ads-ribbon-wrapper'))
    expect(statisticRef?.nativeElement).toBe(result.container.querySelector('.ads-statistic'))
  })

  it('exposes refs for interactive and virtualized components', () => {
    let floatButtonRef: FloatButtonRef | undefined
    let floatButtonGroupRef: FloatButtonGroupRef | undefined
    let masonryRef: MasonryRef | undefined
    let menuRef: MenuRef | undefined
    let tableRef: TableRef | undefined
    let tabsRef: TabsRef | undefined
    let uploadRef: UploadRef | undefined

    const result = render(() => (
      <>
        <FloatButton ref={(ref) => (floatButtonRef = ref)} />
        <FloatButton.Group ref={(ref) => (floatButtonGroupRef = ref)}>
          <FloatButton />
        </FloatButton.Group>
        <Masonry
          ref={(ref) => (masonryRef = ref)}
          items={[{ key: 'one', data: 'One', children: 'One' }]}
        />
        <Menu ref={(ref) => (menuRef = ref)} items={[{ key: 'one', label: 'One' }]} />
        <Table
          ref={(ref) => (tableRef = ref)}
          columns={[{ title: 'Name', dataIndex: 'name' }]}
          dataSource={[{ key: 'one', name: 'One' }]}
          pagination={false}
        />
        <Tabs
          ref={(ref) => (tabsRef = ref)}
          items={[{ key: 'one', label: 'One', children: 'Pane' }]}
        />
        <Upload ref={(ref) => (uploadRef = ref)}>
          <button>Upload</button>
        </Upload>
      </>
    ))

    expect(floatButtonRef?.nativeElement).toBe(result.container.querySelector('.ads-float-button'))
    expect(floatButtonGroupRef?.nativeElement).toBe(
      result.container.querySelector('.ads-float-button-group'),
    )
    expect(masonryRef?.nativeElement).toBe(result.container.querySelector('.ads-masonry'))
    expect(menuRef?.menu).toBe(result.container.querySelector('.ads-menu'))
    expect(tableRef?.nativeElement).toBe(result.container.querySelector('.ads-table-wrapper'))
    expect(tabsRef?.nativeElement).toBe(result.container.querySelector('.ads-tabs'))
    expect(uploadRef?.nativeElement).toBe(result.container.querySelector('.ads-upload'))
  })

  it('supports table scrolling and menu focus through refs', () => {
    let menuRef: MenuRef | undefined
    let tableRef: TableRef | undefined
    const scrollIntoView = vi.fn()
    const previousScrollIntoView = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    try {
      const result = render(() => (
        <>
          <Menu ref={(ref) => (menuRef = ref)} items={[{ key: 'one', label: 'One' }]} />
          <Table
            ref={(ref) => (tableRef = ref)}
            columns={[{ title: 'Name', dataIndex: 'name' }]}
            dataSource={[{ key: 'one', name: 'One' }]}
            pagination={false}
          />
        </>
      ))

      const menuItem = result.getByRole('menuitem', { name: 'One' })
      const focus = vi.spyOn(menuItem, 'focus')
      menuRef?.focus()
      expect(focus).toHaveBeenCalled()

      tableRef?.scrollTo({ key: 'one', align: 'start' })
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    } finally {
      HTMLElement.prototype.scrollIntoView = previousScrollIntoView
    }
  })

  it('exposes root elements for loading and layout components', () => {
    let skeletonRef: SkeletonRef | undefined
    let spinRef: SpinRef | undefined
    let splitterRef: SplitterRef | undefined

    const result = render(() => (
      <>
        <Skeleton ref={(ref) => (skeletonRef = ref)} />
        <Spin ref={(ref) => (spinRef = ref)} />
        <Splitter ref={(ref) => (splitterRef = ref)}>
          <Splitter.Panel>Left</Splitter.Panel>
          <Splitter.Panel>Right</Splitter.Panel>
        </Splitter>
      </>
    ))

    expect(skeletonRef?.nativeElement).toBe(result.container.querySelector('.ads-skeleton'))
    expect(spinRef?.nativeElement).toBe(result.container.querySelector('.ads-spin'))
    expect(splitterRef?.nativeElement).toBe(result.container.querySelector('.ads-splitter'))
  })

  it('exposes root elements for data and protected-content components', () => {
    let qrcodeRef: QRCodeRef | undefined
    let transferRef: TransferRef | undefined
    let watermarkRef: WatermarkRef | undefined

    const result = render(() => (
      <>
        <QRCode ref={(ref) => (qrcodeRef = ref)} value="solid" />
        <Transfer
          ref={(ref) => (transferRef = ref)}
          dataSource={[{ key: 'one', title: 'One' }]}
          render={(item) => item.title}
        />
        <Watermark ref={(ref) => (watermarkRef = ref)} content="Solid">
          <div>Protected</div>
        </Watermark>
      </>
    ))

    expect(qrcodeRef?.nativeElement).toBe(result.container.querySelector('.ads-qrcode'))
    expect(transferRef?.nativeElement).toBe(result.container.querySelector('.ads-transfer'))
    expect(watermarkRef?.nativeElement).toBe(result.container.querySelector('.ads-watermark'))
  })
})
