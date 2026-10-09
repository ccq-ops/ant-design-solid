# Ant Design Solid 对齐 Ant Design 6.6.5 差距分析

> 审计日期：2026-10-09
> 上游基线：`antd@6.6.5`，发布于 2026-09-20  
> 本仓库版本：`@solid-ant-design/core@0.2.1`，其余公开包为 `0.2.0`

## 1. 结论摘要

当前项目已经不是“组件库雏形”，而是一个覆盖面较广、测试数量可观、文档示例丰富的
SolidJS Ant Design 实现：

- `@solid-ant-design/core` 根入口当前导出 69 个模块。
- 组件源码约 5.7 万行，组件测试约 3.3 万行。
- 组件包有 96 个测试文件、1595 个测试用例，全部通过。
- 文档现有约 70 个 MDX 页面、735 个交互示例。
- TypeScript 类型检查、单元测试、构建均可通过。

但如果把标准提高到“可以长期对齐 Ant Design 最新稳定版，并作为生产级设计系统基础设施”
的水平，当前最大的缺口不是继续机械补几个属性，而是以下六个系统性问题：

1. **对齐基线已经落后**：现有计划固定在 `antd@6.4.4`，最新稳定版已经是 `6.6.5`。
2. **最新组件路线发生变化**：上游新增了 `Listy`，并开始引导旧 `List` 迁移到 `Listy`；
   本仓库的 `list/` 目录为空，`List` 和 `Listy` 均未公开。
3. **公开 API 仍处于混合状态**：大量组件仍暴露 React 风格或 v6 已废弃 API，
   `classNames`、`rootClassName`、旧 popup/dropdown alias 等尚未完成统一。
4. **主题和 CSS-in-JS 的“声明能力”高于“运行时能力”**：
   `cssVar`、`zeroRuntime`、`hashed`、CSP 等字段虽已进入类型，但部分没有实际运行时效果。
5. **缺少视觉回归、自动可访问性和跨浏览器门禁**：
   当前测试更擅长验证逻辑，不足以证明视觉和交互与 antd 一致。
6. **发布产物和文档站体积偏大**：
   core 只有单一根 bundle，缺少组件级 exports；文档构建出现多处超大 chunk。

因此，不建议把下一阶段目标定义为“继续照着旧清单逐项补 API”。建议改成：

> **先建设持续对齐基础设施，再完成 6.6.5 API/行为补齐，最后建立视觉、可访问性、性能和发布质量门禁。**

## 2. 当前成熟度评分

| 维度       | 评分 | 判断                                                                         |
| ---------- | ---: | ---------------------------------------------------------------------------- |
| 组件覆盖度 | 8/10 | 主流组件覆盖较完整，但缺少 List/Listy，App 文档缺失                          |
| API 对齐度 | 5/10 | 已有大量 v6 API，但旧别名、废弃项和最新 6.5/6.6 增量尚未统一                 |
| 行为正确性 | 7/10 | 1595 个组件测试通过，但跨浏览器和复杂真实页面回归仍不足                      |
| 视觉一致性 | 4/10 | 没有截图基线和视觉 diff，无法系统证明与 antd 一致                            |
| 可访问性   | 5/10 | 代码中已有较多 ARIA 处理，但没有 axe/WCAG 自动门禁                           |
| 主题系统   | 5/10 | token/algorithm 基础较完整，CSS variables/zero-runtime 等能力不完整          |
| 国际化     | 3/10 | ConfigProvider 有 locale 容器，但缺少完整 locale 包和多语言矩阵              |
| SSR/CSP    | 4/10 | 有 cache/extractStyle 原型，但缺少完整 SSR 注入、rehydration、nonce 闭环     |
| 构建与发布 | 5/10 | ESM/CJS/types/Changesets 已具备，但 core 单 bundle、缺少组件级入口和产物审计 |
| 文档与生态 | 7/10 | 示例很多，但缺 App/List/Listy，API 表和源码之间没有自动校验                  |

