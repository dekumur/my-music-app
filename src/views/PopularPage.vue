<template>
  <div>
    <BaseModal :visible="showRegister" @close="showRegister = false">
      <RegisterForm />
    </BaseModal>
    <BaseModal :visible="showLogin" @close="showLogin = false">
      <LoginForm />
    </BaseModal>
      <main>
        <section class="popular_section ">
        <h1>Тренды в жанрах</h1>
        <Splide :options="splideOptions">
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/electronic.png" alt="cover" />
                    <p>Electronic</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/rap.png" alt="cover" />
                    <p>Rap</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/jazz.png" alt="cover" />
                    <p>Jazz</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/pop.png" alt="cover" />
                    <p>Pop</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/rock.png" alt="cover" />
                    <p>Rock</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/metall.png" alt="cover" />
                    <p>Metal</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/lofi.png" alt="cover" />
                    <p>Lo-fi</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/phonk.png" alt="cover" />
                    <p>Phonk</p>
                </div>
            </SplideSlide>
        </Splide>
    </section>
    <section class="popular_section">
        <h1>Новые имена</h1>
        <Splide :options="splideOptions">
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/pirate.png" alt="cover" />
                    <p>Серега Пират</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/charli.png" alt="cover" />
                    <p>Charli XCX</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/pastel.png" alt="cover" />
                    <p>pastel ghost</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/yeat.png" alt="cover" />
                    <p>Yeat</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/dora.png" alt="cover" />
                    <p>Дора</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/odetari.png" alt="cover" />
                    <p>Odetari</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/mirele.png" alt="cover" />
                    <p>Mirele</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/pink.png" alt="cover" />
                    <p>PinkPantheress</p>
                </div>
            </SplideSlide>
        </Splide>
    </section>
        <section class="popular_section">
        <h1>Новые дропы. Тизеры. Эксклюзивы</h1>
        <Splide :options="splideOptions">
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/ladygaga.png" alt="cover" />
                    <p>Lady Gaga | Mayhem</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/theweeknd.png" alt="cover" />
                    <p>The Weeknd | Hurry Up Tomorrow</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/eminem.png" alt="cover" />
                    <p>Eminem | The Eminem Show</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/linkinpark.png" alt="cover" />
                    <p>Linkin Park | From Zero</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/mzlff.png" alt="cover" />
                    <p>mzlff | Светлая сторона</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/vkus.png" alt="cover" />
                    <p>Дурной вкус | Светомузыка</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/katyperry.png" alt="cover" />
                    <p>Katy Perry | One of the Boys</p>
                </div>
            </SplideSlide>
            <SplideSlide>
                <div class="slide-content">
                    <img src="../assets/images/ppink.png" alt="cover" />
                    <p>P1nk | Funhouse</p>
                </div>
            </SplideSlide>
        </Splide>
    </section>
    </main>
  </div>
    <AppFooter />
</template>

<script>
import AppFooter from '@/components/Footer.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import RegisterForm from '@/components/modals/RegisterForm.vue'
import LoginForm from '@/components/modals/LoginForm.vue'

import { Splide, SplideSlide } from '@splidejs/vue-splide'

export default {
  name: 'PopularPage',
  components: {
    AppFooter,
    BaseModal,
    RegisterForm,
    LoginForm,
    Splide,
    SplideSlide
  },
  data () {
    return {
      showRegister: false,
      showLogin: false,
      splideOptions: {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        gap: '1rem',
        autoplay: true,
        pauseOnHover: true,
        interval: 2000,
        arrows: false,
        pagination: false,
        breakpoints: {
          640: {
            perPage: 1
          },
          1024: {
            perPage: 2
          }
        }
      }
    }
  },
  methods: {
    goToPopular () {
      this.$router.push({ name: 'Popular' })
    }
  }
}
</script>

<style scoped>
body {
    margin: 0 auto;
    padding: 0;
    background-color: #0a0a0a;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: "Inter", sans-serif;
    color: #fff;
}

.popular_section {
    margin: 50px auto;
    max-width: 1200px;
    padding: 0 20px;
    text-align: left;
    letter-spacing: 2px;
}

h1 {
    color: #fff;
    font-size: 24px;
    margin-bottom: 40px;
    font-weight: 700;
}

.splide__slide {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

.slide-content {
    background-color: #1e1e1e;
    border-radius: 20px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

img {
    width: 100%;
    height: auto;
    border-radius: 15px;
}

p {
    font-size: 18px;
    color: #fff;
    border-radius: 15px;
    margin-top: 10px;
}

.splide {
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
}

.splide__track {
    display: flex;
    justify-content: space-between;
}

</style>
