import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar si Firebase está configurado
export const isFirebaseConfigured = () => {
  const configured = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  )

  if (!configured) {
    console.error("Firebase no está completamente configurado. Verifica tu archivo .env.local")
    console.error("Variables requeridas:", {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId,
    })
  }

  return configured
}

// Inicializar Firebase solo si está configurado
let app
let db
let storage
let auth

if (isFirebaseConfigured()) {
  try {
    // Inicializar app si no existe
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

    // Inicializar servicios
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)

    console.log("Firebase inicializado correctamente")
  } catch (error) {
    console.error("Error de inicialización de Firebase:", error)
  }
} else {
  console.error("Firebase no configurado - la aplicación no funcionará correctamente")
}

export { app, db, storage, auth }