综合判断：**功能型 Beta，尚未达到高标准生产级设计系统的工程成熟度。**

## 3. 与最新 antd 6.6.5 的直接差距

### 3.1 现有对齐计划已过期

`docs/antd-v6-api-sync-plan.md` 的基线是：

```text
antd@6.4.4，审计日期 2026-06-15
```

截至本次审计，npm `latest` 已是：

```text
antd@6.6.5，发布于 2026-09-20
```

这意味着旧计划至少遗漏了 `6.5.0` 到 `6.6.5` 的新增能力、类型导出、行为修复和弃用变化。
旧计划可以作为 6.4.4 的历史输入，但不应该继续作为执行基线。

### 3.2 组件覆盖缺口

#### P0：Listy

antd 6.6.0 新增 `Listy`，定位为高性能虚拟列表，包含：

- 虚拟滚动
- 分组
- sticky header
- imperative `scrollTo`
- 拖拽排序示例

antd 6.6.x 已经开始在旧 `List` 上给出迁移到 `Listy` 的提示。当前仓库：

- `packages/components/src/list/` 是空目录。
- 根入口没有导出 `List`。
- 没有 `Listy`。
- 文档没有 List/Listy 页面。
- ConfigProvider 虽然旧计划提到 `list`，实际还没有可配置组件。

建议不要只按旧计划实现传统 List，而应采用：

1. 先实现 `Listy` 的核心能力和稳定 API。
2. 再根据兼容目标决定是否实现传统 `List`。
3. 如果实现 `List`，文档中直接给出向 `Listy` 迁移的方向，避免新增长期技术债。

#### P1：独立公开入口和复合组件完整性

需要重新核对以下公开入口：

- `BackTop`：上游仍有独立导出，同时 `FloatButton.BackTop` 相关类型正在弃用调整。
- `Cascader.Panel`
- `ColorPicker.Panel`
- `Image.PreviewGroup`
- `Form.ErrorList`
- `Layout.Sider`
- `Statistic.Countdown`
- `Upload.Dragger`
- `Menu.Item` / `Menu.SubMenu` / `Menu.Divider`

当前本地有些已经实现运行时复合组件，但类型导出、ref 类型、文档和最新上游导出并不完全一致。
不能只检查组件是否“能渲染”，还应检查：

- 根入口是否可导入。
- 复合静态成员是否存在。
- Props 和 Ref 类型是否可导入。
- deprecated 类型是否仍被不必要地公开。
- Solid 命名转换是否一致。

### 3.3 6.5.0 之后遗漏的主要新增 API

以下是旧 6.4.4 计划没有完整覆盖、应纳入新基线的高价值项目：

| 组件/系统             | 6.5/6.6 增量                                      | 本地建议                     |
| --------------------- | ------------------------------------------------- | ---------------------------- |
| Listy                 | 新增高性能虚拟列表                                | P0 新组件                    |
| ConfigProvider        | `focusOutline` token                              | 增加 token、样式消费和测试   |
| ConfigProvider        | Input.Search/Password/OTP 全局 `variant`          | 检查配置传播                 |
| ConfigProvider        | Tooltip/Popover/Popconfirm 全局 enter/leave delay | 增加配置传播                 |
| Tree                  | `useTree`、`scrollTo({ autoExpand: true })`       | 补 hook 和 ref 行为          |
| FloatButton.BackTop   | `showProgress`                                    | 补 API、样式、reduced-motion |
| Table                 | `expandable.forceRender`                          | 补预渲染行为                 |
| Pagination            | `components.sizeChanger`                          | 补插槽 API                   |
| Mentions              | `popupRender`                                     | 补自定义弹层                 |
| Tabs                  | `more.popupRender`                                | 补 overflow 自定义           |
| Image                 | `preview.wheel`                                   | 补滚轮缩放控制               |
| BorderBeam            | `duration`、`lineWidth`、`size`、`count`          | 与本地接口逐项核对           |
| Select                | 函数形式 `tokenSeparators`                        | 补类型与行为                 |
| Input.Password        | `visibilityToggle.tabIndex`                       | 补键盘可访问性               |
| DatePicker/TimePicker | `onClear`                                         | 补回调                       |
| Dropdown              | `left`、`right` placement                         | 补定位和测试                 |
| Menu                  | 回调参数增加 `itemData`                           | 补类型与回调                 |
| Modal                 | `scrollLock`                                      | 补 body scroll lock 策略     |
| Slider                | range `disabled` 数组                             | 支持单独禁用 handle          |
| Steps                 | `maxCount` 折叠模式                               | 补高密度步骤场景             |
| Watermark             | 每行 content font style                           | 扩展 content/font 模型       |
| Layout.Sider          | semantic `classNames`/`styles`                    | 对齐语义 DOM                 |

