import React, { Suspense } from "react";
import LoginForm from "./LoginForm";

// Force dynamic rendering on Vercel to bypass static prerendering completely
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-16 text-foreground">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
