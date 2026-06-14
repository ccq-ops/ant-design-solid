import * as Icons from '@ant-design-solid/icons'
import { Input, Segmented, useToken } from '@ant-design-solid/core'
import { For, Show, createMemo, createSignal, type Component, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { CheckOutlined, SearchOutlined, type IconProps } from '@ant-design-solid/icons'

export type IconCategory = 'Outlined' | 'Filled' | 'TwoTone'
type IconTheme = IconCategory
type IconGroupKey = 'direction' | 'suggestion' | 'editor' | 'data' | 'logo' | 'other'

export type IconMeta = {
  name: string
  category: IconCategory
  baseName: string
  component: Component<IconProps>
}

const categorySuffixes: IconCategory[] = ['Outlined', 'Filled', 'TwoTone']
const themeOptions: IconTheme[] = ['Outlined', 'Filled', 'TwoTone']
const groupLabels: Record<IconGroupKey, string> = {
  direction: 'Directional Icons',
  suggestion: 'Suggested Icons',
  editor: 'Editor Icons',
  data: 'Data Icons',
  logo: 'Brand and Logos',
  other: 'Other Icons',
}
const categoryBaseNames: Record<Exclude<IconGroupKey, 'other'>, string[]> = {
  direction: [
    'StepBackward',
    'StepForward',
    'FastBackward',
    'FastForward',
    'Shrink',
    'ArrowsAlt',
    'Down',
    'Up',
    'Left',
    'Right',
    'CaretUp',
    'CaretDown',
    'CaretLeft',
    'CaretRight',
    'UpCircle',
    'DownCircle',
    'LeftCircle',
    'RightCircle',
    'DoubleRight',
    'DoubleLeft',
    'VerticalLeft',
    'VerticalRight',
    'VerticalAlignTop',
    'VerticalAlignMiddle',
    'VerticalAlignBottom',
    'Forward',
    'Backward',
    'Rollback',
    'Enter',
    'Retweet',
    'Swap',
    'SwapLeft',
    'SwapRight',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'PlayCircle',
    'UpSquare',
    'DownSquare',
    'LeftSquare',
    'RightSquare',
    'Login',
    'Logout',
    'MenuFold',
    'MenuUnfold',
    'BorderBottom',
    'BorderHorizontal',
    'BorderInner',
    'BorderOuter',
    'BorderLeft',
    'BorderRight',
    'BorderTop',
    'BorderVerticle',
    'PicCenter',
    'PicLeft',
    'PicRight',
    'RadiusBottomleft',
    'RadiusBottomright',
    'RadiusUpleft',
    'RadiusUpright',
    'Fullscreen',
    'FullscreenExit',
  ],
  suggestion: [
    'Question',
    'QuestionCircle',
    'Plus',
    'PlusCircle',
    'Pause',
    'PauseCircle',
    'Minus',
    'MinusCircle',
    'PlusSquare',
    'MinusSquare',
    'Info',
    'InfoCircle',
    'Exclamation',
    'ExclamationCircle',
    'Close',
    'CloseCircle',
    'CloseSquare',
    'Check',
    'CheckCircle',
    'CheckSquare',
    'ClockCircle',
    'Warning',
    'IssuesClose',
    'Stop',
  ],
  editor: [
    'Edit',
    'Form',
    'Copy',
    'Scissor',
    'Delete',
    'Snippets',
    'Diff',
    'Highlight',
    'AlignCenter',
    'AlignLeft',
    'AlignRight',
    'BgColors',
    'Bold',
    'Italic',
    'Underline',
    'Strikethrough',
    'Redo',
    'Undo',
    'ZoomIn',
    'ZoomOut',
    'FontColors',
    'FontSize',
    'LineHeight',
    'Dash',
    'SmallDash',
    'SortAscending',
    'SortDescending',
    'Drag',
    'OrderedList',
    'UnorderedList',
    'RadiusSetting',
    'ColumnWidth',
    'ColumnHeight',
  ],
  data: [
    'AreaChart',
    'PieChart',
    'BarChart',
    'DotChart',
    'LineChart',
    'RadarChart',
    'HeatMap',
    'Fall',
    'Rise',
    'Stock',
    'BoxPlot',
    'Fund',
    'Sliders',
  ],
  logo: [
    'Android',
    'Apple',
    'Windows',
    'Ie',
    'Chrome',
    'Github',
    'Aliwangwang',
    'Dingding',
    'WeiboSquare',
    'WeiboCircle',
    'TaobaoCircle',
    'Html5',
    'Weibo',
    'Twitter',
    'Wechat',
    'WhatsApp',
    'Youtube',
    'AlipayCircle',
    'Taobao',
    'Dingtalk',
    'Skype',
    'Qq',
    'MediumWorkmark',
    'Gitlab',
    'Medium',
    'Linkedin',
    'GooglePlus',
    'Dropbox',
    'Facebook',
    'Codepen',
    'CodeSandbox',
    'CodeSandboxCircle',
    'Amazon',
    'Google',
    'CodepenCircle',
    'Alipay',
    'AntDesign',
    'AntCloud',
    'Aliyun',
    'Zhihu',
    'Slack',
    'SlackSquare',
    'Behance',
    'BehanceSquare',
    'Dribbble',
    'DribbbleSquare',
    'Instagram',
    'Yuque',
    'Alibaba',
    'Yahoo',
    'Reddit',
    'Sketch',
    'WechatWork',
    'OpenAI',
    'Discord',
    'X',
    'Bilibili',
    'Pinterest',
    'TikTok',
    'Spotify',
    'Twitch',
    'Linux',
    'Java',
    'JavaScript',
    'Python',
    'Ruby',
    'DotNet',
    'Kubernetes',
    'Docker',
    'Baidu',
    'HarmonyOS',
  ],
}

function categoryFromName(name: string): IconCategory | undefined {
  return categorySuffixes.find((category) => name.endsWith(category))
}

function baseNameFromIconName(name: string, category: IconCategory) {
  return name.slice(0, -category.length)
}

export const allIcons: IconMeta[] = Object.entries(Icons)
  .map(([name, component]) => {
    const category = categoryFromName(name)

    if (!category) {
      return undefined
    }

    return {
      name,
      category,
      baseName: baseNameFromIconName(name, category),
      component: component as Component<IconProps>,
    }
  })
  .filter((icon): icon is IconMeta => icon !== undefined)
  .sort((first, second) => first.name.localeCompare(second.name))

export const outlinedIcons = allIcons.filter((icon) => icon.category === 'Outlined')
export const filledIcons = allIcons.filter((icon) => icon.category === 'Filled')
export const twoToneIcons = allIcons.filter((icon) => icon.category === 'TwoTone')
const baseNameGroups = Object.values(categoryBaseNames).flat()

function normalizeSearchKey(value: string) {
  return value
    .trim()
    .replace(/^<([A-Za-z]*)\s*\/>$/g, '$1')
    .replace(/(Filled|Outlined|TwoTone)$/, '')
    .toLowerCase()
}

function groupFromBaseName(baseName: string): IconGroupKey {
  const group = Object.entries(categoryBaseNames).find(([, names]) => names.includes(baseName))

  return (group?.[0] as IconGroupKey | undefined) ?? 'other'
}

function iconMatchesSearch(icon: IconMeta, searchKey: string) {
  if (!searchKey) return true

  return (
    icon.name.toLowerCase().includes(searchKey) ||
    icon.baseName.toLowerCase().includes(searchKey) ||
    icon.category.toLowerCase().includes(searchKey)
  )
}

function sortIconsWithinGroup(first: IconMeta, second: IconMeta) {
  const firstIndex = baseNameGroups.indexOf(first.baseName)
  const secondIndex = baseNameGroups.indexOf(second.baseName)

  if (firstIndex >= 0 && secondIndex >= 0) return firstIndex - secondIndex
  if (firstIndex >= 0) return -1
  if (secondIndex >= 0) return 1

  return first.name.localeCompare(second.name)
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  return false
}

export function IconSample(props: { name: string; children: JSX.Element }) {
  const token = useToken()

  return (
    <div class="docs-border flex min-h-24 flex-col items-center justify-center gap-2 rounded border px-2 py-3 text-center">
      <div class="text-2xl leading-none" style={{ color: token().colorPrimary }}>
        {props.children}
      </div>
      <span class="docs-text-secondary max-w-full break-all text-xs leading-4">{props.name}</span>
    </div>
  )
}

export function IconGrid(props: { title: string; icons: IconMeta[] }) {
  return (
    <section class="my-8">
      <h3>{props.title}</h3>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <For each={props.icons}>
          {(icon) => (
            <IconSample name={icon.name}>
              <Dynamic component={icon.component} aria-hidden="true" />
            </IconSample>
          )}
        </For>
      </div>
    </section>
  )
}

export function IconSearch() {
  const token = useToken()
  const [theme, setTheme] = createSignal<IconTheme>('Outlined')
  const [searchValue, setSearchValue] = createSignal('')
  const [copiedName, setCopiedName] = createSignal<string | undefined>()
  const normalizedSearch = createMemo(() => normalizeSearchKey(searchValue()))
  const iconsByGroup = createMemo(() => {
    const groups: Record<IconGroupKey, IconMeta[]> = {
      direction: [],
      suggestion: [],
      editor: [],
      data: [],
      logo: [],
      other: [],
    }

    allIcons
      .filter((icon) => icon.category === theme())
      .filter((icon) => iconMatchesSearch(icon, normalizedSearch()))
      .forEach((icon) => {
        groups[groupFromBaseName(icon.baseName)].push(icon)
      })

    Object.values(groups).forEach((icons) => icons.sort(sortIconsWithinGroup))

    return groups
  })
  const visibleGroups = createMemo(() =>
    (Object.keys(groupLabels) as IconGroupKey[])
      .map((key) => ({ key, icons: iconsByGroup()[key] }))
      .filter((group) => group.icons.length > 0),
  )

  async function handleCopy(iconName: string) {
    const text = `<${iconName} />`
    const copied = await copyText(text)

    if (!copied) return
    setCopiedName(iconName)
    window.setTimeout(() => {
      setCopiedName((current) => (current === iconName ? undefined : current))
    }, 1200)
  }

  return (
    <section
      id="list-of-icons"
      class="my-8"
      style={
        {
          '--icon-list-primary': token().colorPrimary,
          '--icon-list-primary-hover': token().colorPrimaryHover,
          '--icon-list-primary-bg': token().colorPrimary,
          '--icon-list-primary-text': token().colorTextLightSolid,
          '--icon-list-surface': token().colorBgContainer,
          '--icon-list-text': token().colorTextSecondary,
        } as JSX.CSSProperties
      }
    >
      <div class="sticky top-0 z-10 mb-6 flex flex-col gap-3 py-3 backdrop-blur sm:flex-row sm:items-center [background:color-mix(in_srgb,var(--icon-list-surface)_92%,transparent)]">
        <Segmented
          size="large"
          value={theme()}
          options={themeOptions.map((value) => ({
            label: value,
            value,
            icon: value === 'Outlined' ? <SearchOutlined /> : <CheckOutlined />,
          }))}
          onChange={(value) => setTheme(value as IconTheme)}
        />
        <Input
          class="min-w-0 flex-1"
          allowClear
          value={searchValue()}
          placeholder="Search icons"
          prefix={<SearchOutlined />}
          onInput={(event) => setSearchValue(event.currentTarget.value)}
        />
      </div>

      <Show
        when={visibleGroups().length > 0}
        fallback={<p class="docs-text-secondary">No icons found.</p>}
      >
        <For each={visibleGroups()}>
          {(group) => (
            <section class="my-8">
              <h3>{groupLabels[group.key]}</h3>
              <ul class="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                <For each={group.icons}>
                  {(icon) => {
                    const isCopied = () => copiedName() === icon.name

                    return (
                      <li class="m-0 p-0">
                        <button
                          type="button"
                          aria-label={`Copy ${icon.name}`}
                          class="docs-border group relative flex h-24 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded border bg-transparent px-2 py-3 text-center transition [color:var(--icon-list-text)] hover:[background:var(--icon-list-primary-bg)] hover:[border-color:var(--icon-list-primary)] hover:[color:var(--icon-list-primary-text)]"
                          classList={{
                            '[background:var(--icon-list-primary-bg)] [border-color:var(--icon-list-primary)] [color:var(--icon-list-primary-text)]':
                              isCopied(),
                          }}
                          onClick={() => void handleCopy(icon.name)}
                        >
                          <span class="text-4xl leading-none transition group-hover:scale-125">
                            <Dynamic component={icon.component} aria-hidden="true" />
                          </span>
                          <span class="mt-3 max-w-full scale-90 truncate font-mono text-xs leading-4">
                            {icon.name}
                          </span>
                          <Show when={isCopied()}>
                            <span class="absolute inset-0 flex items-center justify-center text-sm font-medium [background:var(--icon-list-primary-bg)] [color:var(--icon-list-primary-text)]">
                              Copied!
                            </span>
                          </Show>
                        </button>
                      </li>
                    )
                  }}
                </For>
              </ul>
            </section>
          )}
        </For>
      </Show>
    </section>
  )
}
