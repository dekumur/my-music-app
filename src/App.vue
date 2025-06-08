<template>
  <div v-if="authReady">
    <AuthenticatedHeader v-if="user" @logout="logout" />
    <AppHeader v-else @open-register="showRegister = true" @open-login="showLogin = true" />

    <AuthModal
      :show-register="showRegister"
      :show-login="showLogin"
      :show-forgot-password="showForgotPassword"
      @close-register="handleRegisterSuccess"
      @close-login="showLogin = false"
      @close-forgot-password="showForgotPassword = false"
      @open-register="showRegister = true"
      @open-login="showLogin = true"
      @open-forgot-password="showForgotPassword = true"
    />

    <router-view />
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/assets/js/firebase'
import AppHeader from './components/Header.vue'
import AuthenticatedHeader from './components/AuthenticatedHeader.vue'
import AuthModal from './components/modals/AuthModal.vue'

export default {
  components: { AppHeader, AuthenticatedHeader, AuthModal },
  data () {
    return {
      showRegister: false,
      showLogin: false,
      showForgotPassword: false,
      user: null,
      authReady: false
    }
  },
  created () {
    onAuthStateChanged(auth, (user) => {
      this.user = user
      this.authReady = true
    })
  },
  methods: {
    logout () {
      signOut(auth).then(() => {
        this.user = null
        this.$router.push('/')
      })
    },
    handleRegisterSuccess () {
      this.showRegister = false
      this.$router.push('/main')
    }
  }
}
</script>
