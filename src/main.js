import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import installElementPlus from './plugins/element'

import uploader from 'vue-simple-uploader'
import 'vue-simple-uploader/dist/style.css'
import Cookies from 'js-cookie'

const app = createApp(App)
installElementPlus(app)
app
    .use(uploader)
    .use(Cookies)
    .use(router)
    .mount('#app')
