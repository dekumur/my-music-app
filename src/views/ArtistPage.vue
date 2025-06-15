<template>
  <AppHeader />

  <div v-if="artist" class="artist-page">
    <div class="artist-header">
      <div class="artist-info">
        <img :src="artist.photo_url || '/default-artist.png'" class="avatar" alt="Artist" />
        <h1>{{ artist.name }}</h1>
      </div>
      <div class="tabs">
        <button :class="{ active: activeTab === 'tracks' }" @click="activeTab = 'tracks'">Треки</button>
        <button :class="{ active: activeTab === 'albums' }" @click="activeTab = 'albums'">Альбомы</button>
      </div>
    </div>

    <div v-if="activeTab === 'tracks'" class="track-list">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track"
        @click="playTrack(track)"
      >
        <img :src="track.cover_url || '/default-cover.png'" class="track-cover" alt="Cover" />
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artists">{{ track.artist || 'Неизвестный исполнитель' }}</div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'albums'">
      <p>Альбомы скоро будут добавлены.</p>
    </div>
  </div>

  <div v-else class="loading">Загрузка исполнителя...</div>

  <div v-if="currentTrack" class="spotify-player" @click.self="showMenu = false">
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
        <div v-show="showVolumeSlider" class="volume-slider-container">
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

      <div class="playlist-dropdown" @click.stop>
        <button class="icon-btn" @click="toggleDropdown">
          <i class="fas fa-plus"></i>
        </button>
        <div v-show="showMenu" class="dropdown-menu">
          <ul>
            <li
              v-for="playlist in playlists"
              :key="playlist.id"
              @click="addToPlaylist(playlist.id); showMenu = false"
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

  <AppFooter />
</template>

