<template>
    <div v-if="showAlert" :class="['alert-box', alertType]">
      {{ alertMessage }}
    </div>
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
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/assets/js/firebase'

export default {
  name: 'LoginForm',
  data () {
    return {
      email: '',
      password: '',
      showAlert: false,
      alertMessage: '',
      alertType: ''
    }
  },
  methods: {
    switchToRegister () {
      this.$emit('switch-to-register')
    },
    async submitForm () {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.showCustomAlert('Вы успешно вошли!', 'success')

        this.email = ''
        this.password = ''

        this.$emit('success')
        this.$router.push('/main')
      } catch (error) {
        let msg = 'Ошибка входа.'
        if (error.code === 'auth/user-not-found') {
          msg = 'Пользователь не найден.'
        } else if (error.code === 'auth/wrong-password') {
          msg = 'Неверный пароль.'
        }
        this.showCustomAlert(msg, 'error')
      }
    },
    showCustomAlert (message, type) {
      this.alertMessage = message
      this.alertType = type
      this.showAlert = true
      setTimeout(() => {
        this.showAlert = false
      }, 4000)
    }
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #000;
  border-radius: 16px;
  padding: 30px;
  width: 300px;
  color: white;
  text-align: center;
  z-index: 10000;
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

.alert-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 10px;
  z-index: 9999;
  font-weight: bold;
  font-size: 16px;
  color: white;
  animation: fadeInOut 4s ease forwards;
}

.alert-box.success {
  background-color: #5fcacf;
}

.alert-box.error {
  background-color: #dc3545;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}
</style>
