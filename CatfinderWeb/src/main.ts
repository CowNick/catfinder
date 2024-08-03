import './assets/main.css'
import '@arcgis/core/assets/esri/themes/light/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import esriConfig from '@arcgis/core/config'

esriConfig.assetsPath = `assets`

const app = createApp(App)

app.use(router)

app.mount('#app')
