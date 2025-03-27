import '@/assets/style/theme.css';
import '@/assets/fonts/iconfont.css';
import '@/assets/fonts/iconfont.js';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia'
import Prism from 'prismjs';
import VueMarkdownEditor from '@kangc/v-md-editor';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import createTodoListPlugin from '@kangc/v-md-editor/lib/plugins/todo-list/index';
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/plugins/todo-list/todo-list.css';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/theme-chalk/dark/css-vars.css';

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
});
VueMarkdownEditor.use(createTodoListPlugin());


const pinia = createPinia();

createApp(App)
  .use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn })
  .use(router)
  .use(pinia)
  .use(VueMarkdownEditor)
  .mount('#app');
