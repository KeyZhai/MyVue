import { createApp } from '../../dist/minivue.esm.js'
import { App } from './App.js'
const rootContainer = document.getElementById('app')
const app = createApp(App)
app.mount(rootContainer)