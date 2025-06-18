<template>
  <div v-if="playlist" class="playlist-page">
  <div class="playlist-header">
    <div class="playlist-info">
      <img :src="playlist.coverUrl || '/default-playlist.png'" class="avatar" alt="Playlist" />
      <div>
        <h1>{{ playlist.name || 'Без названия' }}</h1>
        <button @click="showEditModal = true" class="edit-btn">Редактировать</button>
      </div>
    </div>
  </div>
<div v-if="activeTab === 'tracks'" class="track-list">
  <div
    v-for="track in tracks"
    :key="track.id"
    class="track"
    @click="playTrack(track)"
  >
    <img
      :src="track.coverUrl || '/default-cover.png'"
      class="track-cover"
      alt="Cover"
    />
    <div class="track-info">
      <div class="track-title">{{ track.name || 'Без названия' }}</div>
      <div class="track-artists">{{ track.artist || 'Неизвестный исполнитель' }}</div>
    </div>
    <button class="delete-btn" @click.stop="deleteTrack(track.id)">
      Удалить
    </button>
  </div>
</div>

    <div v-if="activeTab === 'details'" class="playlist-details">
      <p>{{ playlist.description || 'Описание отсутствует.' }}</p>
    </div>
  </div>

  <div v-else class="loading">Загрузка плейлиста...</div>

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
        <p class="title">{{ currentTrack.name || 'Без названия' }}</p>
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
  </div>
  <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
  <div class="modal-content">
    <h2>Редактировать плейлист</h2>
    <div class="form-group">
      <label>Название плейлиста</label>
      <input v-model="editForm.name" type="text">
    </div>
    <div class="form-group">
      <label>Обложка</label>
      <input type="file" @change="handleCoverUpload" accept="image/*">
      <img v-if="editForm.coverPreview" :src="editForm.coverPreview" class="cover-preview">
    </div>
    <div class="modal-actions">
      <button @click="updatePlaylist" class="save-btn">Сохранить</button>
      <button @click="deletePlaylist" class="delete-btn">Удалить плейлист</button>
      <button @click="showEditModal = false" class="cancel-btn">Отмена</button>
    </div>
  </div>
</div>
</template>

