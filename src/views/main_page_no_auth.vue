<template>
  <div>
    <AppHeader @open-register="showRegister = true" @open-login="showLogin = true" />
    <BaseModal :visible="showRegister" @close="showRegister = false">
      <RegisterForm />
    </BaseModal>
    <BaseModal :visible="showLogin" @close="showLogin = false">
      <LoginForm />
    </BaseModal>
      <main>
        <section class="hero">
          <div class="hero-content">
            <h1>Исследуйте новое.<br>Находите вдохновение.</h1>
            <p>
              Это уникальное пространство, где слушатели и создатели объединяются, чтобы делиться музыкой и находить друг друга через звук.
            </p>
          </div>
        </section>
        <section class="second_section">
          <h1>Откройте для себя то, что сейчас слушают все</h1>
          <button>Популярное сейчас</button>
        </section>
      </main>
      <section class="third_section">
        <h1>Откройте для себя то, что сейчас слушают все</h1>
      <div class="photo_artist">
        <img src="../assets/images/1.png" alt="1">
        <img src="../assets/images/2.png" alt="2">
        <img src="../assets/images/3.png" alt="3">
        <img src="../assets/images/4.png" alt="4">
        <img src="../assets/images/5.png" alt="5">
      </div>
      </section>
      <section class="join-block">
        <h2><span>Спасибо, что послушали.</span> Теперь присоединяйтесь.</h2>
        <p>Сохраняйте треки, следите за исполнителями и создавайте плейлисты. Всё бесплатно.</p>
        <button>Зарегистрироваться</button>
        <div class="login-link">
          <span>Уже есть аккаунт?</span>
          <a href="#">Войти</a>
        </div>
      </section>
  </div>
    <AppFooter />
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import RegisterForm from '@/components/modals/RegisterForm.vue'
import LoginForm from '@/components/modals/LoginForm.vue'

export default {
  name: 'main_page_no_auth',
  components: {
    AppHeader,
    AppFooter,
    BaseModal,
    RegisterForm,
    LoginForm
  },
  data () {
    return {
      showRegister: false,
      showLogin: false
    }
  }
}
</script>
