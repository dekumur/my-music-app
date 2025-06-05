<template>
  <div class="forgot_password-container">
    <form>
      <h2>Восстановление пароля</h2>
      <input type="email" placeholder="Введите ваш email" required/>
      <input placeholder="Пароль" type="password" required/>
      <input placeholder="Подтверждение пароля" type="password" required/>
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
  emits: ['switch-to-login']
}
</script>

<style scoped>
.forgot_password-container {
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
