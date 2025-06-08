<template>
  <header>
    <div class="left-section" @click="goHome" style="cursor:pointer;">
      <img src="../assets/images/icon.png" alt="logo" @click="goHome" />
    </div>
    <div class="right-section">
      <a href="#" class="sign_up" @click.prevent="$emit('open-register')">Зарегистрироваться</a>
      <a href="#" class="login" @click.prevent="$emit('open-login')">Войти</a>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['open-register', 'open-login'],
  methods: {
    goHome () {
      this.$router.push('/')
    }
  }
}
</script>
