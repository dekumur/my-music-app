<template>
  <div>
    <h1>Результаты поиска для: "{{ searchTerm }}"</h1>
    <div v-if="loading">Загрузка...</div>
    <ul v-if="results.length > 0">
      <li v-for="(track, index) in results" :key="index">
        {{ track.title || 'Без названия' }} — {{ track.artist || 'Без артиста' }}
      </li>
    </ul>

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
        console.log('🚀 Новый поисковый запрос:', newQuery)
        this.searchTerm = newQuery || ''
        this.performSearch(this.searchTerm)
      }
    }
  },
  methods: {
    async performSearch (queryText) {
      if (!queryText) {
        console.log('⛔ Пустой поисковый запрос')
        this.results = []
        return
      }

      this.loading = true
      this.results = []

      try {
        console.log('🔍 Выполняется поиск для:', queryText)

        const tracksRef = collection(db, 'Track')
        const snapshot = await getDocs(tracksRef)

        console.log('📦 Получено документов из коллекции Track:', snapshot.size)

        const lowerQuery = queryText.toLowerCase()

        snapshot.forEach(doc => {
          const data = doc.data()
          console.log('📝 Документ:', data)

          const title = (data.title || '').toLowerCase()
          const artist = (data.artist || '').toLowerCase()

          if (title.includes(lowerQuery) || artist.includes(lowerQuery)) {
            console.log('✅ Совпадение найдено:', data)
            this.results.push(data)
          }
        })

        if (this.results.length === 0) {
          console.log('⚠️ Совпадений не найдено')
        }
      } catch (err) {
        console.error('❌ Ошибка при поиске:', err)
      } finally {
        this.loading = false
        console.log('🔚 Поиск завершён. Найдено результатов:', this.results.length)
      }
    }
  }
}
</script>
