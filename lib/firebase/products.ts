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
import type { ParentProduct, ProductVariant } from "@/lib/types"

const PARENT_PRODUCTS_COLLECTION = "parent_products"
const PRODUCT_VARIANTS_SUBCOLLECTION = "product_variants"

/**
 * Retrieves all parent products from Firestore, ordered by name.
 * @returns A promise that resolves to an array of ParentProduct objects.
 * @throws {Error} If Firebase is not configured or an error occurs during fetching.
 */
export async function getAllParentProducts(): Promise<ParentProduct[]> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. Por favor configura Firebase para acceder a los productos padre.")
  }
  try {
    console.log(`Obteniendo productos padre de Firestore (${PARENT_PRODUCTS_COLLECTION})...`)
    const q = query(collection(db, PARENT_PRODUCTS_COLLECTION), orderBy("name", "asc"))
    const querySnapshot = await getDocs(q)
    const parentProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ParentProduct[]
    console.log(`Se obtuvieron ${parentProducts.length} productos padre.`)
    return parentProducts
  } catch (error) {
    console.error("Error al obtener productos padre:", error)
    throw new Error("Error al cargar productos padre. Por favor intenta de nuevo.")
  }
}

/**
 * Retrieves a single parent product by its ID.
 * @param parentId The ID of the parent product.
 * @returns A promise that resolves to the ParentProduct object or null if not found.
 * @throws {Error} If Firebase is not configured or an error occurs during fetching.
 */
export async function getParentProduct(parentId: string): Promise<ParentProduct | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede obtener el producto padre.")
  }
  try {
    console.log(`Obteniendo producto padre con ID: ${parentId}...`)
    const docRef = doc(db, PARENT_PRODUCTS_COLLECTION, parentId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as ParentProduct
    }
    console.log(`Producto padre con ID: ${parentId} no encontrado.`)
    return null
  } catch (error) {
    console.error(`Error al obtener producto padre ${parentId}:`, error)
    throw new Error("Error al cargar el producto padre. Por favor intenta de nuevo.")
  }
}

/**
 * Retrieves all variants for a specific parent product.
 * @param parentId The ID of the parent product.
 * @returns A promise that resolves to an array of ProductVariant objects.
 * @throws {Error} If Firebase is not configured or an error occurs during fetching.
 */
export async function getProductVariants(parentId: string): Promise<ProductVariant[]> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se pueden obtener las variantes del producto.")
  }
  try {
    console.log(`Obteniendo variantes para el producto padre ${parentId}...`)
    const q = query(
      collection(db, PARENT_PRODUCTS_COLLECTION, parentId, PRODUCT_VARIANTS_SUBCOLLECTION),
      orderBy("variantName", "asc") // Order variants by their display name
    )
    const querySnapshot = await getDocs(q)
    const variants = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      parentId: parentId, // Ensure parentId is explicitly set from path
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ProductVariant[]
    console.log(`Se obtuvieron ${variants.length} variantes para el producto padre ${parentId}.`)
    return variants
  } catch (error) {
    console.error(`Error al obtener variantes para el producto padre ${parentId}:`, error)
    throw new Error("Error al cargar las variantes del producto. Por favor intenta de nuevo.")
  }
}

/**
 * Retrieves a parent product and all its associated variants in a single operation.
 * This is useful for product detail pages.
 * @param parentId The ID of the parent product.
 * @returns A promise that resolves to an object containing the parent product and its variants, or null if parent not found.
 * @throws {Error} If Firebase is not configured or an error occurs during fetching.
 */
export async function getProductAndVariants(parentId: string): Promise<{ parent: ParentProduct; variants: ProductVariant[] } | null> {
    if (!isFirebaseConfigured() || !db) {
        throw new Error("Firebase no configurado. No se puede obtener el producto y sus variantes.");
    }
    try {
        const parentProduct = await getParentProduct(parentId);
        if (!parentProduct) {
            return null;
        }
        const variants = await getProductVariants(parentId);
        return { parent: parentProduct, variants };
    } catch (error) {
        console.error(`Error al obtener producto padre y variantes para ${parentId}:`, error);
        throw new Error("Error al cargar el producto y sus variantes. Por favor intenta de nuevo.");
    }
}


/**
 * Adds a new parent product to Firestore.
 * @param parentData The data for the new parent product (excluding ID and timestamps).
 * @returns A promise that resolves to the ID of the newly created parent product document.
 * @throws {Error} If Firebase is not configured or an error occurs during addition.
 */
