import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpkgBg4e8WZtG_2MjES3DW36QrGoYA6C0",
  authDomain: "Tekrem-alerts.firebaseapp.com",
  projectId: "Tekrem-alerts",
  storageBucket: "Tekrem-alerts.firebasestorage.app",
  messagingSenderId: "95817534149",
  appId: "1:95817534149:web:c536cb4d6a92586c8d7eac",
  measurementId: "G-LCYPZBEVED"
};  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      // The signed-in user info.
      const user = result.user;
      // The Google OAuth access token.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      return { user, token };
    })
    .catch((error) => {
      // Handle Errors here.
      return { error };
    });
}

export default auth;
