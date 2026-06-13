# Image Antd V6 Parity Design

## Goal

Bring the Solid `Image` component to API and behavior parity with Ant Design v6 while keeping public naming idiomatic for Solid. The component will support semantic styling, progress placeholders, rich preview controls, controlled preview state, and grouped previews.

## Scope

The implementation targets the current Ant Design v6 Image API surface from `antd@6.4.4`, adapted for Solid:

- Use `class` and `rootClass` instead of React-style `className` and `rootClassName`.
- Keep `classNames` and `styles` for semantic DOM customization because those are object-shaped API names, not React prop aliases.
- Support deprecated antd fields only as light compatibility aliases where they do not complicate the implementation: `visible`, `onVisibleChange`, `rootClass`, `maskClass`, `toolbarRender`, and `wrapperStyle`.
- Preserve existing local compatibility fields: top-level `zIndex` and `getPopupContainer`.

## Public API

`ImageProps` will be based on image element attributes rather than div attributes. It will support `src`, `alt`, `width`, `height`, `fallback`, `placeholder`, `preview`, `prefixCls`, `previewPrefixCls`, `class`, `classList`, `style`, `rootClass`, `classNames`, `styles`, `wrapperStyle`, `zIndex`, `getPopupContainer`, `onLoad`, `onError`, `onClick`, and `onKeyDown`.

The `preview` prop will support `boolean | ImagePreviewConfig`. `ImagePreviewConfig` will include `src`, `alt`, `open`, `defaultOpen`, `visible`, `onOpenChange`, `onVisibleChange`, `getContainer`, `zIndex`, `mask`, `maskClass`, `rootClass`, `scaleStep`, `minScale`, `maxScale`, `closeIcon`, `icons`, `movable`, `focusTrap`, `afterOpenChange`, `onTransform`, `imageRender`, `actionsRender`, `toolbarRender`, and `cover`.

`placeholder` will support either a Solid node or `{ progress?: boolean | ImageProgressConfig }`. `ImageProgressConfig` will support `percent` and `render(progress, percent)`.

`Image.PreviewGroup` will be added. It will support `items`, `fallback`, `preview`, `previewPrefixCls`, `classNames`, `styles`, and `children`. Group preview config will support `current`, `defaultCurrent`, `onChange`, `onOpenChange`, `countRender`, `imageRender`, and the shared preview config fields.

## Solid API Adaptation

React-only prop names are not introduced as primary API. Examples and docs will use `class`, `rootClass`, `maskClass`, and Solid event signatures. Deprecated React-style compatibility names from antd are avoided unless a field is already present in this codebase or is necessary for parity notes. API documentation will call out the Solid names explicitly.

## Architecture

The Image folder will be split into focused files:

- `interface.ts`: public types and semantic slot names.
- `image.tsx`: wrapper image rendering, placeholder handling, fallback, group registration, and preview trigger.
- `preview.tsx`: portal-backed preview overlay, keyboard handling, focus trap, mask, close button, preview body, toolbar, and transform interactions.
- `preview-group.tsx`: `Image.PreviewGroup` context, item registration, current item control, and item list preview.
- `progress.tsx`: progress placeholder rendering.
- `transform.ts`: transform state helpers for zoom, rotate, flip, drag, wheel, and reset.
- `image.style.ts`: Ant Design v6-aligned CSS-in-JS styles and component tokens.
- `index.ts`: exports and compound component wiring.

State is controlled where `open` or `current` are provided and uncontrolled otherwise. Group context will let child images register previewable image metadata and open the shared preview at the clicked image.

## Preview Behavior

The preview overlay will support:

- Open/close by image click, close button, Escape, and mask click.
- Controlled and uncontrolled open state.
- Custom preview source and alt text.
- Configurable container and z-index.
- Optional mask and cover node.
- Zoom in, zoom out, rotate left, rotate right, flip X, flip Y, reset, dragging, wheel zoom, and double-click reset.
- Prev/next switching in groups.
- `onTransform` callbacks with the current transform and action name.
- `actionsRender`, `toolbarRender` alias, `imageRender`, `countRender`, and custom operation icons.
- A basic focus trap while open.

## Styling And Tokens

Styles will align with antd v6 Image tokens:

- `zIndexPopup = token.zIndexPopupBase + 80`
- `previewOperationColor = colorTextLightSolid` at 65% opacity
- `previewOperationHoverColor = colorTextLightSolid` at 85% opacity
- `previewOperationColorDisabled = colorTextLightSolid` at 25% opacity
- `previewOperationSize = token.fontSizeIcon * 1.5`
- `progressAnimationDuration = '3s'`

The class structure will follow antd naming under the configured prefix: `ads-image`, `ads-image-img`, `ads-image-cover`, `ads-image-placeholder`, `ads-image-preview`, `ads-image-preview-mask`, `ads-image-preview-body`, `ads-image-preview-img`, `ads-image-preview-close`, `ads-image-preview-switch`, `ads-image-preview-footer`, and `ads-image-preview-actions`.

## Documentation

`apps/docs/src/pages/components/image.mdx` will be updated to mirror antd Image examples with Solid syntax:

- Basic
- Fallback
- Placeholder
- Progress Placeholder
- Preview
- Preview From Different Source
- Preview Group
- Controlled Preview
- Custom Toolbar / Actions Render
- Custom Preview Render / Mask / Cover
- Semantic `classNames` / `styles`

The API documentation will include tables for Image, PreviewType, PreviewGroup, GroupPreviewType, ImageProgressConfig, operation icons, transform callback info, and semantic DOM slots.

## Testing

Tests will be written first for each behavior group. Coverage will include image attributes, fallback, placeholder and progress placeholder, semantic class/style slots, preview object config, controlled open state, callbacks, custom container, z-index, mask, cover, close icon, transforms, toolbar customization, group registration, items-based groups, current/onChange, prev/next switching, and docs type/build coverage through existing verification commands.

## Non-Goals

The implementation will not import React, `antd`, or `@rc-component/image`. It will not attempt pixel-perfect animation parity beyond matching the token structure, class structure, and visible layout semantics. Deprecated antd fields will not be emphasized in examples.
