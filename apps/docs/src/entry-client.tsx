// @refresh reload
import { StartClient } from '@solidjs/start/client'
import { render } from 'solid-js/web'
import './main.css'

const root = document.getElementById('app')!

root.replaceChildren()
render(() => <StartClient />, root)
document.documentElement.dataset.docsHydrated = 'true'