### 3.4 最新 Ref API 明显落后

antd 6.6.0 为大量组件补充或导出了 `nativeElement` ref，包括：

- Avatar.Group
- Badge.Ribbon
- Breadcrumb
- Calendar
- Card.Grid / Card.Meta
- Carousel
- Descriptions
- Divider
- Empty
- FloatButton.Group
- QRCode
- Result
- Skeleton
- Space.Compact
- Spin
- Splitter
- Transfer
- Watermark

本仓库已经在 Input、Checkbox、Radio、Switch、Rate、Slider、Tooltip 等组件上实现了一部分
`nativeElement`，方向正确；但覆盖范围仍明显不足。

建议建立统一的 `ComponentRef<TElement, TMethods>` 约定，至少保证：

- `nativeElement`
- `focus` / `blur`（适用时）
- 组件特有命令式方法
- ref 类型从根入口导出
- 每个 ref 有类型测试和运行时测试

## 4. 公开 API 治理问题

### 4.1 `classNames` 与 Solid 命名尚未收口

源码中 `classNames` 仍出现在约 162 个非测试文件，`classes` 仅出现在少量文件。
旧计划提出把 semantic `classNames` 改为 `classes`，但当前没有完成。

这是一个需要先做 ADR 的问题，而不是简单全局替换：

- **完全追随 antd**：保留 `classNames`，降低迁移成本和文档差异。
- **完全 Solid 化**：统一为 `classes`，但必须提供明确迁移策略。
- **双轨兼容期**：`classNames` deprecated，`classes` 为主，并定义冲突优先级。

建议采用双轨兼容期，至少跨一个 minor：

```text
classes > classNames > ConfigProvider defaults
```

并通过类型测试确保最终移除时间可控。

### 4.2 React 风格别名和 deprecated API 仍较多

当前源码中仍可找到：

- `rootClassName`
- `popupClassName`
- `className`
- `bordered`
- 旧 popup/dropdown/overlay alias
- `expandIconPosition`
- `Input.Group`
- 其他 v6 已替换 API

这里不应“一刀切删除”。仓库仍是 `0.x`，现在确实是清理窗口，但需要：

1. 建立一份机器可读的 API manifest。
2. 标记 `supported` / `deprecated` / `solid-specific` / `unsupported`。
3. 对 deprecated API 提供开发环境 warning。
4. 文档不再展示 deprecated API。
5. 在下一个明确的 breaking release 中删除。

### 4.3 缺少自动 API diff

现有 `package-exports.test.ts` 只验证 package.json 的 types 入口是否指向正确声明文件，
没有验证组件 API 与上游差异。

建议增加 CI 任务：

```text
scripts/audit-antd-api.mts
```

功能至少包括：

- 下载或读取指定 `antd` 版本的 `.d.ts`。
- 提取根导出、组件 Props、Ref、复合组件和 deprecated 标记。
- 应用 React -> Solid 命名映射。
- 和本地声明做 diff。
- 输出 JSON + Markdown。
- 对“新增未处理差异”阻断 CI。

这样以后升级 `6.6.5 -> 6.6.6` 不需要再次靠人工通读全部声明。

