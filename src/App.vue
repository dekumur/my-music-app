<template>
  <AppHeader @open-register="showRegister = true" @open-login="showLogin = true"/>
<AuthModal
    :show-register="showRegister"
    :show-login="showLogin"
    :show-forgot-password="showForgotPassword"
    @close-register="showRegister = false"
    @close-login="showLogin = false"
    @close-forgot-password="showForgotPassword = false"
    @open-register="showRegister = true"
    @open-login="showLogin = true"
    @open-forgot-password="showForgotPassword = true"
  />
  <div id="HomePage">
    <router-view />
  </div>
</template>

<script>
import AppHeader from './components/Header.vue'
import AuthModal from './components/modals/AuthModal.vue'

export default {
  components: { AppHeader, AuthModal },
  data () {
    return {
      showRegister: false,
      showLogin: false,
      showForgotPassword: false
    }
  }
}
</script>
