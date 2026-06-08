import { Suspense } from "react";
import { connection } from "next/server";
import LoginForm from "./LoginForm";

// Next.js 16: use connection() to opt into dynamic rendering.
// This replaces the removed `export const dynamic = "force-dynamic"`.
export default async function LoginPage() {
  await connection();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-16 text-foreground">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