## 5. 主题与 CSS-in-JS：当前最需要拔高的基础设施

### 5.1 类型存在但运行时没有完整实现

`ThemeConfig` 已声明：

- `algorithm`
- `components`
- `cssVar`
- `hashed`
- `inherit`
- `token`
- `zeroRuntime`

其中 algorithm、token、components、inherit 已有一定运行时支撑；但源码检索显示
`cssVar`、`hashed`、`zeroRuntime` 主要停留在类型和上下文合并层，没有完整样式生成路径。

这会造成危险的“假能力”：用户能写配置、TypeScript 不报错，但页面行为没有对应变化。

建议优先选择一种策略：

1. **完整实现**这些能力；或
2. 在实现前从公开类型中移除/标记 experimental。

生产级组件库不应长期保留“类型承诺大于运行时实现”的状态。

### 5.2 CSP 没有闭环

ConfigProvider 已有：

```ts
interface CSPConfig {
  nonce?: string
}
```

但当前 CSS-in-JS 创建 `<style>` 时没有消费 nonce。需要把 CSP 配置传入 StyleProvider，
并写到所有动态 style 标签：

```html
<style nonce="...">
```

还应测试：

- 根 ConfigProvider nonce。
- 嵌套 ConfigProvider。
- SSR 抽取后的 nonce。
- 客户端 hydration 不重复插入 style。

### 5.3 SSR 能力只完成了原型

当前具备：

- `createCache`
- `extractStyle`
- 服务端不直接访问 document

但仍缺：

- 请求级 cache 隔离的标准用法。
- `wrapSSR` 实际注入能力。
- 服务端 style tag metadata。
- 客户端 rehydration。
- 已存在 style 的复用和去重。
- streaming SSR 场景。
- nonce、layer、container。

建议提供官方 SSR 文档和集成测试，至少覆盖 SolidStart：

1. 服务端 render。
2. 提取 critical CSS。
3. 注入 HTML head。
4. 客户端 hydrate。
5. 确认没有重复 style、闪烁和 hash 不一致。

### 5.4 CSS 序列化能力偏轻

自研 serializer 当前适合基础样式，但生产级 CSS-in-JS 还需要评估：

- vendor prefix
- keyframes
- CSS layers
- logical properties
- selector priority
- nested at-rule
- CSS variables
- style container / shadow root
- transformers / linters
- deterministic ordering
- style garbage collection
- HMR 更新

建议不要只继续堆 serializer 特例。应先定义与 `@ant-design/cssinjs` 对齐到什么程度，
并用兼容性测试集约束实现。

## 6. 测试体系差距

### 6.1 当前优势

本次实际执行结果：

- Typecheck：通过。
- 组件测试：96 个文件、1595 个用例通过。
- CSS-in-JS：4 个文件、9 个用例通过。
- Theme：1 个文件、12 个用例通过。
- Icons：3 个文件、16 个用例通过。
- Docs：26 个文件、90 个用例通过。
- Build：通过。
- Production dependency audit：0 个已知漏洞。

这说明基础逻辑测试并不薄弱。

### 6.2 缺少视觉回归

仓库中没有 `toHaveScreenshot` 或等价视觉回归基线。

对于设计系统，这是最高优先级缺口之一，因为以下问题很难靠 DOM 断言发现：

- 1px 边框、圆角、阴影、间距偏差。
- dark/compact/RTL 下样式错误。
- popup 定位和箭头偏差。
- 动画中间状态。
- 字体和 line-height 导致的布局变化。
- 不同浏览器的 form control 差异。

建议建立与 antd 对照的截图矩阵：

- light / dark
- default / compact
- LTR / RTL
- small / middle / large
- enabled / hover / focus / active / disabled / loading / error
- Chromium / Firefox / WebKit

### 6.3 缺少自动可访问性门禁

代码中已有大量 `aria-*`，但没有 `axe` 或类似工具依赖，也没有 WCAG 阈值。

建议：

