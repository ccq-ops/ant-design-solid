import type { JSX } from 'solid-js'

const playgroundPath = '/playground'

function readText(value: unknown): string {
  if (value === undefined || value === null || typeof value === 'boolean') {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(readText).join('')
  }

  if (typeof value === 'function') {
    return readText(value())
  }

  if (typeof value === 'object' && 'textContent' in value) {
    return String((value as { textContent?: string }).textContent ?? '')
  }

  return ''
}

export function sourceCodeFromChildren(children: JSX.Element): string {
  return readText(children).trim()
}

export function sourceCodeFromElement(element: HTMLElement | undefined): string {
  const copyButton = element?.querySelector<HTMLButtonElement>('.expressive-code .copy button')
  const copyCode = copyButton?.dataset.code

  if (copyCode) {
    return copyCode.replace(/\u007f/g, '\n').trim()
  }

  return (element?.querySelector('pre code')?.textContent ?? '').trim()
}

export function playgroundHref(code: string) {
  const params = new URLSearchParams()

  params.set('code', code)

  return `${playgroundPath}?${params.toString()}`
}

export function sourceCodeFromLocationSearch(search: string) {
  return new URLSearchParams(search).get('code') ?? ''
}
