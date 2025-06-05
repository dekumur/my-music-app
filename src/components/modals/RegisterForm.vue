<template>
  <div class="register-container">
    <form @submit.prevent="submitForm">
      <h2>Регистрация</h2>
      <input v-model="email" placeholder="Email" required />
      <input v-model="password" placeholder="Пароль" type="password" required />
      <button type="submit">Зарегистрироваться</button>
      <div class="link-to-login">
        <span>Уже есть аккаунт?</span>
        <a href="#" @click.prevent="switchToLogin">Войти</a>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    switchToLogin () {
      this.$emit('switch-to-login')
    },
    submitForm () {
      console.log('Форма отправлена')
      console.log('Email:', this.email)
      console.log('Password:', this.password)
    }
  }
}
</script>

<style scoped>
.register-container {
  background-color: #000;
  border-radius: 16px;
  padding: 30px;
  width: 300px;
  margin: 0 auto;
  color: white;
  text-align: center;
}

h2 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 24px;
}

input {
  width: 100%;
  padding: 10px 0;
  margin: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid #aaa;
  color: white;
  outline: none;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

a {
  color: #00ffff;
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

.link-to-login {
  margin-top: 20px;
}

.link-to-login a {
  display: inline-block;
  margin-top: 5px;
}
</style>
