<template>
  <main>
    <section class="recently_dried">
      <h1>Больше того, что вы любите</h1>
        <Splide v-if="recommendations.length" :options="splideOptions">
          <SplideSlide v-for="track in recommendations" :key="track.id || track.name">
            <div class="slide-content">
              <img :src="track.coverUrl" :alt="formatTrackName(track.name)" />
              <p>{{ formatTrackName(track.name) }}</p>
            </div>
          </SplideSlide>
        </Splide>
      <p v-else>Нет рекомендаций для отображения.</p>
    </section>
  </main>
</template>

<script>
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import { db } from '@/assets/js/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: 'MainPage',
  components: {
    Splide,
    SplideSlide
  },
  data () {
    return {
      recommendations: [],
      loading: true,
      splideOptions: {
        type: 'slide',
        perPage: 4,
        perMove: 1,
        gap: '1rem',
        autoplay: true,
        pauseOnHover: true,
        interval: 2000,
        arrows: false,
        pagination: false,
        breakpoints: {
          480: { perPage: 1 },
          768: { perPage: 2 },
          1024: { perPage: 3 },
          1280: { perPage: 4 }
        }
      }
    }
  },
  methods: {
    formatTrackName (name) {
      if (!name) return ''
      return name.replace(/[_-]/g, ' ')
    }
  },
  async mounted () {
    try {
      const tracksRef = collection(db, 'Track')
      const tracksSnapshot = await getDocs(tracksRef)
      this.recommendations = tracksSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          coverUrl: data.cover_url || '',
          name: data.name || data.title || ''
        }
      })
    } catch (err) {
      console.error('Ошибка при загрузке из Firebase:', err)
    } finally {
      this.loading = false
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

.recently_dried {
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
  object-fit: cover;
}

p {
  font-size: 18px;
  color: #fff;
  border-radius: 15px;
  margin-top: 10px;
  text-transform: capitalize;
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
