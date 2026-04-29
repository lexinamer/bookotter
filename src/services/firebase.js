import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCwsS60Q5A4pknaNRn5Hr2tmI7jtvlm_Ec',
  authDomain: 'bookotter-app.firebaseapp.com',
  projectId: 'bookotter-app',
  storageBucket: 'bookotter-app.firebasestorage.app',
  messagingSenderId: '165049402865',
  appId: '1:165049402865:web:4412e088942be155d23050',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);