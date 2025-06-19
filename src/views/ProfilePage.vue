<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="profile-info">
        <img class="avatar" :src="avatarUrl" alt="Avatar" />
        <div class="username">{{ username }}</div>
      </div>
    </div>
    <div class="profile-form">
      <div class="form-avatar">
        <img class="avatar" :src="avatarUrl" alt="Avatar" />
        <label class="change-avatar">
          Изменить аватар
          <input type="file" @change="onFileChange" hidden />
        </label>
      </div>
      <form @submit.prevent="submitForm">
        <input v-model="form.name" placeholder="Имя" />
        <input v-model="form.email" placeholder="Почта" />
        <input v-model="form.password" type="password" placeholder="Пароль" />
        <input v-model="form.confirmPassword" type="password" placeholder="Подтвердите пароль" />
        <button type="submit" class="submit-btn">Отправить</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      username: 'Sussy baka',
      avatarUrl: '/minion.jpg',
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    onFileChange (e) {
      const file = e.target.files[0]
      if (file) {
        this.avatarUrl = URL.createObjectURL(file)
      }
    },
    submitForm () {
      console.log(this.form)
    }
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #000;
  color: white;
  min-height: 100vh;
}

.profile-header {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.profile-header .background {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.profile-info .avatar {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  border: 3px solid white;
  object-fit: cover;
}

.username {
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 8px;
  display: inline-block;
}

.profile-form {
  background: #1a1a1a;
  padding: 30px;
  margin-top: 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}

.form-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.form-avatar .avatar {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.change-avatar {
  display: inline-block;
  margin-top: 8px;
  cursor: pointer;
  color: #00e0ff;
}

form input {
  width: 100%;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #2a2a2a;
  color: white;
  border: none;
  border-radius: 6px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #00e0ff;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #00bcd4;
}
</style>
