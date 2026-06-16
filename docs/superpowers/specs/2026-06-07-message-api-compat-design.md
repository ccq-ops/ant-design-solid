# Message API Compatibility Design

## Goal

Bring `@solid-ant-design/core` message API closer to Ant Design's public message API while preserving existing Solid-friendly usage.

## Scope

Implement common public API compatibility:

- Static methods: `open`, `info`, `success`, `error`, `warning`, `loading`, `destroy`, `config`, `useMessage`.
- Callable thenable return handles while preserving `handle.close()`.
- Shortcut overloads: `(content, duration?, onClose?)`, `(content, onClose)`, and `(config)`.
- Config fields: `content`, `duration`, `type`, `onClose`, `key`, `icon`, `className`, `style`, `onClick`, `pauseOnHover`, `classNames`, `styles`.
- Global config fields: `top`, `duration`, `getContainer`, `maxCount`, `prefixCls`, `rtl`, `pauseOnHover`, `classNames`, `styles`, `stack`.
- Local `useMessage(config?)` instance with Solid JSX context holder.

Internal antd debug APIs are out of scope:

- `_InternalPanelDoNotUseOrYouWillBeFired`
- `_InternalListDoNotUseOrYouWillBeFired`

## Architecture

`message.ts` owns notice lifecycle, global config, overloaded APIs, handles, timers, and local/global instance creation. `holder.tsx` owns JSX rendering, custom icons, custom styles, semantic slots, and hover pause/resume events.

Every close path flows through one close function so auto close, callable handle close, `handle.close()`, `destroy(key)`, `destroy()`, and `maxCount` eviction all clear timers, remove the notice, invoke `onClose`, and resolve the thenable exactly once.

## Rendering and styling

The holder keeps the current class naming pattern but supports custom prefix classes, top offset, RTL class, per-notice class/style, click handlers, custom icons, and semantic class/style slots. Semantic slots map to the simpler Solid DOM structure as follows:

- `root` and `list`: message container.
- `wrapper`: notice wrapper.
- `listContent`: notice content box.
- `icon`: icon wrapper.
- `title`: content text wrapper.

`stack` is implemented as compatibility-level display limiting: when enabled and notice count exceeds the threshold, only the latest threshold notices are rendered. Full antd stack animation is not included.
