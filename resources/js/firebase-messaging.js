// Firebase Cloud Messaging setup for push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from "firebase/analytics";
    
const firebaseConfig = {
  apiKey: "AIzaSyDpkgBg4e8WZtG_2MjES3DW36QrGoYA6C0",
  authDomain: "tekrem-alerts.firebaseapp.com",
  projectId: "tekrem-alerts",
  storageBucket: "tekrem-alerts.firebasestorage.app",
  messagingSenderId: "95817534149",
  appId: "1:95817534149:web:c536cb4d6a92586c8d7eac",
  measurementId: "G-LCYPZBEVED"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);
export function requestNotificationPermission() {
  return Notification.requestPermission();
}

export async function getFcmToken() {
  try {
    const token = await getToken(messaging, { vapidKey: 'BIYXC_OmMSwXqgaEVgNo9olNEt-MRwI1EH5fTv5-maTZF6GKtH_sqmPgUSbsxCc0dMGKFf2byaZoYs1OXm_UXk0' });
    return token;
  } catch (err) {
    return null;
  }
}

export function listenForForegroundMessages(callback) {
  onMessage(messaging, callback);
}
