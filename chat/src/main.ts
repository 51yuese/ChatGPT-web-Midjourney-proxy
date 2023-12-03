import { createApp } from 'vue'
import { useMessage } from 'naive-ui'
import '@/styles/lib/viewer.css'
import VueViewer from 'v-viewer'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import '@/styles/transition.less'

window.$message = useMessage()
const copyright_common_style = 'font-size: 14px; margin-bottom: 2px; padding: 6px 8px; color: #fff;'
const copyright_main_style = `${copyright_common_style} background: #e24329;`
const copyright_sub_style = `${copyright_common_style} background: #707070;`

async function bootstrap() {
  const app = createApp(App)
  app.use(VueViewer)
  setupAssets()
  setupScrollbarStyle()
  setupStore(app)
  setupI18n(app)
  await setupRouter(app)
  app.mount('#app')
}

bootstrap()
