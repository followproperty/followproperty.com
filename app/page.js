"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Nav from "@/components/landing/CTASection";
import Hero from "@/components/landing/HeroSection";

// Dynamically import lower-fold components to optimize page load speeds
const TrustSection = dynamic(() => import("@/components/landing/TrustSection"), { ssr: true });
const PlatformOverview = dynamic(() => import("@/components/landing/ProductPreview"), { ssr: true });
const ProductShowcase = dynamic(() => import("@/components/landing/ProductShowcase"), { ssr: true });
const MarketIntelligence = dynamic(() => import("@/components/landing/FeaturesSection"), { ssr: true });
const FeaturedProjects = dynamic(() => import("@/components/landing/FeaturedProjects"), { ssr: true });
const HomeLoanCTA = dynamic(() => import("@/components/landing/HowItWorks"), { ssr: true });
const FinalCTASection = dynamic(() => import("@/components/landing/FinalCTASection"), { ssr: true });
const Footer = dynamic(() => import("@/components/landing/Footer"), { ssr: true });
const ReferralAdWidget = dynamic(() => import("@/components/landing/ReferralAdWidget"), { ssr: false });

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
          // Fetch portfolios and watchlists in parallel from MongoDB APIs
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
      {/* 1. Navigation */}
      <Nav authState={authState} />

      {/* 2. Hero */}
      <Hero authState={authState} />

      {/* 3. Trust Metrics */}
      <TrustSection />

      {/* 4. Product Showcase */}
      <ProductShowcase />

      {/* 5. Platform Overview */}
      <PlatformOverview />

      {/* 6. Market Intelligence */}
      <MarketIntelligence />

      {/* 7. Featured Projects */}
      <div id="featured-developments">
        <FeaturedProjects />
      </div>

      {/* 8. Home Loan CTA */}
      <HomeLoanCTA />

      {/* 9. Final CTA */}
      <FinalCTASection />

      {/* 10. Footer */}
      <Footer />

      {/* 11. Referral Ad Widget */}
      <ReferralAdWidget />
    </div>
  );
}
