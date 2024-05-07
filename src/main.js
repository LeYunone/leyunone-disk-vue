import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

import uploader from 'vue-simple-uploader'
import 'vue-simple-uploader/dist/style.css'
import Cookies from 'js-cookie'

const app = createApp(App)
app
    .use(ElementPlus)
    .use(uploader)
    .use(Cookies)
    .use(router)
    .mount('#app')
