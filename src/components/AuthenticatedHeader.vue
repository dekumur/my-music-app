<template>
  <header>
    <div class="left-section" @click="goHome" style="cursor:pointer;">
      <img src="../assets/images/icon.png" alt="logo" @click="goHome" />
    </div>
    <div class="middle-section">
      <div class="search-container">
        <input type="text"
        v-model="searchQuery"
        placeholder="Поиск"
        class="search-input"
        autocomplete="off"
        @input="handleSearch" />
      </div>
    </div>
    <div class="right-section">
      <router-link to="/main" class="active">Главная</router-link>
      <router-link to="/library">Библиотека</router-link>
      <router-link to="/profile"><img src="../assets/images/path.png" alt="logo"></router-link>
      <button @click="logout" class="logout-button">Выход</button>
    </div>
  </header>
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth } from '@/assets/js/firebase'

export default {
  name: 'AuthenticatedHeader',
  data () {
    return {
      searchQuery: ''
    }
  },
  methods: {
    async logout () {
      try {
        await signOut(auth)
        this.$router.push('/')
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      }
    },
    goHome () {
      this.$router.push('/main')
    },
    handleSearch () {
      this.$emit('search', this.searchQuery)
      this.$router.push({ name: 'search', query: { q: this.searchQuery } })
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 360px;
  background: #303030;
  margin-left: 0;
  border-radius: 10px;
}

.search-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 3px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.middle-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 360px;
  flex-shrink: 0;
  flex-grow: 0;
}

.search-input {
  width: 100%;
  padding: 13px 20px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: white;
  border: none;
}

.search-input::placeholder {
  background: #878A91;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 1;
}

.right-section img {
  width: 40px;
  height: 40px;
}

a {
  text-decoration: none;
  font-size: 16px;
  flex-shrink: 0;
  color: #fff;
}

.right-section a {
  position: relative;
  text-decoration: none;
  font-size: 16px;
  color: #fff;
  padding-bottom: 5px;
  overflow: hidden;
}

.right-section a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #00FFFF;
}

.right-section a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background-color: #00FFFF;
  transform: translateX(0);
  transition: transform 0.4s ease;
}

.right-section a:hover::after {
  transform: translateX(200%);
}

/* Стили для кнопки "Выход" */
.logout-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 15px;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #e60000;
}

</style>