- 所有文档 demo 页面运行 axe。
- 对 popup、dialog、menu、tree、table、form 单独建立键盘流程测试。
- 覆盖 Enter、Space、Escape、Tab、Shift+Tab、方向键、Home/End。
- 验证 focus return、focus trap、aria-describedby、aria-live。
- 把 `prefers-reduced-motion` 纳入自动化。

antd 6.5/6.6 的更新中有大量 accessibility 修复，说明这不是“锦上添花”，而是持续维护主题。

### 6.4 E2E 覆盖和 CI 接入不足

当前 E2E 覆盖：

- button page
- drawer page
- home page
- 首页与 Button 页非颜色 WCAG A/AA axe 扫描

PR CI 和 Release workflow 已安装 Chromium 并执行 `pnpm test:e2e`，但 Playwright
目前仍只配置 Chromium。

建议至少：

- 在 PR CI 中执行关键 E2E。
- Release 前执行全量 E2E。
- 增加 Firefox 和 WebKit。
- 覆盖 Modal/Drawer focus、Select/DatePicker popup、Form、Table、Upload、Tree。

### 6.5 没有 coverage threshold

Vitest 配置有 coverage reporter，但没有 provider、阈值和 CI 命令。

建议不要一开始追求 100%，而是：

- 全局 statements/branches/functions/lines 建立合理基线。
- 核心基础设施（form、overlay、cssinjs、theme）设置更高阈值。
- 新代码禁止降低覆盖率。

## 7. 构建、产物与性能

### 7.1 Core 是单一大 bundle

初次审计时，`@solid-ant-design/core` 只公开根入口：

```json
{
  "exports": {
    ".": { "...": "..." }
  }
}
```

当时没有：

- `./button`
- `./form`
- `./date-picker`
- 组件级 preserveModules
- 明确 `sideEffects`

即使现代 bundler 能做一定 tree-shaking，也缺少可验证、可承诺的按需引入能力。

建议：

1. 输出 preserveModules 或每组件入口。
2. 增加组件级 package exports。
3. 明确 `sideEffects` 策略。
4. 增加 size-limit。
5. 用真实消费项目验证只引入 Button 时的 bundle。

实施进展：core 已改为 preserve-modules，并公开 `@solid-ant-design/core/button` 等组件级
ESM/CJS/types 入口；四个发布包均声明 `sideEffects: false` 和 Node.js 版本范围。构建后会
补全 Node16/NodeNext 可解析的 `.js` 声明引用，并为 `require` 条件生成独立 `.d.cts`，
避免 ESM 类型声明被错误用于 CommonJS。四个发布包根入口、core Button 子入口和 icons
单图标子入口的 ESM/CJS smoke test 已接入 CI。

### 7.2 文档站构建体积异常

本次构建可见：

- playground client chunk gzip 接近 1 MB。
- 某个 index client chunk约 11.5 MB。
- SSR components chunk约 31 MB。
- Form、Table MDX 超过 Babel 500 KB 优化阈值。
- Vite 明确报告多个 chunk 超过 500 KB。

这不会直接增加组件消费者体积，但会影响：

- 文档首屏。
- CI 构建时间。
- 本地开发 HMR。
- 搜索引擎抓取。
- 移动端浏览体验。

建议：

- demo 按需动态导入。
- 不把所有 demo/runtime/compiler 打入公共入口。
- Playground 的 TypeScript/compiler worker 独立 chunk。
- API 数据与示例源码改为静态 JSON 或懒加载。
- 对 Form/Table 超大 MDX 拆分 demo 文件。

实施进展：组件总览已改为只 eager import MDX `frontmatter`，不再把所有组件页面运行时代码
打进总览入口。对应 client index chunk 已从约 11.5 MB 降至约 153 KB，SSR components chunk
已从约 31 MB 降至约 542 KB。Form、Table 和 Playground 的进一步拆分仍待完成。

### 7.3 缺少产物质量工具

建议增加：

