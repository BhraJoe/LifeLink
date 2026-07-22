import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCTaq1-cFtdKT_4rffAd_5NyPz_XMus1sQ',
  authDomain: 'lifelink-e7cc3.firebaseapp.com',
  projectId: 'lifelink-e7cc3',
  storageBucket: 'lifelink-e7cc3.firebasestorage.app',
  messagingSenderId: '730724902172',
  appId: '1:730724902172:web:24a1f229dbc7efc38f86d9',
  measurementId: 'G-NJNDENQBPS',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getApps().length === 0
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

export { app, auth };
