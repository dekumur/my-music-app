<template>
  <main>
      <section v-if="recentTracks.length" class="recently_dried">
        <h1>Недавно прослушанные</h1>
        <Splide :options="splideOptions">
          <SplideSlide
            v-for="track in recentTracks"
            :key="track.id"
            @click="playTrack(track)"
          >
            <div class="slide-content hoverable">
              <img :src="track.coverUrl" :alt="formatTrackName(track.name)" />
              <p>{{ formatTrackName(track.name) }}</p>
            </div>
          </SplideSlide>
        </Splide>
      </section>
    <section class="recently_dried">
      <h1>Больше того, что вы любите</h1>
      <Splide v-if="recommendations.length" :options="splideOptions">
        <SplideSlide
          v-for="track in recommendations"
          :key="track.id || track.name"
          @click="playTrack(track)">
          <div class="slide-content hoverable">
            <img :src="track.coverUrl" :alt="formatTrackName(track.name)" />
            <p>{{ formatTrackName(track.name) }}</p>
          </div>
        </SplideSlide>
      </Splide>
      <p v-else>Нет рекомендаций для отображения.</p>
    </section>
    <section class="recently_dried">
      <h1>Любимые исполнители</h1>
      <Splide v-if="favoriteArtists.length" :options="splideOptions">
        <SplideSlide
          v-for="artist in favoriteArtists"
          :key="artist.id"
        >
          <router-link :to="`/artist/${artist.id}`" class="slide-content hoverable">
            <img :src="artist.imageUrl || '/default-artist.png'" :alt="artist.name || 'Исполнитель'" />
            <p>{{ artist.name || 'Без имени' }}</p>
          </router-link>
        </SplideSlide>
      </Splide>
      <p v-else>Нет любимых исполнителей.</p>
    </section>

    <div v-if="currentTrack" class="spotify-player">
      <div class="player-left">
        <button class="icon-btn" @click="prevTrack">
          <img src="@/assets/images/skip-back.svg" alt="Назад" />
        </button>

        <button class="play-btn" @click="togglePlayPause">
          <img
            :src="isPlaying ? require('@/assets/images/pause.svg')
            : require('@/assets/images/play.svg')"
            :alt="isPlaying ? 'Пауза' : 'Играть'"
          />
        </button>

        <button class="icon-btn" @click="nextTrack">
          <img src="@/assets/images/skip-forward.svg" alt="Вперёд" />
        </button>

        <button class="icon-btn" :class="{ active: isShuffle }" @click="toggleShuffle">
          <i class="fas fa-random"></i>
        </button>
        <button class="icon-btn" :class="{ active: isRepeat }" @click="toggleRepeat">
          <i class="fas fa-redo-alt"></i>
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
      <div class="volume-control">
        <button @click="toggleVolumeSlider" class="volume-icon">
          <img src="@/assets/images/volume.svg" alt="Громкость" />
        </button>
        <div v-if="showVolumeSlider" class="volume-slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="volume"
            @input="updateVolume"
            class="volume-slider-vertical"
          />
        </div>
      </div>

      <img :src="currentTrack.coverUrl" alt="cover" class="cover" />
      <div class="info">
        <p class="artist">{{ currentTrack.artist || 'Неизвестный' }}</p>
        <p class="title">{{ formatTrackName(currentTrack.name) }}</p>
      </div>

      <button class="icon-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
        <i class="fas fa-heart"></i>
      </button>
      <div class="playlist-dropdown">
        <button class="icon-btn" @click="showMenu = !showMenu">
          <i class="fas fa-plus"></i>
        </button>

        <div v-if="showMenu" class="dropdown-menu">
          <ul>
            <li
              v-for="playlist in playlists"
              :key="playlist.id"
              @click="addToPlaylist(playlist.id)"
            >
              {{ playlist.name }}
            </li>
            <li class="create-new" @click="createNewPlaylist">+ Новый плейлист</li>
          </ul>
        </div>
      </div>
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
  <AppFooter />
</template>

<script>
import AppFooter from '@/components/Footer.vue'
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import { db } from '@/assets/js/firebase'
import { getAuth } from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'

