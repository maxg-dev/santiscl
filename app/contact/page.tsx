"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm } from "@/lib/firebase/contact"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await submitContactForm(formData)
      setSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error: any) {
      console.error("Error al enviar formulario:", error)
      setError(error.message || "Error al enviar mensaje")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    const message = "¡Hola! Me gustaría ponerme en contacto sobre sus productos de Santi's."
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-800">
              Santi's
            </Link>
            <div className="flex space-x-6">
              <Link href="/" className="text-orange-700 hover:text-orange-900 font-medium">
                Inicio
              </Link>
              <Link href="/products" className="text-orange-700 hover:text-orange-900 font-medium">
                Productos
              </Link>
              <Link href="/contact" className="text-orange-700 hover:text-orange-900 font-medium">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-900 mb-4">Contáctanos</h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre nuestros productos? ¡Nos encantaría saber de ti!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100">
            <h2 className="text-2xl font-semibold text-orange-900 mb-6">Envíanos un Mensaje</h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">¡Mensaje Enviado!</h3>
                <p className="text-green-700 mb-4">Gracias por contactarnos. Te responderemos pronto.</p>
                <Button onClick={() => setSubmitted(false)} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Enviar Otro Mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-orange-900 mb-2">
                    Nombre *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-orange-900 mb-2">
                    Correo Electrónico *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-orange-900 mb-2">
                    Asunto *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-orange-900 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100">
              <h2 className="text-2xl font-semibold text-orange-900 mb-6">Contacto Rápido</h2>
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
                size="lg"
              >
                Chatear por WhatsApp
              </Button>
              <p className="text-orange-700 text-center">Obtén respuestas instantáneas a tus preguntas</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">¿Por Qué Elegirnos?</h3>
              <ul className="space-y-3 text-orange-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Orientación experta en materiales Montessori
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Recomendaciones personalizadas de productos
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Servicio al cliente rápido y confiable
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Garantía de calidad en todos los productos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
