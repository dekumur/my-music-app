import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main_page_no_auth.css'
import './assets/css/header_no_auth.css'
import './assets/css/footer.css'
import '@splidejs/vue-splide/css'
import store from './store'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

createApp(App).use(router).use(store).mount('#app')
