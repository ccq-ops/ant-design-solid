# Ant Design 最新官方基线研究（截至 2026-10-09）

> 研究范围：只核对 Ant Design 官方站点、`ant-design/ant-design` 官方 GitHub 仓库及 `antd` 官方 npm 包元数据；不审计本仓库实现，也不对 React API 机械映射到 SolidJS。
>
> 访问日期：**2026-10-09（Asia/Shanghai）**

## 1. 结论摘要

截至 2026-10-08：

- npm `latest` 指向 **`antd@6.6.5`**，发布时间为 **2026-09-20T09:10:07.567Z**；官方 GitHub Release `6.6.5` 的发布时间为 **2026-09-20T09:04:11Z**。
- v6 的最低 React peer dependency 是 **React / React DOM >= 18**，并原生支持 React 19；不再需要 `@ant-design/v5-patch-for-react-19`。
- 官方组件文档中共有 **71 个组件页面**。v6 时代最重要的新组件是：
  - `Masonry`：v6.0.0；
  - `BorderBeam`：v6.4.0；
  - `Listy`：v6.6.0，用于高性能虚拟列表，并承接已弃用的 `List`。
- v6 的核心不是单纯“多几个组件”，而是六条系统性基线：
  1. **Semantic DOM**：组件暴露稳定的语义节点及 `classNames` / `styles`，并支持函数式动态配置；
  2. **统一 ConfigProvider**：主题、尺寸、variant、图标、弹层、交互延迟、组件默认属性均可全局配置；
  3. **CSS Variables 默认启用**，支持 Seed / Map / Alias / Component Token、算法组合和 `zeroRuntime`；
  4. **API 语言统一**：`orientation`、`placement`、`open`、`popup`、`destroyOnHidden`、`items`、`variant` 等；
  5. **可访问性成为持续发布门槛**：键盘、焦点、ARIA、可访问名称、减弱动画、RTL 都持续有专项修复；
  6. **多层质量保障**：单测、demo 测试、axe、语义 DOM 测试、图片快照、视觉回归、构建产物测试、React 18/最新 React 矩阵、包体积检查。

若要把 Solid 组件库标准“拔高”到对齐 Ant Design 最新版，不能只追求同名组件数量；更高优先级应是建立 **语义结构契约、主题/token 契约、全局配置契约、无障碍契约、SSR/静态样式能力、兼容性与弃用策略、完整测试矩阵**。

---

## 2. 最新版本核实

| 项目                    | 官方结果                                   |
| ----------------------- | ------------------------------------------ |
| npm dist-tag `latest`   | `6.6.5`                                    |
| npm 发布时间            | 2026-09-20T09:10:07.567Z                   |
| GitHub Release          | `6.6.5`                                    |
| GitHub Release 发布时间 | 2026-09-20T09:04:11Z                       |
| Git tag commit          | `4a39f54842eade4e565ab336ef6097cd7e723cdd` |
| React peer dependency   | `react >=18.0.0`、`react-dom >=18.0.0`     |
| 官方最新版 v5 dist-tag  | `latest-5: 5.29.3`                         |

核实来源：

