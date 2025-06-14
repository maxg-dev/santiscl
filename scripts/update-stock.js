require("dotenv").config({ path: ".env.local" })
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore")

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("⚙️ Firebase config:", firebaseConfig)

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function updateAllProductsStock() {
  const productsRef = collection(db, "products")
  const snapshot = await getDocs(productsRef)

  if (snapshot.empty) {
    console.log("❌ No se encontraron productos.")
    return
  }

  console.log(`🧩 Se encontraron ${snapshot.size} productos.`)

  const updatePromises = snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    console.log("🔄 Actualizando:", docSnap.id, data.name || "[sin nombre]")
    return updateDoc(doc(db, "products", docSnap.id), { stock: 3 })
  })

  await Promise.all(updatePromises)
  console.log("✅ Stock actualizado a 3 para todos los productos.")
}

updateAllProductsStock()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error al actualizar productos:", err)
    process.exit(1)
  })
