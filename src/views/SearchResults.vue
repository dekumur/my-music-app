<template>
  <div>
    <h1>Результаты поиска для: "{{ searchTerm }}"</h1>
    <div v-if="loading">Загрузка...</div>
    <div v-if="results.length > 0" class="search-results">
      <div v-for="(track, index) in results" :key="index" class="slide-content hoverable">
            <img :src="track.coverUrl" :alt="formatTrackName(track.name)" />
            <p>{{ formatTrackName(track.name) }}</p>
      </div>
    </div>
    <div v-else-if="!loading && searchTerm">
      Ничего не найдено
    </div>
  </div>
</template>

<script>
import { db } from '@/assets/js/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: 'SearchResults',
  data () {
    return {
      searchTerm: '',
      results: [],
      loading: false
    }
  },
  watch: {
    '$route.query.q': {
      immediate: true,
      handler (newQuery) {
        this.searchTerm = newQuery || ''
        this.performSearch(this.searchTerm)
      }
    }
  },
  methods: {
    formatTrackName (name) {
      if (!name) return 'Без названия'
      // Ваша логика форматирования названия трека
      return name
    },
    async performSearch (queryText) {
      if (!queryText) {
        this.results = []
        return
      }

      this.loading = true

      try {
        const tracksRef = collection(db, 'Track')
        const snapshot = await getDocs(tracksRef)
        const lowerQuery = queryText.toLowerCase()
        const matched = []

        snapshot.forEach(doc => {
          const data = doc.data()
          const title = (data.title || data.name || '').toLowerCase()
          const artist = (data.artist || '').toLowerCase()

          if (title.includes(lowerQuery) || artist.includes(lowerQuery)) {
            matched.push({
              ...data,
              // Для совместимости с обоими вариантами названий
              name: data.name || data.title,
              coverUrl: data.coverUrl || data.cover || '/default-cover.png'
            })
          }
        })

        this.results = matched
      } catch (err) {
        console.error('Ошибка при поиске:', err)
        this.results = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.slide-content {
  text-align: center;
}

.slide-content img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.slide-content p {
  margin-top: 8px;
  font-size: 14px;
}
</style>
