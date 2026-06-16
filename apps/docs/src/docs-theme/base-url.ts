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

function collapseRepeatedBasePath(url: string, basePath: string) {
  if (!basePath) {
    return url
  }

  const repeatedBasePath = `${basePath}${basePath}/`

  if (url.startsWith(repeatedBasePath)) {
    return `${basePath}/${url.slice(repeatedBasePath.length)}`
  }

  return url
}

export function withBaseUrl(url: string | undefined, baseUrl: string): string | undefined {
  const basePath = normalizeBasePath(baseUrl)
  const normalizedUrl = url ? collapseRepeatedBasePath(url, basePath) : url

  if (!normalizedUrl || !shouldPrefixUrl(normalizedUrl, basePath)) {
    return normalizedUrl
  }

  if (normalizedUrl === '/') {
    return `${basePath}/`
  }

  return `${basePath}${normalizedUrl}`
}

export function withDocsBase(url: string | undefined): string | undefined {
  return withBaseUrl(url, import.meta.env.BASE_URL)
}

export function docsRouterBase(): string | undefined {
  return docsBasePath || undefined
}
