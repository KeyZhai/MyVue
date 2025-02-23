import { createApp } from '../../dist/minivue.esm.js'
import { Provider } from './App.js'
const rootContainer = document.getElementById('app')
const app = createApp(Provider)
app.mount(rootContainer)