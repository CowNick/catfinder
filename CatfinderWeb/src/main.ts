import './assets/main.css'
import '@arcgis/core/assets/esri/themes/light/main.css'
import 'material-icons/iconfont/material-icons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
