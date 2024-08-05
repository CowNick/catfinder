import './assets/main.less'
import '@arcgis/core/assets/esri/themes/light/main.css'
import './assets/esri-override.less'
import 'material-icons/iconfont/material-icons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCat } from '@fortawesome/free-solid-svg-icons'

library.add(faCat)

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
