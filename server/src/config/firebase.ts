import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// In a real scenario, you would use a service account key file
// or set GOOGLE_APPLICATION_CREDENTIALS environment variable.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
