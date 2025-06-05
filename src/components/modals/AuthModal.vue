<template>
  <BaseModal :visible="showRegister" @close="closeRegister">
    <RegisterForm @switch-to-login="switchToLogin" />
  </BaseModal>
  <BaseModal :visible="showLogin" @close="closeLogin">
    <LoginForm @switch-to-register="switchToRegister" @forgot-password="switchToForgotPassword" />
  </BaseModal>
  <BaseModal :visible="showForgotPassword" @close="closeForgotPassword">
    <ForgotPasswordForm @switch-to-login="switchToLogin" />
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/modals/BaseModal.vue'
import RegisterForm from '@/components/modals/RegisterForm.vue'
import LoginForm from '@/components/modals/LoginForm.vue'
import ForgotPasswordForm from '@/components/modals/ForgotPassword.vue'

export default {
  props: {
    showRegister: {
      type: Boolean,
      required: true
    },
    showLogin: {
      type: Boolean,
      required: true
    },
    showForgotPassword: {
      type: Boolean,
      required: true
    }
  },
  components: {
    BaseModal,
    RegisterForm,
    LoginForm,
    ForgotPasswordForm
  },
  methods: {
    closeRegister () {
      this.$emit('close-register')
    },
    closeLogin () {
      this.$emit('close-login')
    },
    closeForgotPassword () {
      this.$emit('close-forgot-password')
    },
    switchToLogin () {
      this.$emit('close-register')
      this.$emit('open-login')
    },
    switchToRegister () {
      this.$emit('close-login')
      this.$emit('open-register')
    },
    switchToForgotPassword () {
      this.$emit('close-login')
      this.$emit('open-forgot-password')
    },
    toggleBodyScroll (isVisible) {
      if (isVisible) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>
