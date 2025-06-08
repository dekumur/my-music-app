<template>
  <div v-if="showAlert" :class="['alert-box', alertType]">
      {{ alertMessage }}
  </div>
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
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/assets/js/firebase'

export default {
  name: 'RegisterForm',
  data () {
    return {
      email: '',
      password: '',
      username: '',
      avatarUrl: '',
      showAlert: false,
      alertMessage: '',
      alertType: ''
    }
  },
  methods: {
    switchToLogin () {
      this.$emit('switch-to-login')
    },
    async submitForm () {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        const user = userCredential.user
        await setDoc(doc(db, 'User', user.uid), {
          username: this.username,
          email: this.email,
          avatar_url: this.avatarUrl || '',
          createdAt: serverTimestamp()
        })

        this.showCustomAlert('Регистрация прошла успешно!', 'success')
        this.email = ''
        this.password = ''
        this.username = ''
        this.avatarUrl = ''

        this.$emit('success')
        this.$emit('login-success')
        this.$router.push('/main')
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          this.showCustomAlert('Этот email уже зарегистрирован.', 'error')
        } else if (error.code === 'auth/invalid-email') {
          this.showCustomAlert('Некорректный email.', 'error')
        } else if (error.code === 'auth/weak-password') {
          this.showCustomAlert('Пароль слишком слабый (минимум 6 символов).', 'error')
        } else {
          this.showCustomAlert(`Ошибка: ${error.message}`, 'error')
        }
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

.register-container {
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

.link-to-login {
  margin-top: 20px;
}

.link-to-login a {
  display: inline-block;
  margin-top: 5px;
}
</style>
