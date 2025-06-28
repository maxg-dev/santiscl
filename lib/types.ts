// Original Product interface (might still be used temporarily or for old data)
// We will eventually transition all code to use ParentProduct and ProductVariant
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images?: string[]
  category: string
  highlighted: boolean
  stock?: number
  ageRecommendation?: string
  dimensions?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  createdAt?: Date
}

// NEW INTERFACES FOR PRODUCT VERSIONING

/**
 * Represents the generic product (e.g., "Mesa de Actividades Montessori").
 * Holds common attributes shared across all its variants.
 */
export interface ParentProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  highlighted: boolean;
  ageRecommendation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents a specific version or variant of a ParentProduct
 * (e.g., "Mesa de Actividades - Rojo", "Mesa de Actividades - Grande").
 * Holds version-specific attributes.
 */
export interface ProductVariant {
  id: string;
  parentId: string;
  variantName: string;
  price: number;
  images: string[];
  description?: string;
  dimensions?: string;
  stock: number;
  attributes: {
    color?: string;
    size?: string;
  };
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
