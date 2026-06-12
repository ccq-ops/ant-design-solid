import type { Component } from 'solid-js'

function ExceptionImage(props: { title: string; code: string; accent: string }) {
  return (
    <svg viewBox="0 0 252 220" width="252" height="220" role="img" aria-label={props.title}>
      <rect x="22" y="38" width="208" height="132" rx="16" fill="#f5f5f5" />
      <rect x="42" y="58" width="168" height="92" rx="10" fill="#fff" />
      <circle cx="62" cy="76" r="6" fill={props.accent} />
      <circle cx="82" cy="76" r="6" fill="#d9d9d9" />
      <circle cx="102" cy="76" r="6" fill="#d9d9d9" />
      <path d="M64 106h124M64 126h88" stroke="#d9d9d9" stroke-width="8" stroke-linecap="round" />
      <text
        x="126"
        y="198"
        fill={props.accent}
        font-size="36"
        font-family="Arial, sans-serif"
        font-weight="700"
        text-anchor="middle"
      >
        {props.code}
      </text>
    </svg>
  )
}

export const PresentedImage403: Component = () => (
  <ExceptionImage title="403 forbidden" code="403" accent="#faad14" />
)

export const PresentedImage404: Component = () => (
  <ExceptionImage title="404 not found" code="404" accent="#1677ff" />
)

export const PresentedImage500: Component = () => (
  <ExceptionImage title="500 server error" code="500" accent="#ff4d4f" />
)
