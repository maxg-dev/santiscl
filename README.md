
# Santi’s – Montessori E-commerce 🧸🌱

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/magalvez-bukcls-projects/santiscl)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/EI5MhQe4QaS)

---

## 🛍️ Overview

**Santi’s** is a modern e-commerce platform in development, dedicated to offering Montessori-inspired products for children that encourage free play, independence, and conscious parenting.

Built with **TypeScript** and deployed on **Vercel**, Santi’s follows a **serverless architecture powered by Firebase**. It also includes a custom admin panel created using [v0.dev](https://v0.dev), allowing easy product management.

---

## 🚀 Live Demo

🔗 [Visit the deployed app](https://santiscl.vercel.app)

---

## 🛠️ Tech Stack

### Frontend

- **TypeScript** – Enables type-safe, scalable, and maintainable frontend development.
- **v0.dev** – Used to visually generate and sync UI components directly to the codebase.
- **React** – Core library for building the UI, with components generated and managed via v0.dev.
- **Next.js** – Provides routing, server-side rendering (SSR), and performance optimizations. Fully integrated with Vercel for seamless deployment.

### Backend & Database

- **Firebase** – Complete serverless backend suite:
  - **Firestore** – Flexible NoSQL database for product and user data.
  - **Authentication** – User login and identity management.
  - **Cloud Storage** – For hosting product images and assets.
  - **Cloud Functions** *(optional)* – For business logic (e.g., order processing, notifications).

### Hosting

- **Vercel** – Continuous deployment platform, seamless integration with GitHub and Next.js.

### Admin Tools

- **Admin Panel** – Built with **v0.dev**, allowing full product management through a friendly UI.

---

## 🧩 Key Features

- 🧸 **Detailed Product Catalog**  
  Includes filters by age, category, and more.

- 🧑‍💼 **Intuitive Admin Panel**  
  Easily add, edit, or remove products in real-time.

- 📦 **Modular and Scalable Codebase**  
  Designed to grow with new features.

- 🔌 **Firebase Serverless Backend**  
  Reliable, performant, and low maintenance.

- 🔒 **User Authentication**  
  Managed via Firebase Authentication, enabling secure login and access control for both customers and admins.

---

## 🧪 How It Works

1. **UI Construction**: Components are generated and synced via [v0.dev](https://v0.dev).
2. **Code Integration**: Changes are committed to GitHub automatically.
3. **Continuous Deployment**: Vercel deploys the latest version on every push.
4. **Backend Services**: Firebase handles authentication, database, and media storage.

---

## ⚙️ Local Installation & Setup (For Developers)

### Prerequisites

- Node.js (LTS)
- Firebase account + project
- Git

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/magalvez-bukcls-projects/santiscl.git
cd santiscl
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure Firebase**

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable:
  - Firestore
  - Authentication
  - Storage
- Go to Project Settings → Web App → Copy your Firebase config
- Create a `.env.local` file at the root of the project with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Use the `NEXT_PUBLIC_` prefix to expose these variables to the browser (required for Next.js).

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

The app will be running at `http://localhost:3000`.

---

## 🤝 Contribution

We welcome contributions!

To contribute:

1. Fork this repository
2. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```
3. Commit your changes:
```bash
git commit -m "feat: add feature"
```
4. Push to your fork:
```bash
git push origin feature/your-feature-name
```
5. Open a Pull Request 🚀

---

## 📄 License

This project does not currently have an explicit license. All rights are reserved by **Santi’s Team**.  
We may consider adding an open-source license (e.g., MIT) in the future. Feel free to open an issue to discuss.

---

## ✉️ Contact

Have questions or suggestions?  
📬 Contact us at: [khrisnagonzalez@outlook.com]

---

> Made with ❤️ by **Santi’s Team**
