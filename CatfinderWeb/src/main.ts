import './assets/main.less'
import '@arcgis/core/assets/esri/themes/light/main.css'
import './assets/esri-override.less'
import 'material-icons/iconfont/material-icons.css'
import 'vue-loading-overlay/dist/css/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCat } from '@fortawesome/free-solid-svg-icons'
import { ConfigArcGISIdentityManager  } from './map/IdentityManager'

library.add(faCat)

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

await ConfigArcGISIdentityManager();
app.mount('#app')
