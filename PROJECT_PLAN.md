# Bjeans.co Project Plan - 2026 Edition

## 1. Project Overview

**Bjeans.co** is a premium denim e-commerce platform specializing in two main service lines:

1. **Retail Shop**: Ready-to-wear denim products.
2. **Bespoke Custom Tailor**: A 4-step interactive wizard for custom-made jeans.

### Core Innovation: Unified Cart & Order Splitting

The system allows users to checkout both retail and custom items simultaneously. Behind the scenes, the backend logic must split these into separate order entities for different fulfillment workflows.

---

## 2. Technical Stack (Advanced 2026 Suite)

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS 4.0 + CSS Variables for dynamic Light/Dark themes.
- **UI Components**: **Shadcn/UI** (Radix UI) for accessible, high-performance primitives.
- **Animations**:
  - **Framer Motion**: For fluid layout transitions and micro-interactions.
  - **GSAP + ScrollTrigger**: For high-end "Awwwards-style" scroll-driven storytelling.
  - **Lenis**: For smooth, "butter-like" inertial scrolling.
- **Icons**: **Lucide-React** for sharp, modern minimalism.
- **Backend**: Fullstack Next.js (App Router) using API Routes for REST APIs.
- **Database**: **MongoDB (Mongoose)** - Chosen for its flexibility with varied product attributes and body measurement profiles.
- **Assets**:
  - **Cloudinary**: For optimized, high-res denim imagery.
  - **Three.js (Optional)**: For 3D denim texture previews in the Custom Builder.

---

## 3. UI/UX Strategy (2026 Standards)

Inspired by **Dribbble** and **Awwwards** winners.

- **Aesthetic**: "Classy Obsidian & Ivory".
  - **Dark Mode**: Deep midnight blues and obsidian (#0A0A0B).
  - **Light Mode**: Crisp, paper-white (#FAFAFA) with subtle shadows.
  - **Accent**: **Electric Indigo (#4F46E5)** for focus states and call-to-actions.
- **Interactivity**:
  - **Magnetic Buttons**: Subtle pull towards the cursor.
  - **Custom Cursor**: A refined interactive circle that reacts to hoverable elements.
  - **Bento-Grid Architecture**: Asymmetric layouts that feel like a high-fashion magazine.
  - **Morphing Transitions**: The Custom Builder wizard will use morphing layout animations between steps.

---

## 4. API Routes Structure (Next.js App Router)

All backend endpoints will live under `src/app/api` using route handlers.

- **Auth & RBAC**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **Users & Profiles**
  - `GET /api/users`
  - `GET /api/users/[id]`
  - `PATCH /api/users/[id]`
  - `GET /api/measurements`
  - `POST /api/measurements`
  - `PATCH /api/measurements/[id]`
- **Products (Retail + Custom Materials)**
  - `GET /api/products`
  - `GET /api/products/[id]`
  - `POST /api/products`
  - `PATCH /api/products/[id]`
  - `GET /api/materials`
  - `POST /api/materials`
- **Custom Builder**
  - `GET /api/custom/options`
  - `POST /api/custom/quote`
  - `POST /api/custom/submit`
- **Cart & Checkout**
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PATCH /api/cart/items/[id]`
  - `DELETE /api/cart/items/[id]`
  - `POST /api/checkout`
- **Orders**
  - `GET /api/orders`
  - `GET /api/orders/[id]`
  - `PATCH /api/orders/[id]`

### 4.1 Auth & RBAC Middleware

- **Auth**: HttpOnly session cookie or JWT in HttpOnly cookie.
- **RBAC**: Role guards for `admin`, `staff`, `customer`.
- **Route protection**:
  - Public: `/api/auth/*`, `GET /api/products`, `GET /api/materials`
  - Customer: cart, checkout, orders (own scope)
  - Staff/Admin: product/material management, order status updates
- **Ownership checks**: `orders` and `measurements` must match `userId` unless admin/staff.
- **Audit hooks**: record `updatedBy`, `updatedAt` for admin/staff actions.

---

## 5. Peta Jalan Fitur (Feature Roadmap)

1. **Modul 0: UI/UX & Lokalisasi** - [SELESAI] Implementasi UI modern, mode Gelap/Terang (Tema Klasik Obsidian/Gading), dan terjemahan bahasa Indonesia untuk seluruh halaman (Beranda, Tentang, Toko, Custom).
2. **Modul 1: Autentikasi & RBAC** - [DALAM PENGERJAAN] Peran Admin, Staf, dan Pelanggan.
3. **Modul 2: Master Produk & Material** - [TERTUNDA] Manajemen inventaris ritel dan kain custom.
4. **Modul 3: Pembuat Custom (Custom Builder)** - [TERTUNDA] Wizard multi-langkah (Kain -> Model -> Detail -> Ukuran).
5. **Modul 4: Profil Ukuran (Measurement Profile)** - [TERTUNDA] Metrik tubuh yang disimpan pengguna untuk pesanan custom berulang.
6. **Modul 5: Checkout Terpadu (Unified Checkout)** - [TERTUNDA] Logika untuk menangani keranjang tipe ganda dan pemisahan pesanan.
7. **Modul 6: Dasbor Admin** - [TERTUNDA] Statistik real-time, pemrosesan pesanan, dan manajemen status.

---

## 6. Keputusan yang Telah Diambil

- [x] **Database**: MongoDB (Fleksibel/Dokumen).
- [x] **Arsitektur**: Fullstack Next.js dengan API Routes/App Router.
- [x] **Hosting**: Vercel (Frontend + Next.js API).
- [x] **Lokalisasi**: Bahasa Indonesia.
- [x] **Tema Visual**: Classy Obsidian & Ivory, Dark Indigo Denim untuk mode gelap.

---

## 7. Langkah Selanjutnya (Next Steps)

1. **Penyelesaian Modul 1 (Autentikasi & RBAC)**:
   - Integrasikan sistem autentikasi (NextAuth / implementasi kustom).
   - Buat middleware untuk melindungi rute berdasarkan peran.
2. **Pengembangan Modul 2 (Master Produk)**:
   - Buat skema database MongoDB untuk produk ritel dan material.
   - Buat API endpoint untuk CRUD produk.
3. **Integrasi Frontend - Backend**:
   - Hubungkan data dummy di halaman Toko dan Custom Tailor dengan API backend yang sebenarnya.

---

_Catatan: Rencana ini berfungsi sebagai mandat dasar untuk pengembangan Bjeans.co._
