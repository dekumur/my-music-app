<template>
  <div>
    <h2>Вход</h2>
    <input placeholder="Email" />
    <input placeholder="Пароль" type="password" />
    <button>Войти</button>
    <p><a href="#" @click.prevent="$emit('switch', 'forgot')">Забыли пароль?</a></p>
    <p>Нет аккаунта? <a href="#" @click.prevent="$emit('switch', 'register')">Зарегистрироваться</a></p>
  </div>
</template>

<script>
export default {
  name: 'LoginForm'
}
</script>
