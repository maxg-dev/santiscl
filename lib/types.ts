export interface Product {
  id: string
  name: string
  description: string
  price: number
  images?: string[]
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