- `publint`
- `attw` / Are the Types Wrong
- `size-limit`
- pack 后安装 smoke test
- Node ESM/CJS 双模式导入测试
- Vite/Webpack/Rollup 消费测试
- SSR consumer test

实施进展：`publint --strict` 与 Are the Types Wrong 已作为 `pnpm package:lint` 接入 PR
和 Release CI，当前四个发布包在 Node10、Node16 ESM/CJS 与 bundler 解析矩阵中均为
`No problems found`。真实 bundler size budget、跨 bundler consumer 和 SSR consumer
仍待补充。

## 8. 国际化与本地化

当前 ConfigProvider 有通用 `locale` 字段，DatePicker 有英文默认 locale，但仓库没有完整 locale
目录和公开 locale 入口。

与 antd 最新版相比，缺口包括：

- 多语言 locale 包。
- DatePicker/TimePicker/Calendar 的区域格式。
- Pagination、Table、Transfer、Upload、Modal、Popconfirm、Tour 等文案。
- 可访问性名称的本地化。
- RTL locale 测试。

建议至少先提供：

- `en_US`
- `zh_CN`
- `zh_TW`
- `ja_JP`
- `ko_KR`

并设计 locale 类型，使组件新增字段时能通过 TypeScript 或测试发现缺失翻译。

## 9. 文档与开发者体验

### 9.1 已有优势

- 735 个 preview，覆盖面很好。
- 大多数组件都有 API 表。
- 有 Playground。
- 有主题、入门、贡献、变更日志页面。

### 9.2 需要补齐

- 缺 App 独立组件文档。
- 缺 List/Listy 文档。
- 缺完整 SSR 文档。
- 缺 CSP 文档。
- 缺国际化文档。
- 缺迁移指南和 deprecated 总表。
- 缺“与 antd 的差异”页面。
- 缺无障碍原则和键盘交互说明。
- README 对外部用户信息过少，缺安装、快速示例、浏览器支持、SSR、版本策略。

### 9.3 文档 API 表应自动生成或校验

当前 API 表主要是手写内容，容易与 interface 漂移。

建议至少做双向校验：

- interface 中公开 prop 必须出现在文档，或显式标记 internal。
- 文档中的 prop 必须存在于导出类型。
- deprecated prop 不应出现在默认 API 表。
- since/version 信息可进入 API manifest。

## 10. 推荐实施路线

### Phase 0：一周内完成基线治理

1. 把对齐基线从 6.4.4 更新为 6.6.5。
2. 建立自动 API diff 脚本和 machine-readable manifest。
3. 对 `classNames -> classes`、deprecated 策略写 ADR。
4. 把 format failure 和 lint warning 清零。
5. PR CI 增加 E2E smoke。

验收标准：

- 任意上游新版本可以一条命令生成 API 差异报告。
- 新增未处理 API 差异会在 CI 中可见。
- 所有主检查零 warning、零 formatting failure。

### Phase 1：两到四周，补齐 6.6.5 核心能力

优先顺序：

1. Listy。
2. List 兼容策略。
3. 6.5/6.6 新 API。
4. 全量 Ref/nativeElement。
5. 复合组件和类型导出。
6. ConfigProvider 最新配置传播。

不要在这一阶段同时大规模重写 CSS-in-JS，避免行为补齐和基础设施重构互相干扰。

### Phase 2：四到六周，主题和样式基础设施

1. CSS variables。
2. hashed 开关。
3. zero-runtime 的真实定义与实现。
4. CSP nonce。
5. SSR extraction + hydration。
6. CSS layer、style container/shadow root。
7. token 和 semantic DOM 一致性测试。

### Phase 3：质量门禁

1. Playwright 三浏览器。
2. 视觉回归矩阵。
3. axe + 键盘交互。
4. coverage threshold。
5. bundle size budgets。
6. package consumer matrix。

### Phase 4：稳定版准备

1. 清理 deprecated API。
2. 发布完整迁移指南。
3. 明确 semver 和上游同步 SLA。
4. 浏览器支持矩阵。
5. SSR/CSR/静态站点支持声明。
6. 安全响应和支持版本策略。

