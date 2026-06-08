"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success", title = null, duration = 4000) => {
    setToast({ message, type, title, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Helper to resolve title from type
  const getTitle = () => {
    if (toast.title) return toast.title;
    switch (toast.type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "info":
        return "Info";
      case "warning":
        return "Warning";
      default:
        return "Notification";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-32px)] max-w-md p-4.5 rounded-2xl border shadow-xl flex items-start gap-3 bg-white ${
              toast.type === "success"
                ? "border-emerald-100 bg-emerald-50/95 text-emerald-800"
                : toast.type === "error"
                ? "border-red-100 bg-red-50/95 text-red-800"
                : "border-blue-100 bg-blue-50/95 text-blue-800"
            }`}
          >
            {/* Icon */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
              toast.type === "success" 
                ? "bg-emerald-500" 
                : toast.type === "error" 
                ? "bg-red-500" 
                : "bg-blue-500"
            }`}>
              {toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i"}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 m-0 text-inherit">
                {getTitle()}
              </h4>
              <p className="text-xs leading-relaxed font-medium m-0 opacity-90 break-words">
                {toast.message}
              </p>
            </div>
            
            {/* Dismiss Button */}
            <button
              type="button"
              onClick={hideToast}
              className="bg-transparent border-none text-[11px] font-bold text-inherit hover:opacity-75 cursor-pointer self-start py-0.5 px-1.5 focus:outline-none"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
