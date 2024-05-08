import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import uploader from 'vue-simple-uploader'
import 'vue-simple-uploader/dist/style.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app
    .use(ElementPlus)
    .use(uploader)
    .use(router)
    .mount('#app')
