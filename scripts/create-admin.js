async function createFirstAdmin() {
  if (typeof window.createAdminUser === "undefined") {
    console.error("❌ Firebase no está cargado. Asegúrate de estar en la página de la aplicación.")
    return
  }

  const email = prompt("Ingresa el email del administrador:")
  const password = prompt("Ingresa la contraseña (mínimo 6 caracteres):")

  if (!email || !password) {
    console.log("❌ Operación cancelada")
    return
  }
  if (password.length < 6) {
    console.error("❌ La contraseña debe tener al menos 6 caracteres")
    return
  }
  try {
    await window.createAdminUser(email, password)
    console.log("✅ ¡Usuario administrador creado exitosamente!")
    console.log("Ahora puedes iniciar sesión en /admin/login")
  } catch (error) {
    console.error("❌ Error:", error)
  }
}
createFirstAdmin()
