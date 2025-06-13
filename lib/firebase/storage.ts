import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage, isFirebaseConfigured } from "./config"

export async function uploadImage(file: File): Promise<string> {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error("Firebase no configurado")
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo es demasiado grande. Máximo 5MB.")
  }
  try {
    console.log("Subiendo imagen:", file.name)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const filename = `products/${timestamp}_${randomString}_${file.name}`
    const storageRef = ref(storage, filename)
    console.log("Subiendo archivo a:", filename)
    const snapshot = await uploadBytes(storageRef, file)
    console.log("Archivo subido exitosamente, obteniendo URL...")
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("URL de descarga obtenida:", downloadURL)
    return downloadURL
  } catch (error) {
    console.error("Error al subir imagen:", error)
    throw new Error("Error al subir imagen. Por favor intenta de nuevo.")
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error("Firebase no configurado")
  }
  try {
    const url = new URL(imageUrl)
    const path = decodeURIComponent(url.pathname.split("/o/")[1].split("?")[0])
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)

    console.log("Imagen eliminada exitosamente:", path)
  } catch (error) {
    console.error("Error al eliminar imagen:", error)
  }
}

export async function getDownloadUrlForFile(filePath: string): Promise<string | null> {
  if (!isFirebaseConfigured() || !storage) {
    console.error("Firebase no configurado. No se puede obtener la URL del archivo.")
    return null;
  }
  try {
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error: any) {
    console.error(`Error al obtener URL para ${filePath}:`, error);
    if (error.code === 'storage/object-not-found') {
      console.warn(`El archivo en la ruta "${filePath}" no se encontró en Firebase Storage.`);
    }
    return null;
  }
} 