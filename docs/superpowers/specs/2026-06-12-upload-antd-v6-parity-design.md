# Upload Ant Design v6 Parity Design

## Goal

Expand `Upload` so Solid users can rely on the Ant Design v6 Upload API shape while keeping Solid conventions: `class` instead of `className`, `JSX.Element` instead of React nodes, and DOM-native event/types where appropriate.

## Scope

The component will support default XMLHttpRequest uploads, custom requests, `beforeUpload` file transforms and `Upload.LIST_IGNORE`, controlled and uncontrolled file lists, drag/drop, paste, directory selection, list variants, list action customization, preview and download callbacks, semantic `classNames` and `styles`, and an `Upload.Dragger` helper.

React-only compatibility props such as `supportServerRender` and `hasControlInside` are intentionally not public API for this Solid implementation.

## Architecture

`interface.ts` owns the public Solid types. `upload.tsx` owns state transitions, request orchestration, input/drop/paste handling, and rendering. The implementation keeps a small default request helper inside the Upload module because it is tightly coupled to the request callback contract.

The component will continue to expose a hidden file input and trigger wrapper. Drop and paste events feed the same `handleFiles` path as input changes. Upload list rendering will be more configurable but remain local to the component for now.

## Behavior

- `beforeUpload(file, fileList)` runs before a file is added. `false` adds the file without uploading, `Upload.LIST_IGNORE` skips it entirely, `File`/`Blob`/`string` replaces the uploaded payload.
- Without `customRequest`, `Upload` uses `XMLHttpRequest` when `action` exists. If no `action` exists, it marks the file as done, preserving the existing lightweight behavior.
- `customRequest(options, { defaultRequest })` receives the complete request options and can call `defaultRequest`.
- `showUploadList` accepts a boolean or object with per-action visibility, custom icons, and extra content.
- `listType` changes list classes and enables thumbnail rendering for picture variants.
- `Upload.Dragger` renders the same behavior with drag classes and `type="drag"`.

## Testing

Tests will cover file interception, request option construction, default xhr callbacks, list customization, preview/download/remove actions, drag/drop, paste, directory attributes, semantic classes/styles, and `Upload.Dragger`.

## Documentation

The Upload docs page will add examples for manual upload, transformed uploads, default request, dragger, paste/drop, picture lists, list customization, and semantic styles. API tables will be updated for `Upload`, `UploadFile`, `UploadRequestOptions`, `showUploadList`, and `Upload.Dragger`.