## 11. 建议的 P0/P1 Backlog

### P0

- [x] 新建 `antd@6.6.5` 根导出自动 API diff；Props、Ref 和 deprecated 深层 diff
      仍需继续扩展。
- [x] 实现 Listy；ADR 0002 明确新应用使用 Listy，deprecated List 暂不作为 core 新增 API。
- [ ] 修复 `cssVar` / `zeroRuntime` / `hashed` 类型与运行时不一致；其中 `hashed` 已完成
      ConfigProvider 到 CSS-in-JS 的运行时贯通。
- [x] CSP nonce 从 ConfigProvider 贯通到 style 标签，并补充嵌套 StyleProvider cache/nonce
      继承与 style 恢复测试。
- [x] 增加 Chromium 视觉回归基础设施，首批覆盖 Button variants、Listy sticky group 和
      Form methods；功能 E2E 已扩展到 Chromium、Firefox、WebKit，可访问性和视觉基线由
      Chromium 单独维护，完整主题/状态矩阵仍待扩展。
- [ ] 增加 axe 和键盘 E2E；首页和 Button 文档页的非颜色 WCAG A/AA axe 门禁已接入。
      颜色对比度与 Form 可访问名称债务记录在 `docs/accessibility-baseline.md`，复杂组件键盘流程
      仍需扩展。
- [x] Release/PR CI 安装 Chromium 并执行现有 E2E。
- [x] core 改为 preserve-modules 组件级构建和 exports，并增加 ESM/CJS 根入口与组件入口
      smoke test。

### P1

- [ ] 补齐 6.5/6.6 新增 API；已完成 Listy、BorderBeam `count/duration/lineWidth/size`、
      Mentions `popupRender`、Tabs `more.popupRender`、Modal `scrollLock`、Tree `useTree` 和
      `scrollTo({ autoExpand: true })`、Steps `maxCount`、Pagination `components.sizeChanger` 和
      Table `expandable.forceRender`，并已增加共享 `focusOutline` token。
- [ ] 补齐 nativeElement/ref 导出；已补 Alert、Breadcrumb、Calendar、Divider、Empty、
      QRCode、Result、Skeleton、Spin、Splitter、Transfer、Watermark，剩余复合组件与复杂组件
      Ref 继续处理。
- [ ] 完成 semantic classes 命名迁移策略。
- [ ] 清理 v6 deprecated API。
- [ ] 增加 locale 包。
- [ ] 完成 SSR/hydration 集成测试。
- [ ] 拆分 docs 超大 chunk；组件总览的全量 MDX eager import 已消除，Form、Table 和
      Playground 仍待拆分。
- [ ] 加入 publint、attw、size-limit 和 pack consumer tests；其中 publint、attw、
      ESM/CJS pack smoke test 已完成，size-limit、跨 bundler 和 SSR consumer 仍待补充。

## 12. 本次验证记录

执行命令：

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm test:e2e
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm audit --prod
```

结果：

- `lint`：通过，零 warning。
- `format:check`：通过。
- `typecheck`：通过。
- `test`：通过；组件包 1612 个用例通过，根 package exports 和脚本测试也已纳入。
- `build`：通过；组件总览 chunk 已显著缩小，Form、Table、Playground 仍有大 chunk warning。
- `audit --prod`：0 个已知漏洞。
- `test:e2e`：7 个 Chromium 用例全部通过，包含 3 个 axe 门禁用例和 Listy 真实页面测试。

## 13. 参考基线

- npm `antd@6.6.5` package metadata and declaration files，访问日期 2026-10-08。
- Ant Design 6.5.0–6.6.5 官方 changelog，访问日期 2026-10-08。
- 本仓库 `docs/antd-v6-api-sync-plan.md`。
- 本仓库 `packages/components/src`、`packages/theme/src`、`packages/cssinjs/src`。
- 本仓库 package manifests、Vite/Vitest/Playwright 配置及 GitHub Actions。
