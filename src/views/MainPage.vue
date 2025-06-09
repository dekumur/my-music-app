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
        <button class="icon-btn" @click="prevTrack">
          <img src="@/assets/images/skip-back.svg" alt="Назад" />
        </button>

        <button class="play-btn" @click="togglePlayPause">
          <img
            :src="isPlaying ? require('@/assets/images/pause.svg') : require('@/assets/images/play.svg')"
            :alt="isPlaying ? 'Пауза' : 'Играть'"
          />
        </button>

        <button class="icon-btn" @click="nextTrack">
          <img src="@/assets/images/skip-forward.svg" alt="Вперёд" />
        </button>

        <button
          class="icon-btn"
          :class="{ active: isShuffle }"
          @click="toggleShuffle"
        >
          <img src="@/assets/images/shuffle.svg" alt="Перемешать" />
        </button>

        <button
          class="icon-btn"
          :class="{ active: isRepeat }"
          @click="toggleRepeat"
        >
          <img src="@/assets/images/repeat.svg" alt="Повтор" />
        </button>
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
        <button title="Лайк">❤️</button>
        <button title="Профиль">👤</button>
        <button title="Плейлист">📃</button>
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
  components: { Splide, SplideSlide },
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
      isShuffle: false,
      isRepeat: false,
      splideOptions: {
        type: 'slide',
        perPage: 5,
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
    formatTime (seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },
    formatTrackName (name) {
      return name ? name.replace(/[_-]/g, ' ') : ''
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
        this.updateVolume()
      })
    },
    togglePlayPause () {
      if (!this.audio) return
      this.isPlaying ? this.audio.pause() : this.audio.play()
      this.isPlaying = !this.isPlaying
    },
    updateProgress () {
      if (!this.audio) return
      this.currentTime = this.audio.currentTime
      this.duration = this.audio.duration
      this.progress = (this.currentTime / this.duration) * 100
    },
    seek (event) {
      if (!this.audio || !this.audio.duration) return
      const rect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const ratio = clickX / rect.width
      this.audio.currentTime = ratio * this.audio.duration
    },
    onEnded () {
      if (this.isRepeat) {
        this.audio.currentTime = 0
        this.audio.play()
        return
      }

      if (this.isShuffle) {
        this.playRandomTrack()
        return
      }

      this.nextTrack()
    },
    nextTrack () {
      if (!this.currentTrack || !this.recommendations.length) return

      const currentIndex = this.recommendations.findIndex(t => t.id === this.currentTrack.id)
      const nextIndex = (currentIndex + 1) % this.recommendations.length
      this.playTrack(this.recommendations[nextIndex])
    },
    prevTrack () {
      if (!this.currentTrack || !this.recommendations.length) return

      const currentIndex = this.recommendations.findIndex(t => t.id === this.currentTrack.id)
      const prevIndex = (currentIndex - 1 + this.recommendations.length) % this.recommendations.length
      this.playTrack(this.recommendations[prevIndex])
    },
    playRandomTrack () {
      const otherTracks = this.recommendations.filter(t => t.id !== this.currentTrack?.id)
      if (otherTracks.length === 0) return
      const randomIndex = Math.floor(Math.random() * otherTracks.length)
      this.playTrack(otherTracks[randomIndex])
    },
    toggleShuffle () {
      this.isShuffle = !this.isShuffle
    },
    toggleRepeat () {
      this.isRepeat = !this.isRepeat
    },
    updateVolume () {
      if (this.audio) {
        this.audio.volume = this.volume
      }
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
          audioUrl: data.audio_file_url || '',
          artist: data.artist || 'Неизвестный'
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
  padding: 5px;
}

.slide-content {
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 8px;
  max-width: 180px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

.icon-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.icon-btn:hover {
  opacity: 0.7;
}

.play-btn {
 width: 80px;
  height: 80px;
  background-color: transparent;
  border-radius: 0;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.play-btn img,
.icon-btn img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  filter: none;
}

.icon-btn.active img {
fill: #18FFFF;
}
</style>
