import type { DefaultThemeConfig } from '@kobalte/solidbase/default-theme'

export const componentGroups = [
  'General',
  'Layout',
  'Navigation',
  'Data Entry',
  'Data Display',
  'Feedback',
  'Other',
] as const

export type ComponentGroup = (typeof componentGroups)[number]

export interface ComponentDocMeta {
  title: string
  link: `/${string}`
  group: ComponentGroup
}

export const componentDocs = [
  { title: 'Button', link: '/button', group: 'General' },
  { title: 'Float Button', link: '/float-button', group: 'General' },
  { title: 'Icon', link: '/icon', group: 'General' },
  { title: 'Typography', link: '/typography', group: 'General' },

  { title: 'Divider', link: '/divider', group: 'Layout' },
  { title: 'Flex', link: '/flex', group: 'Layout' },
  { title: 'Grid', link: '/grid', group: 'Layout' },
  { title: 'Layout', link: '/layout', group: 'Layout' },
  { title: 'Masonry', link: '/masonry', group: 'Layout' },
  { title: 'Space', link: '/space', group: 'Layout' },
  { title: 'Splitter', link: '/splitter', group: 'Layout' },

  { title: 'Anchor', link: '/anchor', group: 'Navigation' },
  { title: 'Breadcrumb', link: '/breadcrumb', group: 'Navigation' },
  { title: 'Dropdown', link: '/dropdown', group: 'Navigation' },
  { title: 'Menu', link: '/menu', group: 'Navigation' },
  { title: 'Pagination', link: '/pagination', group: 'Navigation' },
  { title: 'Steps', link: '/steps', group: 'Navigation' },
  { title: 'Tabs', link: '/tabs', group: 'Navigation' },

  { title: 'Auto Complete', link: '/auto-complete', group: 'Data Entry' },
  { title: 'Cascader', link: '/cascader', group: 'Data Entry' },
  { title: 'Checkbox', link: '/checkbox', group: 'Data Entry' },
  { title: 'Color Picker', link: '/color-picker', group: 'Data Entry' },
  { title: 'Date Picker', link: '/date-picker', group: 'Data Entry' },
  { title: 'Form', link: '/form', group: 'Data Entry' },
  { title: 'Input', link: '/input', group: 'Data Entry' },
  { title: 'Input Number', link: '/input-number', group: 'Data Entry' },
  { title: 'Mentions', link: '/mentions', group: 'Data Entry' },
  { title: 'Radio', link: '/radio', group: 'Data Entry' },
  { title: 'Rate', link: '/rate', group: 'Data Entry' },
  { title: 'Select', link: '/select', group: 'Data Entry' },
  { title: 'Slider', link: '/slider', group: 'Data Entry' },
  { title: 'Switch', link: '/switch', group: 'Data Entry' },
  { title: 'Time Picker', link: '/time-picker', group: 'Data Entry' },
  { title: 'Transfer', link: '/transfer', group: 'Data Entry' },
  { title: 'Tree Select', link: '/tree-select', group: 'Data Entry' },
  { title: 'Upload', link: '/upload', group: 'Data Entry' },

  { title: 'Avatar', link: '/avatar', group: 'Data Display' },
  { title: 'Badge', link: '/badge', group: 'Data Display' },
  { title: 'Calendar', link: '/calendar', group: 'Data Display' },
  { title: 'Card', link: '/card', group: 'Data Display' },
  { title: 'Carousel', link: '/carousel', group: 'Data Display' },
  { title: 'Collapse', link: '/collapse', group: 'Data Display' },
  { title: 'Descriptions', link: '/descriptions', group: 'Data Display' },
  { title: 'Empty', link: '/empty', group: 'Data Display' },
  { title: 'Image', link: '/image', group: 'Data Display' },
  { title: 'List', link: '/list', group: 'Data Display' },
  { title: 'Popover', link: '/popover', group: 'Data Display' },
  { title: 'QRCode', link: '/qrcode', group: 'Data Display' },
  { title: 'Segmented', link: '/segmented', group: 'Data Display' },
  { title: 'Statistic', link: '/statistic', group: 'Data Display' },
  { title: 'Table', link: '/table', group: 'Data Display' },
  { title: 'Tag', link: '/tag', group: 'Data Display' },
  { title: 'Timeline', link: '/timeline', group: 'Data Display' },
  { title: 'Tooltip', link: '/tooltip', group: 'Data Display' },
  { title: 'Tour', link: '/tour', group: 'Data Display' },
  { title: 'Tree', link: '/tree', group: 'Data Display' },

  { title: 'Alert', link: '/alert', group: 'Feedback' },
  { title: 'Drawer', link: '/drawer', group: 'Feedback' },
  { title: 'Message', link: '/message', group: 'Feedback' },
  { title: 'Modal', link: '/modal', group: 'Feedback' },
  { title: 'Notification', link: '/notification', group: 'Feedback' },
  { title: 'Popconfirm', link: '/popconfirm', group: 'Feedback' },
  { title: 'Progress', link: '/progress', group: 'Feedback' },
  { title: 'Result', link: '/result', group: 'Feedback' },
  { title: 'Skeleton', link: '/skeleton', group: 'Feedback' },
  { title: 'Spin', link: '/spin', group: 'Feedback' },
  { title: 'Watermark', link: '/watermark', group: 'Feedback' },

  { title: 'Affix', link: '/affix', group: 'Other' },
  { title: 'Border Beam', link: '/border-beam', group: 'Other' },
  { title: 'Config Provider', link: '/config-provider', group: 'Other' },
] satisfies ComponentDocMeta[]

const componentSidebar = componentGroups.map((group) => ({
  title: group,
  items: componentDocs
    .filter((component) => component.group === group)
    .map(({ title, link }) => ({ title, link })),
}))

export const docsThemeConfig = {
  nav: [
    { text: 'Components', link: '/components/button' },
    { text: 'Docs', link: '/docs/getting-started' },
  ],
  sidebar: {
    '/components': componentSidebar,
    '/docs': [
      { title: 'Getting Started', link: '/getting-started' },
      { title: 'Theming', link: '/theming' },
    ],
  },
} satisfies DefaultThemeConfig
