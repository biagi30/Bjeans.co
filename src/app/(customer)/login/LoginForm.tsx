"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/core/components/shared/Button";

type Step = "credentials" | "otp";

export default function LoginForm() {
  const [step, setStep] = useState<Step>("credentials");

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Shared
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown resend
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  // ── STEP 1: Validasi kredensial + kirim OTP ────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setCountdown(60);
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verifikasi OTP → JWT ──────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpCode.join("");
    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        const userRole = data.data?.user?.role;
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        window.location.href =
          userRole === "admin" ? redirect || "/admin/dashboard" : redirect || "/";
      } else {
        setError(data.error || "Verifikasi OTP gagal");
      }
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpCode(["", "", "", "", "", ""]);
        setCountdown(60);
        otpRefs.current[0]?.focus();
      } else {
        setError(data.error || "Gagal mengirim ulang OTP");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box handlers ───────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpCode];
    next[index] = value.slice(-1);
    setOtpCode(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    paste.split("").forEach((ch, i) => (next[i] = ch));
    setOtpCode(next);
    otpRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors pt-16">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/10 dark:border-white/5" />

        {/* Header */}
        <h1 className="text-2xl font-display font-bold text-center mb-2 text-foreground tracking-wide">
          Login ke Bjeans
        </h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step === "credentials" ? "bg-foreground" : "bg-foreground/20"}`} />
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step === "otp" ? "bg-foreground" : "bg-foreground/20"}`} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-3 rounded-lg relative z-10">
            {error}
          </div>
        )}

        {/* ════ STEP 1: Kredensial ════ */}
        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Memeriksa..." : "Lanjutkan"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Setelah verifikasi, kode OTP akan dikirim ke email kamu.
            </p>
          </form>
        )}

        {/* ════ STEP 2: OTP ════ */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Kode OTP dikirim ke
              </p>
              <p className="font-semibold text-foreground mt-0.5">{email}</p>
            </div>

            {/* 6-box OTP */}
            <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-11 text-center text-lg font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground"
                  style={{ height: "3.25rem" }}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || otpCode.join("").length < 6}
            >
              {loading ? "Memverifikasi..." : "Verifikasi & Login"}
            </Button>

            {/* Resend + Back */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtpCode(["", "", "", "", "", ""]);
                  setError("");
                  setCountdown(0);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Kembali
              </button>

              {countdown > 0 ? (
                <span className="text-muted-foreground text-xs">
                  Kirim ulang dalam {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="text-foreground font-medium hover:text-primary transition-colors underline underline-offset-2"
                >
                  Kirim ulang OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground mt-6 relative z-10">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-foreground hover:text-primary transition-colors font-medium border-b border-foreground/30 pb-0.5"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
