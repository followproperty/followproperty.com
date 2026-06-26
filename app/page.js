"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Nav from "@/components/landing/CTASection";
import Hero from "@/components/landing/HeroSection";
import CoreFlows from "@/components/landing/FeaturesSection";
import FeaturedProjects from "@/components/landing/FeaturedProjects";
import Footer from "@/components/landing/Footer";
import ReferralAdWidget from "@/components/landing/ReferralAdWidget";

export default function Home() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
    hasPortfolio: false,
    hasWatchlist: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch portfolios and watchlists in parallel from secure MongoDB APIs
          const [portfolioRes, watchlistRes] = await Promise.all([
            fetch("/api/portfolio"),
            fetch("/api/watchlist")
          ]);

          let hasPortfolio = false;
          let hasWatchlist = false;

          if (portfolioRes.ok) {
            const pJson = await portfolioRes.json();
            if (pJson.success && Array.isArray(pJson.data) && pJson.data.length > 0) {
              hasPortfolio = true;
            }
          }

          if (watchlistRes.ok) {
            const wJson = await watchlistRes.json();
            if (wJson.success && Array.isArray(wJson.data) && wJson.data.length > 0) {
              hasWatchlist = true;
            }
          }

          setAuthState({
            isAuthenticated: true,
            loading: false,
            hasPortfolio,
            hasWatchlist
          });
        } catch (err) {
          console.error("Error fetching landing counts:", err);
          setAuthState({
            isAuthenticated: true,
            loading: false,
            hasPortfolio: false,
            hasWatchlist: false
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          loading: false,
          hasPortfolio: false,
          hasWatchlist: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen font-sans antialiased overflow-x-hidden max-w-full">
      <Nav authState={authState} />
      <Hero authState={authState} />
      <CoreFlows authState={authState} />
      <FeaturedProjects />
      <Footer />
      <ReferralAdWidget />
    </div>
  );
}

