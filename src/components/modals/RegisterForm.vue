<template>
  <div>
    <h2>Регистрация</h2>
    <input placeholder="Email" />
    <input placeholder="Пароль" type="password" />
    <input placeholder="Подтверждение пароля" type="password" />
    <button>Зарегистрироваться</button>
    <p>Уже есть аккаунт? <a href="#" @click.prevent="$emit('switch', 'login')">Войти</a></p>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm'
}
</script>
