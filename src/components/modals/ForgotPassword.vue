<template>
  <div v-if="showAlert" :class="['alert-box', alertType]">
    {{ alertMessage }}
  </div>
  <div class="forgot_password-container">
    <form @submit.prevent="resetPassword">
      <h2>Восстановление пароля</h2>
      <input
        type="email"
        v-model="email"
        placeholder="Введите ваш email"
        required
      />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

export default {
  name: 'ForgotPassword',
  data () {
    return {
      email: '',
      showAlert: false,
      alertMessage: '',
      alertType: ''
    }
  },
  methods: {
    resetPassword () {
      const auth = getAuth()
      sendPasswordResetEmail(auth, this.email)
        .then(() => {
          this.showCustomAlert('Письмо с восстановлением отправлено на почту.', 'success')
          this.$emit('switch-to-login')
        })
        .catch((error) => {
          this.showCustomAlert('Ошибка: ' + error.message, 'error')
        })
    },
    showCustomAlert (message, type) {
      this.alertMessage = message
      this.alertType = type
      this.showAlert = true
      setTimeout(() => {
        this.showAlert = false
      }, 4000)
    }
  },
  emits: ['switch-to-login']
}
</script>

<style scoped>
.forgot_password-container {
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

p {
  margin-top: 20px;
  font-size: 14px;
  color: #ccc;
}

a {
  color: #00ffff;
  text-decoration: none;
}

a:hover {
  text-decoration: none;
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
