"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const success = (message: string) => showToast(message, "success");
  const error = (message: string) => showToast(message, "error");
  const info = (message: string) => showToast(message, "info");

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = "text-blue-500";
          let borderColor = "border-blue-500/20";
          let bgClass = "bg-blue-950/20 dark:bg-blue-950/30";

          if (toast.type === "success") {
            Icon = CheckCircle2;
            iconColor = "text-emerald-500";
            borderColor = "border-emerald-500/20";
            bgClass = "bg-emerald-950/20 dark:bg-emerald-950/30";
          } else if (toast.type === "error") {
            Icon = AlertCircle;
            iconColor = "text-rose-500";
            borderColor = "border-rose-500/20";
            bgClass = "bg-rose-950/20 dark:bg-rose-950/30";
          }

          return (
            <ToastItem
              key={toast.id}
              toast={toast}
              Icon={Icon}
              iconColor={iconColor}
              borderColor={borderColor}
              bgClass={bgClass}
              onClose={removeToast}
            />
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  Icon,
  iconColor,
  borderColor,
  bgClass,
  onClose,
}: {
  toast: Toast;
  Icon: any;
  iconColor: string;
  borderColor: string;
  bgClass: string;
  onClose: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000); // 4 seconds duration
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 w-full rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in ${borderColor} ${bgClass}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
      <div className="flex-grow">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {toast.type === "success" ? "Berhasil" : toast.type === "error" ? "Kesalahan" : "Informasi"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
