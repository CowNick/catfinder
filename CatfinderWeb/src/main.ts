import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import esriConfig from '@arcgis/core/config'

esriConfig.assetsPath = `assets`

const app = createApp(App)

app.use(router)

app.mount('#app')
