import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const dbRefs = {
  game: () => ref(db, 'game'),
  stocks: () => ref(db, 'stocks'),
  stock: (id: string) => ref(db, `stocks/${id}`),
  players: () => ref(db, 'players'),
  player: (id: string) => ref(db, `players/${id}`),
  orders: () => ref(db, 'orders'),
  hints: () => ref(db, 'hints'),
  sessionResults: () => ref(db, 'sessionResults'),
};