export default {
  name: 'MainPage',
  components: { Splide, SplideSlide, AppFooter },
  data () {
    return {
      recommendations: [],
      recentTracks: [],
      favoriteArtists: [],
      favoriteTrackIds: [],
      playlists: [],
      showMenu: false,
      isInPlaylist: false,
      isRepeat: false,
      isShuffle: false,
      currentTrack: null,
      volume: 1,
      audio: null,
      showVolumeSlider: false,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      duration: 0,
      loading: true,
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
    },
    isFavorite () {
      return this.currentTrack && this.favoriteTrackIds.includes(this.currentTrack.id)
    }
  },
  methods: {
    getUserId () {
      const auth = getAuth()
      return auth.currentUser ? auth.currentUser.uid : null
    },
    formatTime (seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },
    formatTrackName (name) {
      return name ? name.replace(/[_-]/g, ' ') : ''
    },
    toggleVolumeSlider () {
      this.showVolumeSlider = !this.showVolumeSlider
    },
    togglePlaylist () {
      this.isInPlaylist = !this.isInPlaylist
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
      this.isShuffle ? this.playRandomTrack() : this.nextTrack()
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
      if (!otherTracks.length) return
      const randomIndex = Math.floor(Math.random() * otherTracks.length)
      this.playTrack(otherTracks[randomIndex])
    },
    async playTrack (track) {
      if (this.audio) this.audio.pause()
      if (this.currentTrack?.id === track.id) {
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
      await this.addToRecentlyPlayed(track.id)
    },
    async toggleFavorite () {
      const userId = this.getUserId()
      const trackId = this.currentTrack?.id
      if (!userId || !trackId) return

      const favRef = collection(db, 'Favorite_Tracks')
      const q = query(favRef, where('user_id', '==', userId), where('track_id', '==', trackId))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id
        await deleteDoc(doc(db, 'Favorite_Tracks', docId))
        this.favoriteTrackIds = this.favoriteTrackIds.filter(id => id !== trackId)
      } else {
        await addDoc(favRef, {
          user_id: userId,
          track_id: trackId,
          added_at: serverTimestamp()
        })
        this.favoriteTrackIds.push(trackId)
      }
    },
    async addToRecentlyPlayed (trackId) {
      const userId = this.getUserId()
      if (!userId) return
      const historyRef = collection(db, 'Listening_History')
      const q = query(historyRef, where('user_id', '==', userId), where('track_id', '==', trackId))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id
        await setDoc(doc(db, 'Listening_History', docId), {
          user_id: userId,
          track_id: trackId,
          played_at: serverTimestamp()
        }, { merge: true })
        return
      }

      const userSnapshot = await getDocs(query(historyRef, where('user_id', '==', userId)))
      if (userSnapshot.size >= 7) {
        const sorted = userSnapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (a.played_at?.seconds || 0) - (b.played_at?.seconds || 0))
        const oldest = sorted[0]
        await setDoc(doc(db, 'Listening_History', oldest.id), {
          user_id: userId,
          track_id: trackId,
          played_at: serverTimestamp()
        }, { merge: true })
        return
      }

      await addDoc(historyRef, {
        user_id: userId,
        track_id: trackId,
        played_at: serverTimestamp()
      })
    },
    async fetchRecentlyPlayed () {
      const userId = this.getUserId()
      if (!userId) return

      const historyRef = collection(db, 'Listening_History')
      const snapshot = await getDocs(query(historyRef, where('user_id', '==', userId)))
      const artistCache = {}

      const recentPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const trackDoc = await getDoc(doc(db, 'Track', data.track_id))
        if (!trackDoc.exists()) return null

        const track = trackDoc.data()
        let artistName = 'Неизвестный'
        const artistRef = track.artist_id
        if (artistRef) {
          const artistKey = artistRef.path
          if (artistCache[artistKey]) {
            artistName = artistCache[artistKey]
          } else {
            const artistDoc = await getDoc(artistRef)
            if (artistDoc.exists()) {
              artistName = artistDoc.data().name || 'Неизвестный'
              artistCache[artistKey] = artistName
            }
          }
        }

        return {
          id: data.track_id,
          name: track.title || track.name || '',
          coverUrl: track.cover_url || '',
          audioUrl: track.audio_file_url || '',
          artist: artistName,
          played_at: data.played_at
        }
      })

      const recent = (await Promise.all(recentPromises)).filter(Boolean)
      this.recentTracks = recent.sort((a, b) => b.played_at.seconds - a.played_at.seconds)
    },
    async fetchFavoriteArtists () {
      const userId = this.getUserId()
      if (!userId) return

      const snapshot = await getDocs(query(collection(db, 'Favorite_Artists'), where('user_id', '==', userId)))
      const artistPromises = snapshot.docs.map(async (docSnap) => {
        const artistRef = docSnap.data().artist_id
        if (!artistRef) return null
        const artistDoc = await getDoc(artistRef)
        if (!artistDoc.exists()) return null
        const artist = artistDoc.data()
        return {
          id: artistDoc.id,
          name: artist.name || 'Неизвестный',
          imageUrl: artist.photo_url || ''
        }
      })

      this.favoriteArtists = (await Promise.all(artistPromises)).filter(Boolean)
    },
    async fetchFavoriteTracks () {
      const userId = this.getUserId()
      if (!userId) return
      const snapshot = await getDocs(query(collection(db, 'Favorite_Tracks'), where('user_id', '==', userId)))
      this.favoriteTrackIds = snapshot.docs.map(docSnap => docSnap.data().track_id)
    },
    async fetchPlaylists () {
      const userId = this.getUserId()
      if (!userId) return
      const snapshot = await getDocs(collection(db, 'Playlists'))
      this.playlists = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.user_id === userId)
    },
    async addToPlaylist (playlistId) {
      try {
        const userId = this.getUserId()
        if (!userId || !this.currentTrack) return
        const trackRef = doc(db, 'Playlists', playlistId, 'Tracks', this.currentTrack.id)
        await setDoc(trackRef, {
          ...this.currentTrack,
          addedAt: Date.now(),
          user_id: userId
        })
        this.showMenu = false
      } catch (error) {
        console.error('Ошибка при добавлении трека в плейлист:', error)
      }
    },
    async createNewPlaylist () {
      const name = prompt('Введите имя нового плейлиста:')
      if (!name) return
      const userId = this.getUserId()
      const newDoc = await addDoc(collection(db, 'Playlists'), {
        name,
        user_id: userId,
        createdAt: Date.now()
      })
      await this.addToPlaylist(newDoc.id)
      await this.fetchPlaylists()
    }
  },
  async mounted () {
    try {
      const snapshot = await getDocs(collection(db, 'Track'))
      const tracksWithArtists = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        let artistName = 'Неизвестный'
        if (data.artist_id) {
          const artistDoc = await getDoc(data.artist_id)
          if (artistDoc.exists()) {
            artistName = artistDoc.data().name || 'Неизвестный'
          }
        }
        return {
          id: docSnap.id,
          name: data.title || data.name || '',
          coverUrl: data.cover_url || '',
          audioUrl: data.audio_file_url || '',
          artist: artistName
        }
      }))
      this.recommendations = tracksWithArtists
      await this.fetchFavoriteTracks()
      await this.fetchRecentlyPlayed()
      await this.fetchFavoriteArtists()
      await this.fetchPlaylists()
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error)
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
  padding-bottom: 80px;
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #121212;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  height: 50px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.4);
}

