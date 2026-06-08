"use client";

import dynamic from "next/dynamic";
import React from "react";

// Use next/dynamic with ssr: false to completely bypass any prerender error 
// caused by useSearchParams on Vercel deployment.
const LoginFormClient = dynamic(() => import("./LoginForm"), { 
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center pt-16">Loading...</div>
});

export default function LoginPage() {
  return <LoginFormClient />;
}
