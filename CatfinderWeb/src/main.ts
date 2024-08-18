import './assets/main.less'
import 'element-plus/dist/index.css'
import 'animate.css'
import '@arcgis/core/assets/esri/themes/light/main.css'
import './assets/esri-override.less'
import 'material-icons/iconfont/material-icons.css'
import 'vue-loading-overlay/dist/css/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCat, faRoute } from '@fortawesome/free-solid-svg-icons'
import { ConfigArcGISIdentityManager  } from './map/IdentityManager'

library.add([faCat, faRoute])

const app = createApp(App)
app.use(router)
app.use(ElementPlus);
app.component('font-awesome-icon', FontAwesomeIcon)
await ConfigArcGISIdentityManager();
app.mount('#app')
