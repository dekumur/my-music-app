<template>
  <div>
    <h2>Восстановление доступа</h2>
    <input placeholder="Введите email" />
    <button>Восстановить</button>
    <p><a href="#" @click.prevent="$emit('switch', 'login')">Назад ко входу</a></p>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword'
}
</script>