.player-left,
.player-center,
.player-right {
  display: flex;
  align-items: center;
}

.player-left .icon-btn,
.play-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 6px;
  padding: 6px;
  filter: brightness(0) invert(1);
}

.player-right .icon-btn,
.play-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 6px;
  padding: 6px;
  filter: brightness(0) invert(1);
}

.player-left .active {
  opacity: 1;
}

.player-center {
  flex: 1;
  justify-content: center;
  gap: 12px;
}

.player-center span {
  font-size: 12px;
  width: 36px;
  text-align: center;
}

.progress-bar {
  position: relative;
  background: #535353;
  height: 4px;
  width: 100%;
  max-width: 400px;
  border-radius: 2px;
  cursor: pointer;
}

.progress {
  background: #00FFFF;
  height: 100%;
  width: 0%;
  border-radius: 2px;
}

.player-right {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 260px;
  height: 50px;
}

.player-right .cover {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.player-right .info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 180px;
  height: 1px;
  overflow: visible;
}

.player-right .artist,
.player-right .title {
  font-size: 14px;
  color: #fff;
  text-overflow: ellipsis;
  white-space: normal;
  overflow: visible;
  word-wrap: break-word;
  margin: 0;
}

.player-right .title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-top: 5px;
}

.player-right .artist {
  font-size: 14px;
  color: #b3b3b3;
  margin-top: 40px;
}

.player-right button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-icon img {
  background: none;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.volume-slider-container {
  position: absolute;
  bottom: 35px;
  transform: translate(-3px, -20px);
  background: #1e1e1e;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.volume-slider-vertical {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  -moz-appearance: slider-vertical;
  appearance: slider-vertical;
  width: 6px;
  height: 80px;
  background: #d9d9d9;
  border-radius: 3px;
  cursor: pointer;
}

.volume-slider-vertical:hover {
  background: #b3b3b3;
}

.volume-slider-vertical::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.volume-slider-vertical::-webkit-slider-thumb:hover {
  background: #00a1b2;
}

.volume-slider-vertical::-moz-range-thumb {
  height: 20px;
  width: 20px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.volume-slider-vertical::-moz-range-thumb:hover {
  background: #00a1b2;
}

.volume-slider-vertical::-ms-thumb {
  height: 20px;
  width: 20px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider-vertical::-ms-track {
  background: #00bcd4;
  border-color: transparent;
  border-width: 2px;
  color: transparent;
  width: 6px;
  height: 80px;
  border-radius: 3px;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  margin: 0 6px;
  transition: color 0.3s ease;
}

.icon-btn.active {
  filter: brightness(1.5);
  color: #00bcd4;
  transition: all 0.3s ease;
}

.playlist-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  background: rgb(0, 0, 0);
  border: 1px solid #ccc;
  padding: 6px 0;
  right: 0;
  top: -100px;
  z-index: 100;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-menu li {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-menu li:hover {
  background-color: #242424;
}
</style>