- [npm：antd 6.6.5](https://www.npmjs.com/package/antd/v/6.6.5)
- [npm Registry：antd 完整元数据](https://registry.npmjs.org/antd)
- [GitHub Release：6.6.5](https://github.com/ant-design/ant-design/releases/tag/6.6.5)
- [6.6.5 package.json](https://github.com/ant-design/ant-design/blob/6.6.5/package.json)
- [6.6.5 英文 Changelog](https://github.com/ant-design/ant-design/blob/6.6.5/CHANGELOG.en-US.md)

### 2.1 发布节奏

官方 Changelog 声明：

- 常规修复以周为单位发布 patch；
- 新功能通常以月为单位发布 minor；
- major 不遵循固定周期。

因此，对齐工作应维护“版本化差距表”，而不是一次性抄齐后长期不更新。

---

## 3. 官方组件全量清单

以下按官方组件文档分组，共 **71 个组件页面**。

### 3.1 General（3）

`Button`、`FloatButton`、`Typography`

### 3.2 Layout（7）

`Divider`、`Flex`、`Grid`、`Layout`、`Masonry`、`Space`、`Splitter`

### 3.3 Navigation（7）

`Anchor`、`Breadcrumb`、`Dropdown`、`Menu`、`Pagination`、`Steps`、`Tabs`

### 3.4 Data Entry（18）

`AutoComplete`、`Cascader`、`Checkbox`、`ColorPicker`、`DatePicker`、`Form`、`Input`、`InputNumber`、`Mentions`、`Radio`、`Rate`、`Select`、`Slider`、`Switch`、`TimePicker`、`Transfer`、`TreeSelect`、`Upload`

### 3.5 Data Display（21）

`Avatar`、`Badge`、`Calendar`、`Card`、`Carousel`、`Collapse`、`Descriptions`、`Empty`、`Image`、`List`（已弃用）、`Listy`、`Popover`、`QRCode`、`Segmented`、`Statistic`、`Table`、`Tag`、`Timeline`、`Tooltip`、`Tour`、`Tree`

### 3.6 Feedback（11）

`Alert`、`Drawer`、`Message`、`Modal`、`Notification`、`Popconfirm`、`Progress`、`Result`、`Skeleton`、`Spin`、`Watermark`

### 3.7 Other（4）

`Affix`、`App`、`BorderBeam`、`ConfigProvider`

来源：

- [官方组件总览](https://ant.design/components/overview/)
- [6.6.5 components/index.ts](https://github.com/ant-design/ant-design/blob/6.6.5/components/index.ts)
- [6.6.5 components 源码目录](https://github.com/ant-design/ant-design/tree/6.6.5/components)

### 3.8 兼容入口与推荐入口要区分

源码顶层仍可见部分兼容导出，但官方迁移文档已经明确：

- `BackTop` 应迁移到 `FloatButton.BackTop`；
- 旧内置 `Icon` 组件已从推荐组件体系移除，图标依赖应使用 `@ant-design/icons@6`；
- `List` 已弃用，官方从 6.6.0 开始推荐迁移到 `Listy`；
- `Dropdown.Button`、`Input.Group`、`Button.Group` 等组合型旧入口应使用 `Space.Compact` 与基础组件组合。

对齐时应分别记录：

1. 当前官方推荐 API；
2. 为迁移保留的兼容 API；
3. 已发出 warning、计划在 v7 删除的 API。

---

## 4. v6.0 至 v6.6 的关键新增能力

### 4.1 新组件

| 版本  | 新组件       | 官方定位                                                                        |
| ----- | ------------ | ------------------------------------------------------------------------------- |
| 6.0.0 | `Masonry`    | 瀑布流布局                                                                      |
| 6.4.0 | `BorderBeam` | 沿容器边缘运动的边框光束效果；后续增加 `size`、`lineWidth`、`duration`、`count` |
| 6.6.0 | `Listy`      | 高性能虚拟列表，支持分组、粘性标题和命令式滚动                                  |

`Listy` 是很重要的产品方向信号：最新版不仅要求“有 List”，还要求大数据列表具备虚拟化、分组、sticky、滚动定位和拖拽案例，并提供从旧 `List` 迁移的文档。

### 4.2 6.0.0 的平台级变化

- 大范围引入 Semantic DOM，组件与 ConfigProvider 支持语义化 `classNames` / `styles`。
- `classNames` / `styles` 支持函数形式，可根据组件 props 或状态动态生成。
- CSS Variables 默认启用。
- `ConfigProvider.theme.zeroRuntime` 支持不在运行时生成样式。
- React 19 原生兼容；React 18 成为最低版本。
- 构建目标升级，只支持现代浏览器，不支持 IE。
- 内置 UMD 包启用 React Compiler；CJS/ESM 用户可按需自行启用。
- API 开始系统性使用逻辑方向 `start` / `end`，提升 RTL 一致性。

### 4.3 6.1–6.3 的重点

- Overlay 焦点模型增强：
  - `Modal.focusable.trap`；
  - `Drawer.focusable`；
  - 后续将关闭后焦点恢复归入 `focusable.focusTriggerAfterClose`。
- Tooltip / Popover / Popconfirm 默认支持 ESC 关闭。
- `Tour.keyboard` 控制键盘操作。
- `Checkbox.Group` 支持 `role`。
- Grid 增加 `xxxl`（1920px）断点。
- 官方发布 `@ant-design/cli`，支持组件知识查询、项目用法分析、废弃 API 检查和迁移辅助。
- 6.3.x 逐步把尺寸枚举统一为 `large | medium | small`。

### 4.4 6.4–6.6 的重点

- `ConfigProvider` 能配置更多组件默认行为：Select、Picker、Modal、Upload、Mentions、Tooltip 系列等。
- Modal / Drawer 支持更细的 focus 配置；Modal 新增 `scrollLock`。
- `DatePicker` / `TimePicker` 增加 `onClear`。
- `Steps.maxCount` 支持密集步骤折叠。
- `Table.expandable.forceRender`、`scrollTo({ offset })`、更多性能优化及无障碍增强。
- `Tree.useTree` 和 `scrollTo({ autoExpand: true })`。
- `FloatButton.BackTop.showProgress`。
- `ConfigProvider.focusOutline` 统一管理跨组件焦点轮廓。
- 大批组件补齐 `nativeElement` ref，说明官方把“可获得真实 DOM 节点”视为统一组件契约。
- 6.5.0 新增 `DESIGN.md`，用于向 AI 设计/开发工具提供机器可读的视觉语言、组件 archetype 和 token 信息。

来源：

- [6.6.5 Changelog（包含 6.0–6.6 全部记录）](https://github.com/ant-design/ant-design/blob/6.6.5/CHANGELOG.en-US.md)
- [v5 → v6 官方迁移指南](https://ant.design/docs/react/migration-v6)
- [官方 CLI 文档](https://ant.design/docs/react/cli)
- [官方 DESIGN.md](https://ant.design/design.md)

---

## 5. API 设计与弃用方向

官方 v6 迁移文档说明：下列 deprecated API 当前多数仍能工作，但会输出警告，并计划在 **v7** 移除。

### 5.1 统一词汇

| 旧模式                                                           | 新模式                           | 涉及范围                                                               |
| ---------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `direction` / `type` / `layout`                                  | `orientation`                    | Space、Divider、Splitter、Slider、Steps 等                             |
| `left` / `right`、`xxxPosition`                                  | `start` / `end`、`placement`     | Tabs、Timeline、Progress、Carousel、Button、Table 等                   |
| `visible` / `onVisibleChange`                                    | `open` / `onOpenChange`          | Image、Select 类、Popup 类                                             |
| `dropdown*` / `overlay*`                                         | `popup*`、`classNames`、`styles` | Select、AutoComplete、Cascader、Dropdown、TreeSelect、Tooltip 等       |
| `destroyOnClose` / `destroyInactivePanel` / `destroyPopupOnHide` | `destroyOnHidden`                | Modal、Drawer、Tabs、Collapse、Dropdown、Tooltip 等                    |
| JSX children 子项                                                | `items` 数据配置                 | Anchor、Breadcrumb、Menu、Tabs、Timeline、Descriptions 等              |
| `bordered`                                                       | `variant`                        | Card、Input、InputNumber、Picker、Select、Cascader、TreeSelect、Tag 等 |
| 零散关闭参数                                                     | `closable` 对象                  | Alert、Modal、Notification 等                                          |
| 零散遮罩参数                                                     | `mask` 对象                      | Modal、Drawer 等                                                       |
| 零散 tooltip 参数                                                | `tooltip` 对象                   | Slider 等                                                              |

这一方向的实质是：**用稳定、可组合的对象 API 替换平铺且组件间命名不一致的 props**。

### 5.2 必须关注的组件级迁移

- `Alert.message → title`，关闭图标与回调收拢到 `closable`。
- `Notification.message → title`，`btn → actions`。
- `Avatar.Group.maxCount/maxStyle/maxPopover* → max` 对象。
- `Button.iconPosition → iconPlacement`；`Button.Group → Space.Compact`。
- `Card.bordered → variant`；`headStyle/bodyStyle → styles.header/body`。
- `Collapse.expandIconPosition → expandIconPlacement`，`destroyInactivePanel → destroyOnHidden`。
- `Drawer.width/height → size`，各部位样式迁移到 `styles`，`maskClosable → mask.closable`。
- `Modal.destroyOnClose → destroyOnHidden`，`maskClosable → mask.closable`，焦点恢复归入 `focusable`。
- `Input.Group`、`InputNumber.addonBefore/addonAfter` → `Space.Compact` 组合。
- `Select` / `TreeSelect` / `AutoComplete` / `Cascader` 的 dropdown 命名整体迁移为 popup 命名。
- `Slider` 的 tooltip、handle、track、rail 配置归入结构化对象及 semantic styles。
- `Statistic.Countdown → Statistic.Timer type="countdown"`。
- `Table.pagination.position → placement`；旧 selection callbacks 统一到 `onChange`。
- `Tabs.TabPane → items`；`tabPosition → tabPlacement`。
- `Timeline.Item → items`，`label/children/dot/position → title/content/icon/placement`。
- `Transfer.operations → actions`，样式迁入 `styles.section/actions`。
- `Splitter.collapsibleIcon → collapsible.icon`（6.4.0）。
- `size` 统一：
  - 多数组件 `default → medium`；
  - Descriptions `default → large`、`middle → medium`；
  - Table / Divider `middle → medium`。

完整清单应直接以官方迁移指南为准：

- [v5 → v6 官方迁移指南](https://ant.design/docs/react/migration-v6)
- [不可变源码版本](https://github.com/ant-design/ant-design/blob/6.6.5/docs/react/migration-v6.en-US.md)

### 5.3 对 Solid 实现的合理转译

不能照搬 React hooks 或 `ReactNode` 类型，但应对齐行为合同：

- 数据型 `items` API 与 JSX 子组件两种形式的取舍和迁移策略；
- controlled / uncontrolled 一致性；
- `open`、`value`、`checked` 等受控状态下的 `undefined` 语义；
- imperative ref / `nativeElement` / `scrollTo` / `focus` 等能力；
- popup 生命周期、portal container、focus trap、焦点回归与 scroll lock；
- callback 参数结构和触发时机；
- falsy 渲染值（特别是数字 `0`）不得丢失；
- RTL 与逻辑方向 API；
- deprecated API 的开发期 warning、文档标识和最终移除计划。

---

## 6. Semantic DOM 与定制能力

这是 v6 最值得作为高标准基线的部分。

### 6.1 官方模式

组件应定义公开、稳定的语义节点，例如 `root`、`header`、`body`、`content`、`icon`、`actions`、`popup.root` 等，并通过：

- 组件级 `classNames`；
- 组件级 `styles`；
- ConfigProvider 全局组件配置；
- 函数式 `classNames` / `styles`；
- 文档中的 Semantic DOM 表；
- 对应的语义 demo 与测试；

共同形成可定制契约，而不是鼓励用户依赖内部 DOM 层级和易碎 CSS 选择器。

### 6.2 对齐标准

每个复杂组件至少应具备：

1. 明确且稳定的 semantic slot 类型；
2. slot 到真实 DOM 的文档；
3. `classNames` 与 `styles` 均可按 slot 配置；
4. popup、mask、wrapper 等 portal 外节点也可配置；
5. ConfigProvider 可设置全局默认值；
6. 支持 props / state 驱动的函数式配置；
7. 测试验证 slot 存在、映射稳定、局部值覆盖全局值；
8. 禁止把内部 hash class 或 DOM 层级当作公开 API。

来源：

- [v6.0.0 Semantic DOM 发布记录](https://github.com/ant-design/ant-design/blob/6.6.5/CHANGELOG.en-US.md#600)
- [Semantic DOM 设计文章](https://ant.design/docs/blog/semantic-beauty)
- [组件公共属性](https://ant.design/docs/react/common-props)
- [语义测试示例目录](https://github.com/ant-design/ant-design/tree/6.6.5/components/button/__tests__)

---

## 7. 主题与样式系统

### 7.1 Design Token 分层

官方 token 模型是三层派生：

1. **Seed Token**：设计意图源，如 `colorPrimary`；
2. **Map Token**：由算法从 Seed 派生的梯度、尺寸等；
3. **Alias Token**：跨组件使用的语义别名；
4. 此外每个组件还有隔离的 **Component Token**。

预设算法包括：

- `defaultAlgorithm`
- `darkAlgorithm`
- `compactAlgorithm`

算法可以组合，也可自定义。Component Token 也可选择是否经过算法派生。

### 7.2 v6 样式能力

- CSS Variables 默认开启；
- 动态切换主题；
- 嵌套 / 局部主题；
- `theme.useToken()` 消费当前主题；
- `theme.getDesignToken()` 在组件生命周期外静态读取；
- `motion: false` 全局禁用动效；
- `zeroRuntime: true` 禁止运行时样式生成，并显式引入 `antd/dist/antd.css`；
- 可用 `@ant-design/static-style-extract` 按组件静态提取样式；
- 支持 `hashed`、`cssVar`、组件 token、主题继承；
- 支持 `@layer` 降低 antd 样式优先级；
- 支持 `autoPrefixTransformer`、逻辑属性降级、`px2remTransformer`；
- 支持 Shadow DOM 自定义 style container；
- 提供与 Tailwind CSS v3/v4、Emotion、styled-components 共存的官方方案。

### 7.3 对齐标准

Solid 版本若要达到同等级，建议至少具备：

- typed token schema；
- seed → map → alias 的稳定派生；
- light / dark / compact 算法及组合；
- component token；
- CSS variable 输出与稳定命名；
- 动态主题、局部主题、嵌套继承；
- SSR 样式提取；
- 静态 CSS / zero-runtime 构建；
- `@layer` 与第三方 CSS 框架共存方案；
- RTL 使用逻辑属性；
- token 变更的视觉回归；
- token 元数据和可视化编辑 / 文档生成能力。

来源：

- [官方主题定制文档](https://ant.design/docs/react/customize-theme)
- [6.6.5 主题文档源码](https://github.com/ant-design/ant-design/blob/6.6.5/docs/react/customize-theme.en-US.md)
- [CSS 兼容与第三方样式方案](https://ant.design/docs/react/compatible-style)

---

## 8. 可访问性基线

### 8.1 官方当前做法

官方源码提供共享 `accessibilityTest`：

- 使用 Testing Library 渲染组件或 demo；
- 使用 `jest-axe` 执行 axe 检测；
- 默认要求 `toHaveNoViolations()`；
- 可按组件声明禁用的规则或跳过极少数特殊 demo。

在 6.6.5 源码快照中：

- 有 **73 个测试文件引用**共享 accessibility helper（包含专门 a11y 测试及少量普通测试文件）；
- 几乎所有核心组件都有 `a11y.test.ts`；
- 发布日志持续记录键盘、ARIA、焦点和屏幕阅读器问题，而不是把无障碍当一次性专项。

### 8.2 v6.1–6.6 可见的重点

- Modal / Drawer：focus trap、打开后焦点、关闭后焦点恢复；
- Tooltip / Popover / Popconfirm：ESC 关闭、保留 `aria-describedby`；
- Input / Select / Tag / Steps：Enter、Space 激活行为；
- Carousel / Upload / Modal / Notification：本地化 accessible name；
- Progress / Skeleton / DatePicker / Collapse：隐藏装饰性 SVG、separator、图标，避免重复播报；
- Table：排序、筛选、固定表头、多表结构和 selection checkbox 的 ARIA；
- Splitter：separator 语义及 `aria-valuemin/max`；
- 动画组件支持 `prefers-reduced-motion`；
- `ConfigProvider.focusOutline` 统一控制可见焦点样式。

### 8.3 建议作为组件验收门槛

每个组件应至少覆盖：

- 正确 role、name、state、value；
- label / description 关联；
- Tab 顺序与 focus-visible；
- Enter / Space / Escape / Arrow Keys 等键盘模型；
- portal 弹层焦点圈定和焦点恢复；
- disabled / readonly 不可误触发；
- 装饰节点 `aria-hidden`；
- 动态状态变化的可感知性；
- `prefers-reduced-motion`；
- RTL；
- axe 自动化 + 人工键盘测试 + 至少一种屏幕阅读器抽检。

注意：**axe 无违规不等于符合完整 WCAG**。官方实践可作为自动化下限，不应作为唯一验收方式。

来源：

- [共享 accessibilityTest 源码](https://github.com/ant-design/ant-design/blob/6.6.5/tests/shared/accessibilityTest.tsx)
- [6.6.5 Changelog](https://github.com/ant-design/ant-design/blob/6.6.5/CHANGELOG.en-US.md)
- [测试环境初始化](https://github.com/ant-design/ant-design/blob/6.6.5/tests/setupAfterEnv.ts)

---

## 9. SSR、静态样式与浏览器兼容

### 9.1 SSR

官方提供三种样式交付路线：

1. **内联抽取**：通过 `@ant-design/cssinjs@2.x` 的 `createCache`、`StyleProvider`、`extractStyle` 将当前渲染使用的样式写入 HTML；
2. **全量静态导出**：通过 `@ant-design/static-style-extract` 生成完整 CSS；
3. **按需静态导出**：从 SSR cache 提取实际使用的 CSS，生成带 hash 的独立文件。

官方明确讨论了内联模式与独立 CSS 的权衡：前者减少请求但增加 HTML 体积，后者利于跨页面缓存但多主题需要额外生成。

### 9.2 兼容性

- v6 仅支持现代浏览器，不支持 IE；
- 官方默认支持现代浏览器最近两个版本；
- 默认使用 CSS Variables、`:where()` 与 CSS Logical Properties；
- 旧浏览器可通过 `hashPriority="high"`、`legacyLogicalPropertiesTransformer` 等有限降级，但这不是 IE 兼容承诺；
- `@layer` 在 SSR 中必须先声明 layer 顺序，再注入使用该 layer 的样式；
- zero-runtime CSS 与 reset CSS 也要显式进入正确 layer，否则可能出现优先级错误。

### 9.3 对齐标准

- SSR 输出必须确定性，服务端与客户端 class / token 结果一致；
- 多请求之间不得泄漏样式 cache；
- 支持按请求主题、嵌套主题和多主题；
- 有 hydration 测试；
- portal 组件在 SSR 阶段不得直接依赖 `window` / `document`；
- 文档明确 inline、full export、on-demand、zero-runtime 四类策略；
- 明确浏览器矩阵和 CSS 特性基线；
- Shadow DOM、CSP nonce、CSS layer 和微前端容器应纳入高级场景。

来源：

- [官方 SSR 文档](https://ant.design/docs/react/server-side-rendering)
- [6.6.5 SSR 文档源码](https://github.com/ant-design/ant-design/blob/6.6.5/docs/react/server-side-rendering.en-US.md)
- [CSS Compatible 文档](https://ant.design/docs/react/compatible-style)
- [CSS-in-JS SSR 技术文章](https://ant.design/docs/blog/extract-ssr)
- [CSS-in-JS Hydration 技术文章](https://ant.design/docs/blog/hydrate-cssinjs)

---

## 10. React 与包兼容性

### 10.1 官方要求

- React >= 18；
- React DOM >= 18；
- 原生支持 React 19；
- `@ant-design/icons >= 6.0.0`；
- `@ant-design/icons@6` 与 antd v5 不兼容，必须成组升级；
- 不支持 React 17 及更低版本；
- 包入口包括 CJS `lib/index.js`、ESM `es/index.js`、UMD `dist/antd.min.js`；
- npm 发布文件限定为 `dist`、`es`、`lib`、`locale` 等；
- `sideEffects` 仅声明 CSS，服务于 tree shaking。

### 10.2 官方 CI 的 React 矩阵

- 单独运行 React 18 legacy 矩阵；
- 同时运行最新 React 矩阵；
- 构建后分别测试源码、`lib`、`es`、`dist`、`dist-min`；
- Node 环境另有专项测试。

对 Solid 版本的等价要求应是：

- 明确最低 Solid 版本与支持矩阵；
- 至少测试最低支持版本和最新稳定版本；
- ESM / CJS（若提供）/ browser bundle / 类型声明均做消费测试；
- package exports、sideEffects、按组件导入、tree shaking 和 SSR import 都应有真实 fixture；
- 不允许只在 monorepo 源码路径下测试通过。

来源：

- [6.6.5 package.json](https://github.com/ant-design/ant-design/blob/6.6.5/package.json)
- [v5 → v6 官方迁移指南](https://ant.design/docs/react/migration-v6)
- [官方 test.yml](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/test.yml)
- [test-all.sh](https://github.com/ant-design/ant-design/blob/6.6.5/scripts/test-all.sh)

---

## 11. 测试与工程质量基线

以下数字来自 `6.6.5` tag 的官方源码快照，用于说明规模，不应被当作简单 KPI：

| 项目                                     | 6.6.5 源码快照 |
| ---------------------------------------- | -------------: |
| `components/**` 下 `*.test.ts(x)`        |           1022 |
| 组件 demo `*.tsx`                        |           1179 |
| 组件图片测试文件                         |             67 |
| semantic demo 测试文件                   |             60 |
| 引用共享 accessibility helper 的测试文件 |             73 |

### 11.1 官方质量层次

1. **静态检查**
   - TypeScript；
   - ESLint；
   - Biome；
   - Markdown lint；
   - Changelog 检查；
   - `DESIGN.md` 检查；
   - CSS-in-JS 检查。
2. **单元与交互测试**
   - Jest + jsdom；
   - Testing Library；
   - user-event；
   - Jest 与迁移中的 Vitest 双轨。
3. **无障碍测试**
   - `jest-axe`；
   - demo 级批量 a11y；
   - 键盘和 ARIA 专项回归。
4. **视觉测试**
   - Puppeteer 图片快照；
   - PR 分片生成截图；
   - 与基线做视觉 diff，并上传报告。
5. **构建产物测试**
   - `es`、`lib`、`dist`、`dist-min` 分别运行 demo / 测试；
   - Dekko 校验发布文件结构；
   - Node 环境 import 测试。
6. **兼容矩阵**
   - React 18；
   - 最新 React；
   - Node 环境。
7. **性能与体积**
   - PR `size-limit`；
   - Changelog 中持续记录热点组件性能优化；
   - Table 等组件关注算法复杂度和缓存。
8. **站点与发布**
   - site build / site test；
   - preview build / deploy；
   - 包版本校验；
   - npm 临时预览包；
   - 自动升级依赖和文件变更守卫。

### 11.2 对齐建议

不能仅要求“每个组件有一个 render test”。更合理的验收矩阵是：

- API 类型测试；
- controlled / uncontrolled；
- 键盘与鼠标；
- focus / blur；
- portal / container；
- RTL；
- locale；
- theme / token / CSS variable；
- semantic slots；
- responsive；
- SSR / hydration；
- snapshot / visual regression；
- reduced motion；
- 异步竞态与 callback stale closure；
- falsy value、空值、动态删除 props；
- 构建产物消费；
- tree-shaking / size budget；
- 性能基准（大数据 Table、Tree、Select、Listy 等）。

来源：

- [package.json scripts](https://github.com/ant-design/ant-design/blob/6.6.5/package.json)
- [Jest 配置](https://github.com/ant-design/ant-design/blob/6.6.5/.jest.js)
- [图片测试配置](https://github.com/ant-design/ant-design/blob/6.6.5/.jest.image.js)
- [test-all.sh](https://github.com/ant-design/ant-design/blob/6.6.5/scripts/test-all.sh)
- [GitHub Actions 测试矩阵](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/test.yml)
- [Size Limit workflow](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/size-limit.yml)
- [Visual Regression workflow](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/visual-regression-diff-build.yml)

---

## 12. 建议主线程采用的对齐优先级

以下是从官方能力反推的审计顺序，不包含对本仓库的实际判断。

### P0：组件库底座

- ConfigProvider 的 locale、direction、size、variant、theme、component defaults；
- token 三层模型、component token、CSS variables；
- Semantic DOM + `classNames` / `styles`；
- portal、overlay、focus、scroll lock 统一基础设施；
- SSR / hydration / static extraction；
- 最低与最新 Solid 版本矩阵；
- a11y 自动测试和视觉回归；
- deprecated API warning 与版本策略。

如果底座未完成，优先补底座，而不是同时复制几十个组件。

### P1：高频复杂组件

- Form / Form.Item / Form.List；
- Table；
- Select / AutoComplete / Cascader / TreeSelect；
- DatePicker / TimePicker；
- Modal / Drawer / Message / Notification；
- Upload；
- Menu / Dropdown；
- Tree；
- Input 系列。

这些组件最能暴露受控状态、异步、弹层、焦点、虚拟化、类型和主题体系是否可靠。

### P2：最新版新增与性能组件

- Masonry；
- BorderBeam；
- Listy；
- Splitter；
- ColorPicker；
- Tour；
- Watermark；
- QRCode；
- Input.OTP；
- Statistic.Timer；
- Tag.CheckableTagGroup；
- FloatButton.BackTop progress；
- Tree `useTree` / autoExpand scroll。

### P3：开发者体验与治理

- 官方风格的迁移 CLI / codemod；
- API 元数据自动生成；
- semantic slot 文档自动生成；
- token 元数据与主题编辑器；
- `DESIGN.md` / LLM-friendly docs；
- changelog 和版本校验；
- 包体积预算；
- 预览包和 PR preview；
- deprecation telemetry 或至少静态扫描。

---

## 13. 用于差距分析的高标准检查表

主线程可以按每个组件逐项评分：

| 维度   | 验收问题                                                                    |
| ------ | --------------------------------------------------------------------------- |
| 覆盖度 | 是否有官方同名组件、子组件、静态方法和 hooks/等价 primitive？               |
| API    | props、默认值、callback 参数及触发顺序是否一致？                            |
| 状态   | controlled、uncontrolled、`undefined`、清空、动态 props 是否正确？          |
| DOM    | 是否有稳定 Semantic DOM，而不是偶然接近的 DOM？                             |
| 定制   | 是否支持 slot 级 class/style、函数式定制和全局默认？                        |
| 主题   | 是否有全局 token、组件 token、算法、CSS vars、暗黑、紧凑和嵌套主题？        |
| 弹层   | container、层级、定位、ESC、mask、scroll lock、焦点圈定与回归是否完整？     |
| A11y   | role/name/state、键盘、focus-visible、reduced-motion、axe 是否过关？        |
| RTL    | 布局、键盘、图标、动画和 placement 是否使用逻辑方向？                       |
| 国际化 | 文案、日期、占位、可访问名称是否统一进入 locale？                           |
| SSR    | 服务端 import、样式提取、hydration、多请求隔离是否通过？                    |
| 性能   | 大数据、虚拟化、避免 O(n²)、稳定 callback、批量更新是否有基准？             |
| 类型   | 泛型推导、ref、事件类型、子组件类型、deprecated 标记是否准确？              |
| 测试   | unit、interaction、a11y、semantic、image、visual、build artifact 是否覆盖？ |
| 文档   | API、demo、semantic slots、tokens、FAQ、迁移指南是否齐全？                  |
| 发布   | tree shaking、sideEffects、exports、包体积、变更日志、预览包是否可靠？      |

建议评分时把“存在组件”仅计为基础分；只有行为、可访问性、主题、SSR、类型、测试与文档均达到要求，才算真正对齐。

---

## 14. 官方一手来源索引

所有链接均于 2026-10-08 访问。

### 版本与包

- [antd npm package](https://www.npmjs.com/package/antd)
- [antd npm registry metadata](https://registry.npmjs.org/antd)
- [GitHub Releases](https://github.com/ant-design/ant-design/releases)
- [Release 6.6.5](https://github.com/ant-design/ant-design/releases/tag/6.6.5)
- [6.6.5 package.json](https://github.com/ant-design/ant-design/blob/6.6.5/package.json)
- [6.6.5 components/index.ts](https://github.com/ant-design/ant-design/blob/6.6.5/components/index.ts)

### 文档与变更

- [Components Overview](https://ant.design/components/overview/)
- [6.6.5 Changelog](https://github.com/ant-design/ant-design/blob/6.6.5/CHANGELOG.en-US.md)
- [v5 to v6 Migration](https://ant.design/docs/react/migration-v6)
- [Customize Theme](https://ant.design/docs/react/customize-theme)
- [Server Side Rendering](https://ant.design/docs/react/server-side-rendering)
- [CSS Compatible](https://ant.design/docs/react/compatible-style)
- [Common Props](https://ant.design/docs/react/common-props)
- [Ant Design CLI](https://ant.design/docs/react/cli)
- [DESIGN.md](https://ant.design/design.md)

### 测试与工程

- [test.yml](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/test.yml)
- [size-limit.yml](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/size-limit.yml)
- [visual-regression-diff-build.yml](https://github.com/ant-design/ant-design/blob/6.6.5/.github/workflows/visual-regression-diff-build.yml)
- [Jest config](https://github.com/ant-design/ant-design/blob/6.6.5/.jest.js)
- [Image test config](https://github.com/ant-design/ant-design/blob/6.6.5/.jest.image.js)
- [Accessibility helper](https://github.com/ant-design/ant-design/blob/6.6.5/tests/shared/accessibilityTest.tsx)
- [test-all.sh](https://github.com/ant-design/ant-design/blob/6.6.5/scripts/test-all.sh)

## 15. 研究边界

- 本文没有审计 `ant-design-solid` 的现有组件、代码质量或实际缺口；
- 本文没有把 React 专属实现方式直接规定为 SolidJS 实现方式；
- 数量统计来自官方 `6.6.5` tag 的源码文件快照，可能包含兼容目录或测试辅助文件，因此只用于工程规模参考；
- 对齐应以用户可观察行为和设计契约为主，不要求复刻 React 内部架构；
- 后续如 npm `latest` 更新，应先更新版本基线，再重新执行差距分析。
