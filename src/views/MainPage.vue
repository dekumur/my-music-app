<template>
  <main>
    <section class="recently_dried">
      <h1>Больше того, что вы любите</h1>

      <Splide v-if="recommendations.length" :options="splideOptions">
        <SplideSlide
          v-for="track in recommendations"
          :key="track.id || track.name"
          @click="playTrack(track)"
        >
          <div class="slide-content hoverable">
            <img :src="track.coverUrl" :alt="formatTrackName(track.name)" />
            <p>{{ formatTrackName(track.name) }}</p>
          </div>
        </SplideSlide>
      </Splide>

      <p v-else>Нет рекомендаций для отображения.</p>
    </section>
    <div v-if="currentTrack" class="spotify-player">
        <div class="player-left">
          <button @click="prevTrack">⏮️</button>
          <button @click="togglePlayPause">
            <span v-if="isPlaying">⏸️</span>
            <span v-else>▶️</span>
          </button>
          <button @click="nextTrack">⏭️</button>
          <button>🔀</button>
          <button>💬</button>
        </div>

        <div class="player-center">
          <span>{{ currentTimeDisplay }}</span>
          <div class="progress-bar" @click="seek($event)">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>
          <span>{{ durationDisplay }}</span>
        </div>

        <div class="player-right">
          <img :src="currentTrack.coverUrl" alt="cover" class="cover" />
          <div class="info">
            <p class="artist">{{ currentTrack.artist || 'Неизвестный' }}</p>
            <p class="title">{{ formatTrackName(currentTrack.name) }}</p>
          </div>
          <button>❤️</button>
          <button>👤</button>
          <button>📃</button>
        </div>

        <audio
          ref="audio"
          :src="currentTrack.audioUrl"
          autoplay
          @timeupdate="updateProgress"
          @loadedmetadata="updateProgress"
          @ended="onEnded"
        ></audio>
      </div>
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
      currentTrack: null,
      volume: 1,
      audio: null,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      duration: 0,
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
  computed: {
    currentTimeDisplay () {
      return this.formatTime(this.currentTime)
    },
    durationDisplay () {
      return this.formatTime(this.duration)
    }
  },
  methods: {
    updateVolume () {
      if (this.audio) {
        this.audio.volume = this.volume
      }
    },
    formatTrackName (name) {
      return name ? name.replace(/[_-]/g, ' ') : ''
    },
    formatTime (seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },
    async playTrack (track) {
      if (this.audio) {
        this.audio.pause()
      }

      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.currentTrack = null
        this.audio = null
        return
      }

      this.currentTrack = track
      this.$nextTick(() => {
        this.audio = this.$refs.audio
        this.audio.play()
        this.isPlaying = true
      })
    },
    togglePlayPause () {
      if (!this.audio) return
      if (this.isPlaying) {
        this.audio.pause()
      } else {
        this.audio.play()
      }
      this.isPlaying = !this.isPlaying
    },
    updateProgress () {
      if (!this.audio) return
      this.currentTime = this.audio.currentTime
      this.duration = this.audio.duration
      this.progress = (this.audio.currentTime / this.audio.duration) * 100
    },
    seek (event) {
      if (!this.audio || !this.audio.duration) return
      const rect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const width = rect.width
      const ratio = clickX / width
      this.audio.currentTime = ratio * this.audio.duration
    },
    onEnded () {
      this.isPlaying = false
      this.progress = 0
    }
  },
  async mounted () {
    try {
      const tracksRef = collection(db, 'Track')
      const snapshot = await getDocs(tracksRef)
      this.recommendations = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.title || data.name || '',
          coverUrl: data.cover_url || '',
          audioUrl: data.audio_file_url || ''
        }
      })
    } catch (error) {
      console.error('Ошибка при загрузке треков:', error)
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
.spotify-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1a1a;
  padding: 6px 16px;
  color: white;
  font-family: sans-serif;
  border-top: 1px solid #333;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.4);
  height: 60px;
  z-index: 1000;
}

.player-left button,
.player-right button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.player-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 500px;
  padding: 0 10px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #444;
  border-radius: 2px;
  cursor: pointer;
}

.progress {
  height: 100%;
  background: #18FFFF;
  border-radius: 2px;
  transition: width 0.2s;
}

.player-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
  flex-shrink: 0;
  overflow: hidden;
}

.cover {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
}

.info {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  max-width: 100px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.artist {
  font-weight: 600;
}

.title {
  color: #ccc;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
