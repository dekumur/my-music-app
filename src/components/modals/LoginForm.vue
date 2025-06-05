<template>
  <div class="login-container">
    <form @submit.prevent="submitForm">
      <h2>Вход</h2>
      <input placeholder="Email" v-model="email" required />
      <input placeholder="Пароль" type="password" v-model="password" required />
      <button type="submit">Войти</button>
      <a href="#" @click.prevent="$emit('forgot-password')" class="forgot-password-link">Забыли пароль?</a>
      <div class="link-to-register">
        <span>Нет аккаунта?</span>
        <a href="#" @click.prevent="switchToRegister">Зарегистрироваться</a>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    switchToRegister () {
      this.$emit('switch-to-register')
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
.login-container {
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

.forgot-password-link {
  display: block;
  margin-top: 10px;
}

.link-to-register {
  margin-top: 20px;
}

.link-to-register a {
  display: inline-block;
  margin-top: 5px;
}
</style>