<script>
import AppFooter from '@/components/Footer.vue'
import { doc, getDoc, collection, query, where, getDocs, setDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { db } from '@/assets/js/firebase'
import { getAuth } from 'firebase/auth'

export default {
  name: 'ArtistPage',
  components: { AppFooter },
  data () {
    return {
      artist: null,
      tracks: [],
      activeTab: 'tracks',
      isRepeat: false,
      favoriteTrackIds: [],
      showMenu: false,
      playlists: [],
      showDropdown: false,
      isShuffle: false,
      currentTrack: null,
      volume: 1,
      audio: null,
      showVolumeSlider: false,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      loading: true
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
    toggleDropdown () {
      this.showMenu = !this.showMenu
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
    async playTrack (track) {
      if (!this.audio) {
        this.audio = new Audio()
        this.audio.addEventListener('timeupdate', this.updateProgress)
        this.audio.addEventListener('ended', this.onEnded)
      }

      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.audio.pause()
        this.isPlaying = false
        this.currentTrack = null
        return
      }

      this.currentTrack = {
        id: track.id,
        name: track.title || track.name,
        coverUrl: track.cover_url || '/default-cover.png',
        audioUrl: track.audio_file_url,
        artist: track.artist || 'Неизвестный'
      }

      this.audio.src = this.currentTrack.audioUrl
      this.audio.load()
      this.audio.play()
      this.isPlaying = true
      this.updateVolume()

      await this.addToRecentlyPlayed(track.id)
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
      if (!this.currentTrack || !this.tracks.length) return

      const currentIndex = this.tracks.findIndex(t => t.id === this.currentTrack.id)
      const nextIndex = (currentIndex + 1) % this.tracks.length
      this.playTrack(this.tracks[nextIndex])
    },
    prevTrack () {
      if (!this.currentTrack || !this.tracks.length) return

      const currentIndex = this.tracks.findIndex(t => t.id === this.currentTrack.id)
      const prevIndex = (currentIndex - 1 + this.tracks.length) % this.tracks.length
      this.playTrack(this.tracks[prevIndex])
    },
    playRandomTrack () {
      const otherTracks = this.tracks.filter(t => t.id !== this.currentTrack?.id)
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
    },
    async addToRecentlyPlayed (trackId) {
      try {
        const userId = this.getUserId()
        if (!userId) return

        const historyRef = collection(db, 'Listening_History')
        const q = query(historyRef, where('user_id', '==', userId), where('track_id', '==', trackId))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id
          const docRef = doc(db, 'Listening_History', docId)
          await setDoc(docRef, {
            user_id: userId,
            track_id: trackId,
            played_at: serverTimestamp()
          }, { merge: true })
          return
        }

        const userQ = query(historyRef, where('user_id', '==', userId))
        const userSnapshot = await getDocs(userQ)

        if (userSnapshot.size >= 7) {
          const tracks = []
          userSnapshot.forEach(docSnap => {
            tracks.push({ id: docSnap.id, ...docSnap.data() })
          })
          tracks.sort((a, b) => (a.played_at?.seconds || 0) - (b.played_at?.seconds || 0))
          const oldest = tracks[0]
          const oldestRef = doc(db, 'Listening_History', oldest.id)
          await setDoc(oldestRef, {
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
      } catch (error) {
        console.error('Ошибка при сохранении истории:', error)
      }
    },
    async loadArtistData () {
      try {
        const artistRef = doc(db, 'Artist', this.$route.params.id)
        const artistDoc = await getDoc(artistRef)
        if (!artistDoc.exists()) {
          console.warn('Артист не найден')
          this.artist = null
          return
        }
        this.artist = { id: artistDoc.id, ...artistDoc.data() }

        const sampleTrack = await getDocs(collection(db, 'Track'))
        const trackData = sampleTrack.docs[0]?.data()
        console.log('Пример artist_id в треке:', trackData?.artist_id)

        let trackQuery
        if (typeof trackData?.artist_id === 'string') {
          trackQuery = query(collection(db, 'Track'), where('artist_id', '==', artistRef.id))
        } else {
          trackQuery = query(collection(db, 'Track'), where('artist_id', '==', artistRef))
        }

        const querySnapshot = await getDocs(trackQuery)
        console.log('Найдено треков:', querySnapshot.size)

        const loaded = querySnapshot.docs.map(docSnap => {
          const t = docSnap.data()
          return {
            id: docSnap.id,
            title: t.title || t.name || 'Без названия',
            cover_url: t.cover_url || '/default-cover.png',
            audio_file_url: t.audio_file_url || '',
            artist: this.artist.name
          }
        })
        this.tracks = loaded
      } catch (err) {
        console.error('Ошибка loadArtistData:', err)
      } finally {
        this.loading = false
      }
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
    },
    async fetchFavoriteTracks () {
      try {
        const userId = this.getUserId()
        if (!userId) return

        const favRef = collection(db, 'Favorite_Tracks')
        const q = query(favRef, where('user_id', '==', userId))
        const snapshot = await getDocs(q)

        this.favoriteTrackIds = snapshot.docs.map(docSnap => docSnap.data().track_id)
      } catch (error) {
        console.error('Ошибка при получении избранных треков:', error)
      }
    }
  },
  mounted () {
    this.audio = new Audio()
    this.audio.addEventListener('timeupdate', this.updateProgress)
    this.audio.addEventListener('ended', this.onEnded)
    this.audio.volume = this.volume

    this.loadArtistData()
    this.fetchFavoriteTracks()
    this.fetchPlaylists()
  },
  beforeUnmount () {
    if (this.audio) {
      this.audio.removeEventListener('timeupdate', this.updateProgress)
      this.audio.removeEventListener('ended', this.onEnded)
      this.audio.pause()
    }
  }
}
</script>

<style scoped>
.artist-page {
  color: white;
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  padding-bottom: 70px;
}

.artist-header {
  margin-bottom: 24px;
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 125px;
  height: 125px;
  border-radius: 6px;
  object-fit: cover;
}

.artist-info h1 {
  font-size: 20px;
  margin: 0;
}

.tabs {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.tabs button {
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  padding: 4px 6px;
  cursor: pointer;
  opacity: 0.6;
}

.tabs button.active {
  opacity: 1;
  border-bottom: 2px solid #00ffff;
  border-radius: 0px !important;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.track {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  cursor: pointer;
}

.track:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.track-info {
  display: flex;
  flex-direction: column;
}

.track-title {
  font-size: 14px;
  font-weight: 500;
}

.track-artists {
  font-size: 12px;
  color: #aaa;
}
.recently_dried {
  margin: 50px auto;
  max-width: 1200px;
  padding: 0 20px;
  text-align: left;
  letter-spacing: 2px;
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
