import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'
import './assets/css/icon.css'
import './assets/css/iconfont.css'
import './assets/css/iconfont';

import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import Prism from 'prismjs';

import VMdPreviewHtml from '@kangc/v-md-editor/lib/preview-html';
import '@kangc/v-md-editor/lib/style/preview-html.css';
VueMarkdownEditor.use(vuepressTheme, {
    Prism,
});

const app = createApp(App)
installElementPlus(app)
app
    .use(store)
    .use(router)
    .use(VMdPreviewHtml)
    .use(VueMarkdownEditor)
    .mount('#app')