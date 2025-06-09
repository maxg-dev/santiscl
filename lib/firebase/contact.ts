import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db, isFirebaseConfigured } from "./config"
import type { ContactMessage } from "@/lib/types"

const CONTACT_COLLECTION = "contact_messages"

export async function submitContactForm(messageData: Omit<ContactMessage, "id" | "createdAt">): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede enviar el mensaje.")
  }

  try {
    console.log("Enviando mensaje de contacto...", messageData)
    const docRef = await addDoc(collection(db, CONTACT_COLLECTION), {
      ...messageData,
      createdAt: serverTimestamp(),
    })

    console.log("Mensaje enviado exitosamente con ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error)
    throw new Error("Error al enviar mensaje. Por favor intenta de nuevo.")
  }
}
