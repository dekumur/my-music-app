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
    component: HomePage
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/main-no-auth',
    name: 'MainNoAuth',
    component: HomePage
  },
  {
    path: '/popular',
    name: 'Popular',
    component: PopularPage
  },
  {
    path: '/artist/:id',
    name: 'ArtistPage',
    component: ArtistPage
  },
  {
    path: '/library',
    name: 'LibraryPage',
    component: LibraryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistPage',
    component: PlaylistPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchResults
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Вспомогательная функция, которая ждёт загрузки состояния авторизации
function getCurrentUser () {
  return new Promise((resolve, reject) => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !user) {
    // Если роут требует авторизации, а пользователя нет - отправляем на страницу для неавторизованных
    next({ name: 'MainNoAuth' })
  } else if ((to.name === 'Home' || to.name === 'MainNoAuth') && user) {
    // Если пользователь авторизован и пытается зайти на неавторизованную страницу - редиректим на Main
    next({ name: 'Main' })
  } else {
    next()
  }
})

export default router
