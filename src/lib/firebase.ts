// ============================================================
// Firebase Configuration (Auth Only - No Firestore)
// Firestore 경고를 방지하기 위해 Auth만 동적 로드
// ============================================================

// 타입만 import (런타임에 영향 없음)
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';

// Firebase 설정 (환경 변수에서 로드)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 싱글톤 인스턴스
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initialized = false;

// 동적 import로 Firebase 초기화 (Firestore 로딩 방지)
async function initializeFirebaseAsync(): Promise<FirebaseApp | null> {
  if (initialized && app) return app;

  // 환경 변수가 없으면 초기화하지 않음
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.log('[Firebase] Configuration not found, skipping initialization');
    return null;
  }

  try {
    // 동적 import - Firestore 제외하고 app만 로드
    const { initializeApp, getApps, getApp } = await import('firebase/app');

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    initialized = true;
    return app;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return null;
  }
}

// Firestore는 현재 사용하지 않음
export function getFirestoreDb() {
  console.warn('[Firebase] Firestore is not configured in this app');
  return null;
}

// Auth 인스턴스 가져오기 (비동기)
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (auth) return auth;

  const firebaseApp = await initializeFirebaseAsync();
  if (!firebaseApp) return null;

  try {
    const { getAuth } = await import('firebase/auth');
    auth = getAuth(firebaseApp);
    return auth;
  } catch (error) {
    console.error('[Firebase] Auth initialization failed:', error);
    return null;
  }
}

// Firebase 앱 가져오기 (비동기)
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  return initializeFirebaseAsync();
}

// 동기 버전 (이미 초기화된 경우만)
export function getFirebaseAuthSync(): Auth | null {
  return auth;
}

export function getFirebaseAppSync(): FirebaseApp | null {
  return app;
}

export { app, auth };
