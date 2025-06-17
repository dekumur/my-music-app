<template>
  <div v-if="playlist" class="playlist-page">
    <div class="playlist-header">
      <div class="playlist-info">
        <img :src="playlist.coverUrl || '/default-playlist.png'" class="avatar" alt="Playlist" />
        <h1>{{ playlist.name || 'Без названия' }}</h1>
        <button @click="toggleFavoritePlaylist" class="follow-btn">
          {{ isFavoritePlaylist ? 'Удалить из избранного' : 'Добавить в избранное' }}
        </button>
      </div>
      <div class="tabs">
        <button :class="{ active: activeTab === 'tracks' }" @click="activeTab = 'tracks'">Треки</button>
        <button :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">Описание</button>
      </div>
    </div>

    <div v-if="activeTab === 'tracks'" class="track-list">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track"
        @click="playTrack(track)"
      >
        <img :src="track.coverUrl || '/default-cover.png'" class="track-cover" alt="Cover" />
        <div class="track-info">
          <div class="track-title">{{ track.name || 'Без названия' }}</div>
          <div class="track-artists">{{ track.artist || 'Неизвестный исполнитель' }}</div>
        </div>
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
              v-for="playlist in userPlaylists"
              :key="playlist.id"
              @click="addTrackToPlaylist(playlist.id); showMenu = false"
            >
              {{ playlist.name }}
            </li>
            <li class="create-new" @click="createNewPlaylist">+ Новый плейлист</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, collection, getDocs, query, where, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/assets/js/firebase'
import { getAuth } from 'firebase/auth'

export default {
  data () {
    return {
      playlist: null,
      tracks: [],
      activeTab: 'tracks',
      isFavoritePlaylist: false,
      isShuffle: false,
      isRepeat: false,
      currentTrack: null,
      volume: 1,
      audio: null,
      showVolumeSlider: false,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      userPlaylists: [],
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
      return this.currentTrack && this.favoriteTrackIds.includes(this.currentTrack.id)
    }
  },
  methods: {
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

      const currentIndex = this.tracks.findIndex((t) => t.id === this.currentTrack.id)
      const nextIndex = (currentIndex + 1) % this.tracks.length
      this.playTrack(this.tracks[nextIndex])
    },

    prevTrack () {
      if (!this.currentTrack || !this.tracks.length) return

      const currentIndex = this.tracks.findIndex((t) => t.id === this.currentTrack.id)
      const prevIndex = (currentIndex - 1 + this.tracks.length) % this.tracks.length
      this.playTrack(this.tracks[prevIndex])
    },

    playRandomTrack () {
      const otherTracks = this.tracks.filter((t) => t.id !== this.currentTrack?.id)
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

    toggleVolumeSlider () {
      this.showVolumeSlider = !this.showVolumeSlider
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
      this.userPlaylists = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.user_id === userId)
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
    this.audio = new Audio()
    this.audio.addEventListener('timeupdate', this.updateProgress)
    this.audio.addEventListener('ended', this.onEnded)
    this.audio.volume = this.volume

    await this.fetchPlaylistData()
    await this.fetchUserPlaylists()
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
</style>
