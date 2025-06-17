import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/main_page_no_auth.vue'
import PopularPage from '@/views/PopularPage.vue'
import MainPage from '@/views/MainPage.vue'
import ArtistPage from '@/views/ArtistPage.vue'
import LibraryPage from '@/views/Library.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/popular', name: 'Popular', component: PopularPage },
  { path: '/main', name: 'Main', component: MainPage },
  { path: '/artist/:id', name: 'ArtistPage', component: ArtistPage },
  { path: '/library', name: 'LibraryPage', component: LibraryPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
