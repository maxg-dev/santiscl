import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./config"
import type { Product } from "@/lib/types"

const PRODUCTS_COLLECTION = "products"

export async function getProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. Por favor configura Firebase para acceder a los productos.")
  }

  try {
    console.log("Obteniendo productos de Firestore...")
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("name", "asc"))
    const querySnapshot = await getDocs(q)

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[]

    console.log(`Se obtuvieron ${products.length} productos de Firestore`)
    return products
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw new Error("Error al cargar productos. Por favor intenta de nuevo.")
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado")
  }

  try {
    console.log(`Obteniendo producto ${id} de Firestore...`)
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product
    }

    return null
  } catch (error) {
    console.error("Error al obtener producto:", error)
    throw new Error("Error al cargar producto")
  }
}

export async function addProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado")
  }

  try {
    console.log("Agregando producto a Firestore...", productData)
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("Producto agregado exitosamente con ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error al agregar producto:", error)
    throw new Error("Error al agregar producto. Verifica tus permisos.")
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado")
  }

  try {
    console.log(`Actualizando producto ${id}...`, productData)
    const docRef = doc(db, PRODUCTS_COLLECTION, id)

    // Remover campos que no deben actualizarse
    const { createdAt, ...updateData } = productData

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })

    console.log(`Producto ${id} actualizado exitosamente`)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw new Error("Error al actualizar producto. Verifica tus permisos.")
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado")
  }

  try {
    console.log(`Eliminando producto ${id}...`)
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await deleteDoc(docRef)

    console.log(`Producto ${id} eliminado exitosamente`)
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw new Error("Error al eliminar producto. Verifica tus permisos.")
  }
}
