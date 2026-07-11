"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { requestFcmPermissionAndRegister } from "@/lib/fcm-client";
import BottomNav from "../dashboard/BottomNav";
import Footer from "../landing/Footer";
import Loading from "../ui/Loading";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(isAuth);
      
      const path = window.location.pathname;
      const isPublicRoute = path.startsWith("/projects") || path.startsWith("/builders") || path.startsWith("/compare") || path === "/";
      if (isAuth || isPublicRoute) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("isAuthenticated", "true");
          }
          // Trigger FCM background registration
          requestFcmPermissionAndRegister();
          const token = await currentUser.getIdToken();
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            const status = data.user.builderApplicationStatus;
            if (status === "draft" || status === "rejected") {
              router.push("/builder-register");
              return; // Keep loading true during redirection
            } else if (status === "pending") {
              router.push("/builder-application-status");
              return; // Keep loading true during redirection
            } else if (status === "approved") {
              router.push("/builder-dashboard");
              return; // Keep loading true during redirection
            }
          } else {
            // Server verification failed (e.g. login disabled or session invalid)
            setIsAuthenticated(false);
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("isAuthenticated");
              sessionStorage.removeItem("currentUser");
              const path = window.location.pathname;
              const isPublicRoute = path.startsWith("/projects") || path.startsWith("/builders") || path.startsWith("/compare") || path === "/";
              if (!isPublicRoute) {
                router.push("/login");
                return;
              }
            }
          }
        } else {
          setIsAuthenticated(false);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("currentUser");
            const path = window.location.pathname;
            const isPublicRoute = path.startsWith("/projects") || path.startsWith("/builders") || path.startsWith("/compare") || path === "/";
            if (!isPublicRoute) {
              router.push("/login");
              return;
            }
          }
        }
      } catch (e) {
        console.error("Error verifying in DashboardLayout:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      {mounted && isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-w-full">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between w-full max-w-full">
          <div className="flex-1 p-4 md:p-8 pb-10">
            {loading ? (
              <Loading text="Securing session..." />
            ) : (
              children
            )}
          </div>
          <div className="mt-24 md:mt-32 pb-16 md:pb-0">
            <Footer />
          </div>
        </main>
      </div>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}

