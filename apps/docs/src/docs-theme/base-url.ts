const docsBasePath = normalizeBasePath(import.meta.env.BASE_URL)

function normalizeBasePath(baseUrl: string) {
  return baseUrl.replace(/\/$/, '')
}

function shouldPrefixUrl(url: string, basePath: string) {
  return (
    basePath &&
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !url.startsWith(`${basePath}/`) &&
    url !== basePath
  )
}

export function withBaseUrl(url: string | undefined, baseUrl: string): string | undefined {
  const basePath = normalizeBasePath(baseUrl)

  if (!url || !shouldPrefixUrl(url, basePath)) {
    return url
  }

  if (url === '/') {
    return `${basePath}/`
  }

  return `${basePath}${url}`
}

export function withDocsBase(url: string | undefined): string | undefined {
  return withBaseUrl(url, import.meta.env.BASE_URL)
}

export function docsRouterBase(): string | undefined {
  return docsBasePath || undefined
}