<script>
import { doc, getDoc, collection, getDocs, query, where, setDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/assets/js/firebase'
import { getAuth } from 'firebase/auth'

export default {
  data () {
    return {
      showEditModal: false,
      editForm: {
        name: '',
        coverFile: null,
        coverPreview: null
      },
      playlist: null,
      tracks: [],
      activeTab: 'tracks',
      isFavoritePlaylist: false,
      isShuffle: false,
      isRepeat: false,
      favoriteTrackIds: [],
      currentTrack: null,
      showDropdown: false,
      volume: 1,
      audio: null,
      showVolumeSlider: false,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      playlists: [],
      showMenu: false
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
      return this.currentTrack && Array.isArray(this.favoriteTrackIds) ? this.favoriteTrackIds.includes(this.currentTrack.id) : false
    }
  },
  methods: {
    async deleteTrack (trackId) {
      if (!this.playlist?.id) return
      if (!confirm('Удалить этот трек из плейлиста?')) return
      try {
        await deleteDoc(doc(db, 'Playlists', this.playlist.id, 'Tracks', trackId))
        this.tracks = this.tracks.filter(track => track.id !== trackId)
      } catch (error) {
        console.error('Ошибка при удалении трека:', error)
      }
    },
    async updatePlaylist () {
      try {
        const playlistRef = doc(db, 'Playlists', this.playlist.id)
        const updateData = { name: this.editForm.name }
        if (this.editForm.coverFile) {
          const coverUrl = await this.uploadToCloudinary(this.editForm.coverFile)
          updateData.coverUrl = coverUrl
        }
        await updateDoc(playlistRef, updateData)
        await this.fetchPlaylistData()
        this.showEditModal = false
      } catch (error) {
        console.error('Ошибка при обновлении плейлиста:', error)
      }
    },
    async uploadToCloudinary (file) {
      const url = 'https://api.cloudinary.com/v1_1/dkanmxrwa/upload'
      const preset = 'ml_default'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', preset)

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ошибка загрузки на Cloudinary:', errorText)
        throw new Error('Ошибка загрузки на Cloudinary')
      }
      const data = await response.json()
      return data.secure_url
    },
    openEditModal () {
      this.editForm = {
        name: this.playlist.name,
        coverFile: null,
        coverPreview: this.playlist.coverUrl || null
      }
      this.showEditModal = true
    },
    handleCoverUpload (event) {
      const file = event.target.files[0]
      if (file) {
        this.editForm.coverFile = file
        this.editForm.coverPreview = URL.createObjectURL(file)
      }
    },
    async deletePlaylist () {
      if (confirm('Вы уверены, что хотите удалить этот плейлист?')) {
        try {
          const tracksSnapshot = await getDocs(collection(db, 'Playlists', this.playlist.id, 'Tracks'))
          const deletePromises = tracksSnapshot.docs.map(doc => deleteDoc(doc.ref))
          await Promise.all(deletePromises)
          await deleteDoc(doc(db, 'Playlists', this.playlist.id))
          this.$router.push('/')
        } catch (error) {
          console.error('Ошибка при удалении плейлиста:', error)
        }
      }
    },
    async fetchFavoriteTracks () {
      try {
        const userId = getAuth().currentUser?.uid
        if (!userId) return
        const favRef = collection(db, 'Favorite_Tracks')
        const q = query(favRef, where('user_id', '==', userId))
        const snapshot = await getDocs(q)
        this.favoriteTrackIds = snapshot.docs.map(doc => doc.data().track_id)
      } catch (error) {
        console.error('Ошибка загрузки избранных треков:', error)
      }
    },
    async fetchPlaylistData () {
      try {
        const playlistId = this.$route.params.id
        const playlistDoc = await getDoc(doc(db, 'Playlists', playlistId))
        if (playlistDoc.exists()) {
          this.playlist = { id: playlistDoc.id, ...playlistDoc.data() }
        }

        const tracksSnapshot = await getDocs(collection(db, 'Playlists', playlistId, 'Tracks'))
        this.tracks = tracksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))

        await this.checkIfPlaylistIsFavorite()
      } catch (error) {
        console.error('Ошибка загрузки плейлиста:', error)
      }
    },
    async checkIfPlaylistIsFavorite () {
      const userId = getAuth().currentUser?.uid
      if (!userId || !this.playlist?.id) return

      const favRef = collection(db, 'Favorite_Playlists')
      const q = query(favRef, where('user_id', '==', userId), where('playlist_id', '==', this.playlist.id))
      const snapshot = await getDocs(q)

      this.isFavoritePlaylist = !snapshot.empty
    },

    async toggleFavoritePlaylist () {
      const userId = getAuth().currentUser?.uid
      if (!userId || !this.playlist?.id) return

      const favRef = collection(db, 'Favorite_Playlists')
      const q = query(favRef, where('user_id', '==', userId), where('playlist_id', '==', this.playlist.id))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id
        await deleteDoc(doc(db, 'Favorite_Playlists', docId))
        this.isFavoritePlaylist = false
      } else {
        await addDoc(favRef, {
          user_id: userId,
          playlist_id: this.playlist.id,
          added_at: serverTimestamp()
        })
        this.isFavoritePlaylist = true
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
        name: track.name || 'Без названия',
        coverUrl: track.coverUrl || '/default-cover.png',
        audioUrl: track.audioUrl,
        artist: track.artist || 'Неизвестный исполнитель'
      }

      this.audio.src = this.currentTrack.audioUrl
      this.audio.load()
      this.audio.play()
      this.isPlaying = true
      this.updateVolume()
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
      if (this.isShuffle) {
        this.playRandomTrack()
      } else {
        const currentIndex = this.tracks.findIndex((t) => t.id === this.currentTrack.id)
        const nextIndex = (currentIndex + 1) % this.tracks.length
        this.playTrack(this.tracks[nextIndex])
      }
    },
    prevTrack () {
      if (!this.currentTrack || !this.tracks.length) return
      if (this.isShuffle) {
        this.playRandomTrack()
      } else {
        const currentIndex = this.tracks.findIndex((t) => t.id === this.currentTrack.id)
        const prevIndex = (currentIndex - 1 + this.tracks.length) % this.tracks.length
        this.playTrack(this.tracks[prevIndex])
      }
    },
    playRandomTrack () {
      if (!this.tracks.length) return
      if (this.tracks.length === 1) {
        this.playTrack(this.tracks[0])
        return
      }
      let availableTracks = this.tracks.filter((t) => t.id !== this.currentTrack?.id)

      if (availableTracks.length === 0) {
        availableTracks = [...this.tracks]
      }
      const randomIndex = Math.floor(Math.random() * availableTracks.length)
      this.playTrack(availableTracks[randomIndex])
    },
    toggleRepeat () {
      this.isRepeat = !this.isRepeat
    },

    updateVolume () {
      if (this.audio) {
        this.audio.volume = this.volume
      }
    },

    toggleVolumeSlider () {
      this.showVolumeSlider = !this.showVolumeSlider
    },
    toggleDropdown () {
      this.showMenu = !this.showMenu
    },
    toggleShuffle () {
      this.isShuffle = !this.isShuffle
      if (this.isShuffle && this.currentTrack) {
        this.playRandomTrack()
      }
    },

    formatTime (seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },

    async fetchUserPlaylists () {
      const userId = getAuth().currentUser?.uid
      if (!userId) return

      const snapshot = await getDocs(collection(db, 'Playlists'))
      this.playlists = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.user_id === userId)
      console.log('Loaded playlists:', this.playlists)
    },

    async addTrackToPlaylist (playlistId) {
      try {
        const userId = getAuth().currentUser?.uid
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

      const userId = getAuth().currentUser?.uid
      const newDoc = await addDoc(collection(db, 'Playlists'), {
        name,
        user_id: userId,
        createdAt: Date.now()
      })
      await this.addTrackToPlaylist(newDoc.id)
      await this.fetchUserPlaylists()
    }
  },
  async mounted () {
    await this.fetchPlaylistData()
    await this.fetchUserPlaylists()
    await this.fetchFavoriteTracks()
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
.playlist-page {
  color: white;
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  padding-bottom: 70px;
}

.playlist-header {
  margin-bottom: 24px;
}

.playlist-info {
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

.playlist-info h1 {
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

.follow-btn {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background-color: transparent;
  border: 2px solid #fffdfd;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.follow-btn:hover {
  background-color: #333;
  color: white;
}

.follow-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.3);
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
  top: -150px;
  z-index: 100;
  min-width: 160px;
  margin-top: -50px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #282828;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  color: white;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 8px;
  background: #535353;
  border: none;
  border-radius: 4px;
  color: white;
}

.cover-preview {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.save-btn {
  background: #1db954;
  color: white;
}

.delete-btn {
  background: #ff4d4d;
  color: white;
}

.cancel-btn {
  background: #535353;
  color: white;
}

.edit-btn {
  background: transparent;
  border: 1px solid #535353;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn:hover {
  border-color: white;
}

.track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  gap: 12px;
}

.track-cover {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.track-info {
  flex: 1;
  margin-left: 10px;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>
