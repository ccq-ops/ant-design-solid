// @refresh reload
import { StartClient } from '@solidjs/start/client'
import { hydrate, render } from 'solid-js/web'

const root = document.getElementById('app')!
const mount = root.hasChildNodes() ? hydrate : render

mount(() => <StartClient />, root)
document.documentElement.dataset.docsHydrated = 'true'
