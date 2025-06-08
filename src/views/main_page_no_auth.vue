<template>
  <div>
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
        <button @click="goToPopular">Популярное сейчас</button>
      </section>
      <section class="third_section">
        <h1>Откройте для себя то, что сейчас слушают все</h1>
          <div class="photo_artist">
            <div class="artist">
              <img class="one" src="../assets/images/1.png" alt="1">
              <span class="vertical-text">Billie Eilish</span>
            </div>
            <div class="artist">
              <img class="two" src="../assets/images/2.png" alt="2">
              <span class="vertical-text">Playboi Carti</span>
            </div>
            <div class="artist">
              <img class="three" src="../assets/images/3.png" alt="3">
              <span class="vertical-text">Yeat</span>
            </div>
            <div class="artist">
              <img class="four" src="../assets/images/4.png" alt="4">
              <span class="vertical-text">Charli XCX</span>
            </div>
            <div class="artist">
              <img class="five" src="../assets/images/5.png" alt="5">
              <span class="vertical-text">DK</span>
            </div>
          </div>
        </section>
      <section class="join-block">
        <h2><span>Спасибо, что послушали.</span> Теперь присоединяйтесь.</h2>
        <p>Сохраняйте треки, следите за исполнителями и создавайте плейлисты. Всё бесплатно.</p>
        <button @click="openRegister">Зарегистрироваться</button>
        <div class="login-link">
          <span>Уже есть аккаунт?</span>
          <a href="#" @click.prevent="openLogin">Войти</a>
        </div>
      </section>
    </main>
  </div>
  <AppFooter />
</template>

<script>
import AppFooter from '@/components/Footer.vue'

export default {
  name: 'main_page_no_auth',
  components: { AppFooter },
  methods: {
    goToPopular () {
      this.$router.push({ name: 'Popular' })
    },
    openRegister () {
      this.$root.showRegister = true
    },
    openLogin () {
      this.$root.showLogin = true
    }
  }
}
</script>
