import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import HomePage from '../views/main_page_no_auth.vue'
import MainPage from '@/views/MainPage.vue'
import PopularPage from '@/views/PopularPage.vue'
import ArtistPage from '@/views/ArtistPage.vue'
import LibraryPage from '@/views/Library.vue'
import PlaylistPage from '@/views/PlaylistPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import SearchResults from '@/views/SearchResults.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    beforeEnter: (to, from, next) => {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next({ name: 'Main' })
        } else {
          next({ name: 'MainNoAuth' })
        }
      })
    }
  },
  { path: '/main', name: 'Main', component: MainPage },
  { path: '/main-no-auth', name: 'MainNoAuth', component: HomePage },
  { path: '/popular', name: 'Popular', component: PopularPage },
  { path: '/artist/:id', name: 'ArtistPage', component: ArtistPage },
  { path: '/library', name: 'LibraryPage', component: LibraryPage },
  { path: '/playlist/:id', name: 'PlaylistPage', component: PlaylistPage },
  { path: '/profile', name: 'ProfilePage', component: ProfilePage },
  { path: '/search', name: 'search', component: SearchResults }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
