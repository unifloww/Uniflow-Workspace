import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any;
let db: any;
let auth: any;
let initializationPromise: Promise<void> | null = null;

export async function initFirebase() {
  if (app) return { app, db, auth };
  if (initializationPromise) {
    await initializationPromise;
    return { app, db, auth };
  }

  initializationPromise = (async () => {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
      auth = getAuth(app);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  })();

  await initializationPromise;
  return { app, db, auth };
}
