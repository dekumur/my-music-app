import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main_page_no_auth.css'
import './assets/css/header_no_auth.css'
import './assets/css/footer.css'

createApp(App).use(router).mount('#app')
