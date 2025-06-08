import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD_ZIGyYqGg312BnP5fNO8D_SV5p3ZmLiI',
  authDomain: 'my-music-app-9d10f.firebaseapp.com',
  projectId: 'my-music-app-9d10f',
  storageBucket: 'my-music-app-9d10f.appspot.com',
  messagingSenderId: '71460247563',
  appId: '1:71460247563:web:dcc064254d06fa73514f0e',
  measurementId: 'G-E07ZKLR5KD'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

const db = getFirestore(app)

export { db }
