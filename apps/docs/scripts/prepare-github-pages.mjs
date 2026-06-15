import { copyFile, readFile, writeFile } from 'node:fs/promises'

const outputDir = new URL('../.output/public/', import.meta.url)
const manifestUrl = new URL('.vite/manifest.json', outputDir)
const basePath = '/ant-design-solid/'

const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
const entry = manifest['src/entry-client.tsx']

if (!entry?.file) {
  throw new Error('Could not find src/entry-client.tsx in Vite manifest')
}

const assetPath = (file) => `${basePath}${file}`
const styles = (entry.css ?? [])
  .map((file) => `    <link rel="stylesheet" href="${assetPath(file)}" />`)
  .join('\n')

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ant Design Solid</title>
${styles}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${assetPath(entry.file)}"></script>
  </body>
</html>
`

await writeFile(new URL('index.html', outputDir), html)
await copyFile(new URL('index.html', outputDir), new URL('404.html', outputDir))
await writeFile(new URL('.nojekyll', outputDir), '')
