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

## 5. Feature Roadmap

1. **Module 1: Authentication & RBAC**: Admin, Staff, and Customer roles.
2. **Module 2: Product & Material Master**: Management of retail inventory vs. custom fabrics.
3. **Module 3: The Custom Builder**: Multi-step wizard (Fabric -> Model -> Detail -> Measurement).
4. **Module 4: Measurement Profile**: User-saved body metrics for recurring custom orders.
5. **Module 5: Unified Checkout**: Logic for handling dual-type carts and order splitting.
6. **Module 6: Admin Dashboard**: Real-time stats, order processing, and status management.

---

## 6. Outstanding Decisions

- [x] **Database**: MongoDB (Flexible/Document).
- [x] **Architecture**: Fullstack Next.js with API Routes/App Router (No separate Express backend).
- [x] **Hosting**: Vercel (Frontend + Next.js API).

---

_Note: This plan serves as a foundational mandate for the development of Bjeans.co._
