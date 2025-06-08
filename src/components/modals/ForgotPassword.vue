<template>
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
      email: ''
    }
  },
  methods: {
    resetPassword () {
      const auth = getAuth()
      sendPasswordResetEmail(auth, this.email)
        .then(() => {
          alert('Письмо с восстановлением отправлено на почту.')
          this.$emit('switch-to-login')
        })
        .catch((error) => {
          alert('Ошибка: ' + error.message)
        })
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
</style>