export async function addParentProduct(parentData: Omit<ParentProduct, "id" | "createdAt" | "updatedAt">): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede agregar el producto padre.")
  }
  try {
    console.log("Agregando producto padre a Firestore...", parentData)
    const docRef = await addDoc(collection(db, PARENT_PRODUCTS_COLLECTION), {
      ...parentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("Producto padre agregado exitosamente con ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error al agregar producto padre:", error)
    throw new Error("Error al agregar producto padre. Verifica tus permisos.")
  }
}

/**
 * Updates an existing parent product in Firestore.
 * @param parentId The ID of the parent product to update.
 * @param updates Partial data for the parent product to update.
 * @returns A promise that resolves when the update is complete.
 * @throws {Error} If Firebase is not configured or an error occurs during update.
 */
export async function updateParentProduct(parentId: string, updates: Partial<ParentProduct>): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede actualizar el producto padre.")
  }
  try {
    console.log(`Actualizando producto padre ${parentId}...`, updates)
    const docRef = doc(db, PARENT_PRODUCTS_COLLECTION, parentId)
    // Exclude createdAt from direct updates if it's already set
    const { createdAt, ...updateData } = updates;
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
    console.log(`Producto padre ${parentId} actualizado exitosamente.`)
  } catch (error) {
    console.error("Error al actualizar producto padre:", error)
    throw new Error("Error al actualizar producto padre. Verifica tus permisos.")
  }
}

/**
 * Deletes a parent product from Firestore.
 * IMPORTANT: This only deletes the parent document. To delete all subcollection variants,
 * a Firebase Cloud Function is recommended for comprehensive data cleanup.
 * @param parentId The ID of the parent product to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws {Error} If Firebase is not configured or an error occurs during deletion.
 */
export async function deleteParentProduct(parentId: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede eliminar el producto padre.")
  }
  try {
    console.log(`Eliminando producto padre ${parentId}...`)
    const docRef = doc(db, PARENT_PRODUCTS_COLLECTION, parentId)
    await deleteDoc(docRef)
    console.log(`Producto padre ${parentId} eliminado exitosamente.`)
    console.warn("Recuerda que la eliminación de un producto padre no elimina automáticamente sus subcolecciones de variantes. Considera usar una Cloud Function para una eliminación completa.")
  } catch (error) {
    console.error("Error al eliminar producto padre:", error)
    throw new Error("Error al eliminar producto padre. Verifica tus permisos.")
  }
}

/**
 * Adds a new product variant to a parent product.
 * @param parentId The ID of the parent product.
 * @param variantData The data for the new product variant (excluding ID and parentId).
 * @returns A promise that resolves to the ID of the newly created variant document.
 * @throws {Error} If Firebase is not configured or an error occurs during addition.
 */
export async function addProductVariant(parentId: string, variantData: Omit<ProductVariant, "id" | "parentId" | "createdAt" | "updatedAt">): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede agregar la variante del producto.")
  }
  try {
    console.log(`Agregando variante para el producto padre ${parentId}...`, variantData)
    const docRef = await addDoc(collection(db, PARENT_PRODUCTS_COLLECTION, parentId, PRODUCT_VARIANTS_SUBCOLLECTION), {
      ...variantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log(`Variante agregada exitosamente con ID: ${docRef.id} para el producto padre ${parentId}.`)
    return docRef.id
  } catch (error) {
    console.error("Error al agregar variante del producto:", error)
    throw new Error("Error al agregar variante del producto. Verifica tus permisos.")
  }
}

/**
 * Updates an existing product variant.
 * @param parentId The ID of the parent product.
 * @param variantId The ID of the variant to update.
 * @param updates Partial data for the product variant to update.
 * @returns A promise that resolves when the update is complete.
 * @throws {Error} If Firebase is not configured or an error occurs during update.
 */
export async function updateProductVariant(parentId: string, variantId: string, updates: Partial<ProductVariant>): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede actualizar la variante del producto.")
  }
  try {
    console.log(`Actualizando variante ${variantId} para el producto padre ${parentId}...`, updates)
    const docRef = doc(db, PARENT_PRODUCTS_COLLECTION, parentId, PRODUCT_VARIANTS_SUBCOLLECTION, variantId)
    // Exclude createdAt and parentId from direct updates
    const { createdAt, parentId: updatedParentId, ...updateData } = updates;
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
    console.log(`Variante ${variantId} para el producto padre ${parentId} actualizada exitosamente.`)
  } catch (error) {
    console.error("Error al actualizar variante del producto:", error)
    throw new Error("Error al actualizar variante del producto. Verifica tus permisos.")
  }
}

/**
 * Deletes a product variant.
 * @param parentId The ID of the parent product.
 * @param variantId The ID of the variant to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws {Error} If Firebase is not configured or an error occurs during deletion.
 */
export async function deleteProductVariant(parentId: string, variantId: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase no configurado. No se puede eliminar la variante del producto.")
  }
  try {
    console.log(`Eliminando variante ${variantId} para el producto padre ${parentId}...`)
    const docRef = doc(db, PARENT_PRODUCTS_COLLECTION, parentId, PRODUCT_VARIANTS_SUBCOLLECTION, variantId)
    await deleteDoc(docRef)
    console.log(`Variante ${variantId} para el producto padre ${parentId} eliminada exitosamente.`)
  } catch (error) {
    console.error("Error al eliminar variante del producto:", error)
    throw new Error("Error al eliminar variante del producto. Verifica tus permisos.")
  }
}
