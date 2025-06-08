import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/main_page_no_auth.vue'
import PopularPage from '@/views/PopularPage.vue'
import MainPage from '@/views/MainPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/popular', name: 'Popular', component: PopularPage },
  { path: '/main', name: 'Main', component: MainPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
