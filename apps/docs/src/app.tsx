import { StyleProvider } from '@solid-ant-design/cssinjs'
import { SolidBaseRoot } from '@kobalte/solidbase/client'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { onCleanup, onMount } from 'solid-js'
import { DocsThemeProvider } from './components/theme-context'
import { docsRouterBase, withDocsBase } from './docs-theme/base-url'

function normalizeAnchorHref(element: HTMLAnchorElement) {
  const href = element.getAttribute('href')
  const nextHref = withDocsBase(href ?? undefined)

  if (nextHref && nextHref !== href) {
    element.setAttribute('href', nextHref)
  }
}

function normalizeDocumentLinks() {
  for (const element of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    normalizeAnchorHref(element)
  }

  for (const element of document.querySelectorAll<HTMLImageElement>('img[src]')) {
    const src = element.getAttribute('src')
    const nextSrc = withDocsBase(src ?? undefined)

    if (nextSrc && nextSrc !== src) {
      element.setAttribute('src', nextSrc)
    }
  }
}

function observeDocumentLinks() {
  const observer = new MutationObserver(() => {
    normalizeDocumentLinks()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return observer
}

export default function App() {
  onMount(() => {
    const normalizeEventAnchor = (event: Event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null

      if (anchor instanceof HTMLAnchorElement) {
        normalizeAnchorHref(anchor)
      }
    }

    document.addEventListener('click', normalizeEventAnchor, true)
    document.addEventListener('focusin', normalizeEventAnchor, true)
    document.addEventListener('mouseover', normalizeEventAnchor, true)
    normalizeDocumentLinks()
    const linksObserver = observeDocumentLinks()

    onCleanup(() => {
      document.removeEventListener('click', normalizeEventAnchor, true)
      document.removeEventListener('focusin', normalizeEventAnchor, true)
      document.removeEventListener('mouseover', normalizeEventAnchor, true)
      linksObserver.disconnect()
    })
  })

  return (
    <StyleProvider>
      <DocsThemeProvider>
        <Router base={docsRouterBase()} root={SolidBaseRoot}>
          <FileRoutes />
        </Router>
      </DocsThemeProvider>
    </StyleProvider>
  )
}
