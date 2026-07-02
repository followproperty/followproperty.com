"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Nav from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  Activity, 
  Phone, 
  Calendar, 
  Download, 
  BadgePercent, 
  CheckCircle2, 
  Trees, 
  Zap, 
  ArrowRight,
  Loader2,
  Lock,
  GraduationCap,
  Sparkles,
  X
} from "lucide-react";

export default function VrindavanPlotsPage() {
  notFound();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
    hasPortfolio: false,
    hasWatchlist: false
  });

  // Modal Inquiry State
  const [showModal, setShowModal] = useState(false);
  const [modalTrigger, setModalTrigger] = useState("Consultation");

  const openInquiryModal = (triggerType) => {
    setModalTrigger(triggerType);
    setIsSuccess(false);
    setErrorMessage("");
    setShowModal(true);
  };


  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
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
          console.error("Error loading auth details:", err);
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


  // Submit Lead
  const handleLeadSubmit = async (e, directAction = false, actionType = "Consultation") => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!leadName || !leadPhone || !leadCity) {
      setErrorMessage("Please fill out all fields before proceeding.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          city: leadCity,
          projectId: "6a42690ea992f7d3cd93a68e", // Seeded Vrindavan project ID
          projectName: "Vrindavan Plotting Project",
          source: `plotsinvrindavan_${actionType.toLowerCase().replace(/ /g, "_")}`
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit request.");
      }

      setIsSuccess(true);

      // WhatsApp Redirect URL construction
      const waNumber = "918796508866";
      const messageText = `Hi! I am interested in the Vrindavan Plotting Project. My details:\nName: ${leadName}\nPhone: ${leadPhone}\nCity: ${leadCity}\nRequesting: ${actionType}`;
      const encodedMsg = encodeURIComponent(messageText);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMsg}`;

      // Trigger brochure download programmatically if it is a brochure action
      if (actionType.toLowerCase().includes("brochure")) {
        const link = document.createElement("a");
        link.href = "/Vrindavan_Project_Follow_Property.pdf";
        link.download = "Vrindavan_Project_Follow_Property.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Open WhatsApp after a short delay
      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 800);

      // Reset modal state after short delay
      setTimeout(() => {
        setShowModal(false);
        setIsSuccess(false);
      }, 2500);

    } catch (err) {
      console.error("Error submitting lead:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick WhatsApp Direct Button (without filling form first)
  const handleQuickWhatsApp = () => {
    const waNumber = "918796508866";
    const messageText = `Hi! I am interested in the Vrindavan Plotting Project. Please share the pricing details and brochure.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(messageText)}`, "_blank");
  };

  return (
    <div className="bg-brand-bg min-h-screen font-sans antialiased overflow-x-hidden max-w-full">
      {/* Navigation */}
      <Nav authState={authState} />

      {/* Main Container */}
      <main className="pt-20">
        
        {/* HERO SECTION */}
        <section className="relative py-16 md:py-24 bg-brand-navy text-white overflow-hidden">
          {/* Subtle geometric glowing background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-brand-blue-light),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 left-0 h-24 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />

          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/10 bg-white/5 shadow-inner">
                <Sparkles size={13} className="text-brand-amber animate-pulse" />
                <span className="text-[10px] md:text-[11px] text-white/90 tracking-[0.12em] uppercase font-bold">
                  70+ Acres Integrated Township
                </span>
              </div>

              <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold tracking-tight leading-[1.1] text-white">
                Vrindavan <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-light to-emerald-400">Plotting Project</span>
              </h1>
              
              <p className="text-[15px] md:text-[18px] text-brand-slate-light leading-relaxed max-w-2xl font-medium">
                Premium residential plots for modern living. Secure your space in a futuristic, well-planned gated community designed for a better tomorrow.
              </p>

              {/* USP Highlights List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                {[
                  { text: "Well Planned", sub: "Infrastructure" },
                  { text: "Green & Pure", sub: "Eco-Environment" },
                  { text: "Connected", sub: "Growth Corridor" },
                  { text: "Futuristic", sub: "Modern Smart Tech" }
                ].map((usp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-brand-amber font-bold text-sm tracking-wide">{usp.text}</div>
                    <div className="text-xs text-white/50">{usp.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <a 
                  href="#inquire" 
                  className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep text-white font-bold py-3.5 px-7 rounded-xl shadow-brand-blue transition-all duration-300"
                >
                  <Phone size={16} /> Request Pricing Info
                </a>
                <button 
                  onClick={() => openInquiryModal("Brochure Download")}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-7 rounded-xl border border-white/15 cursor-pointer transition-all duration-300"
                >
                  <Download size={16} /> Download Brochure
                </button>
              </div>
            </div>

            {/* Hero Right Banner Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-blue/30 to-brand-amber/30 blur opacity-40 animate-pulse" />
              <div className="relative bg-brand-bg-card text-brand-navy p-6 md:p-8 rounded-2xl border border-brand-border shadow-2xl flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <span className="badge-amber font-bold text-xs">HOT OPPORTUNITY</span>
                  <div className="flex items-center gap-1.5 text-xs text-brand-slate font-bold">
                    <Calendar size={13} className="text-brand-blue" />
                    Possession in 2 Years
                  </div>
                </div>

                <div className="space-y-2 pb-6 border-b border-brand-border">
                  <div className="text-xs font-bold text-brand-slate uppercase tracking-wider">Starts From</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-brand-navy">₹45,000</span>
                    <span className="text-sm font-bold text-brand-slate">/ Sq. Yd.</span>
                  </div>
                  <p className="text-[11px] text-brand-emerald font-bold m-0 flex items-center gap-1">
                    <CheckCircle2 size={12} /> RERA Approval In Process
                  </p>
                </div>

                {/* Key Quick Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-slate font-medium">Plots Sizes Available:</span>
                    <span className="font-extrabold text-brand-navy">100 - 250 Sq. Yds.</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-slate font-medium">GST Rate:</span>
                    <span className="font-extrabold text-brand-navy">18% GST Applicable</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-slate font-medium">Payment Model:</span>
                    <span className="font-extrabold text-brand-emerald">25% x 4 Easy Plan</span>
                  </div>
                </div>

                {/* Direct Connect */}
                <button 
                  onClick={handleQuickWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <Phone size={16} fill="white" /> Contact via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT HIGHLIGHTS */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge-blue mb-3">Project Overview</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy">
                Key Project Highlights
              </h2>
              <p className="text-sm text-brand-slate mt-2 leading-relaxed">
                Discover the top-tier amenities, facilities, and structures planned for this landmark plotting project in Vrindavan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Compass className="text-brand-blue" size={24} />, title: "70+ Acres Township", desc: "Featuring 10 acres of green area and well-planned spaces" },
                { icon: <Building className="text-brand-blue" size={24} />, title: "Plot Sizes", desc: "100 to 250 Sq. Yd. configurations to suit your needs" },
                { icon: <Zap className="text-brand-blue" size={24} />, title: "Underground Wiring", desc: "Clean streets with no overhead cables for safety and beauty" },
                { icon: <Building className="text-brand-blue" size={24} />, title: "Stilt + 3 Construction", desc: "Permitted height allowances for spacious residential designs" },
                { icon: <ShieldCheck className="text-brand-blue" size={24} />, title: "Club House", desc: "Premium recreational community center with high-end amenities" },
                { icon: <CheckCircle2 className="text-brand-blue" size={24} />, title: "Mandir inside Township", desc: "Peaceful spiritual space located right within the community" },
                { icon: <Trees className="text-brand-blue" size={24} />, title: "Resort inside Township", desc: "Luxury guest accommodation and wellness facility options" },
                { icon: <GraduationCap className="text-brand-blue" size={24} />, title: "Dedicated School", desc: "High-quality academic options built directly in the township" }
              ].map((highlight, idx) => (
                <div key={idx} className="card-frame p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center mb-4">
                    {highlight.icon}
                  </div>
                  <h4 className="text-base font-extrabold text-brand-navy mb-2">{highlight.title}</h4>
                  <p className="text-xs text-brand-slate leading-relaxed m-0 font-medium">{highlight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEAD CAPTURE FORM SECTION */}
        <section id="inquire" className="py-16 bg-brand-bg border-y border-brand-border">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge-amber mb-3">Get Quote</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy">
                Request Pricing & Consultation
              </h2>
              <p className="text-sm text-brand-slate mt-2 leading-relaxed">
                Fill out the short form below to check premium plot inventory, detailed costing options, and receive direct updates on WhatsApp.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-brand">
              <h3 className="text-lg font-extrabold text-brand-navy mb-2 tracking-tight text-center">
                Unlock Exclusive Inventory
              </h3>
              <p className="text-xs text-brand-slate text-center max-w-sm mx-auto mb-6 leading-relaxed font-semibold">
                Share your details to receive the official pricing brochure, premium unit allocations, and connect directly with a certified property advisor.
              </p>

              {isSuccess ? (
                <div className="text-center py-8 space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-brand-emerald-bg text-brand-emerald border border-brand-emerald/10 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-brand-navy m-0">Inquiry Saved!</h4>
                    <p className="text-xs text-brand-slate mt-1 leading-relaxed font-semibold">
                      Redirecting you to our advisory desk on WhatsApp to share unit maps...
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="btn-secondary py-2 text-xs"
                  >
                    Fill Form Again
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => handleLeadSubmit(e, true, "Quote Request")} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-brand-red-bg border border-brand-red-border text-brand-red text-xs rounded-xl font-medium animate-in slide-in-from-top-1">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="form-name" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input 
                      id="form-name"
                      type="text" 
                      required 
                      placeholder="Enter your name"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="form-phone" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input 
                      id="form-phone"
                      type="tel" 
                      required 
                      placeholder="Enter your phone number"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="form-city" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Your City
                    </label>
                    <input 
                      id="form-city"
                      type="text" 
                      required 
                      placeholder="Enter your city"
                      value={leadCity}
                      onChange={(e) => setLeadCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5 shadow-brand-blue"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Request Quote on WhatsApp <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* PAYMENT PLAN */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge-blue mb-3">Structured Payments</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy">
                Flexible Payment Plan (25 x 4)
              </h2>
              <p className="text-sm text-brand-slate mt-2 leading-relaxed">
                The project budget is split into four equal installments of 25% to ensure safety and convenience throughout development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connecting line for timeline */}
              <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-0.5 bg-brand-border pointer-events-none z-0" />

              {[
                { step: "1", title: "First Installment", pct: "25%", when: "Pay in July", desc: "Initial commitment payment to reserve your plot allocation." },
                { step: "2", title: "Second Installment", pct: "25%", when: "After 6 Months", desc: "Second payment installment scheduled 6 months after the first." },
                { step: "3", title: "Third Installment", pct: "25%", when: "After Next 6 Months", desc: "Third installment scheduled 6 months after the second." },
                { step: "4", title: "Final Installment", pct: "25%", when: "On Registry / Registry Date", desc: "Remaining balance paid upon final registry and physical handover." }
              ].map((timeline, idx) => (
                <div key={idx} className="relative z-10 bg-brand-bg-card p-6 rounded-2xl border border-brand-border flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    {timeline.step}
                  </div>
                  <div>
                    <div className="badge-emerald font-extrabold text-[10px] mb-1">{timeline.pct} PAYMENT</div>
                    <h4 className="text-base font-extrabold text-brand-navy mt-1">{timeline.title}</h4>
                    <span className="text-xs text-brand-blue font-bold block mt-1">{timeline.when}</span>
                  </div>
                  <p className="text-xs text-brand-slate leading-relaxed m-0 font-semibold">{timeline.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY & VALUE RETENTION */}
        <section className="py-16 bg-brand-bg border-t border-brand-border">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left text column */}
              <div className="text-left space-y-6">
                <span className="badge-blue">Gated Township Infrastructure</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy leading-tight">
                  A Safe Gated Community With High Appreciation Potential
                </h2>
                <p className="text-sm text-brand-slate leading-relaxed font-semibold">
                  This project combines modern engineering with absolute safety parameters to establish a growth-oriented community assets system.
                </p>

                <div className="space-y-4">
                  {[
                    { title: "Well-Planned Infrastructure", desc: "Equipped with wide internal roads, strategic street lights, optimized drainage, and reliable water supply." },
                    { title: "Green & Sustainable Living", desc: "Featuring landscaped public parks, tree-lined walking pathways, and a pollution-free eco-environment." },
                    { title: "Gated Security Protection", desc: "24/7 security layout with controlled gate access barriers and active surveillance protocols." },
                    { title: "High Appreciation Corridor", desc: "Located in a fast-developing regional growth corridor with a strong historical value trend." }
                  ].map((inf, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-emerald-bg text-brand-emerald flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-brand-navy m-0">{inf.title}</h5>
                        <p className="text-xs text-brand-slate mt-1 mb-0 leading-relaxed font-semibold">{inf.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right QR and Brochure Callout */}
              <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-brand text-center space-y-6 flex flex-col justify-center items-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue-bg flex items-center justify-center text-brand-blue">
                  <Download size={32} />
                </div>
                
                <h3 className="text-xl font-extrabold text-brand-navy m-0">
                  Ready to Take the Next Step?
                </h3>
                
                <p className="text-xs text-brand-slate max-w-sm leading-relaxed font-semibold">
                  Download the official project brochure and pricing PDF directly. Access the physical site map layout and official documents.
                </p>

                <button 
                  onClick={() => openInquiryModal("Brochure Section")}
                  className="btn-primary w-full max-w-xs py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Download Brochure PDF
                </button>

                <div className="text-[10px] text-brand-slate-light font-bold">
                  File Size: ~223 KB • PDF Format
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Floating CTA for WhatsApp Leads */}
      <div className="fixed bottom-6 left-6 z-50 select-none pointer-events-auto">
        <button
          onClick={handleQuickWhatsApp}
          className="flex items-center gap-2 bg-[#25D366] text-white py-3 px-5 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.35)] hover:bg-[#20ba56] hover:scale-[1.03] transition-all duration-300 font-extrabold text-sm"
          aria-label="Contact via WhatsApp"
        >
          <Phone size={16} fill="white" />
          <span>Vrindavan Inquiry</span>
        </button>
      </div>

      {/* Inquiry Dialog Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Modal Backdrop Click handler to close */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-white text-brand-navy p-6 md:p-8 rounded-3xl border border-brand-border shadow-2xl z-10 flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-brand-slate hover:text-brand-navy cursor-pointer bg-brand-bg-alt hover:bg-brand-border p-1.5 rounded-full transition-colors duration-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-blue-bg text-brand-blue border border-brand-blue/10 flex items-center justify-center mx-auto mb-2">
                  <Download size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-brand-navy m-0">
                  {modalTrigger.includes("Brochure") ? "Download Brochure" : "Request Consultation"}
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-semibold">
                  {modalTrigger.includes("Brochure") 
                    ? "Enter your details below to download the brochure PDF and connect with us on WhatsApp." 
                    : "Please fill out this form to connect with our advisor desk on WhatsApp."}
                </p>
              </div>

              {isSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-brand-emerald-bg text-brand-emerald border border-brand-emerald/10 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-brand-navy m-0">Inquiry Saved!</h4>
                    <p className="text-xs text-brand-slate mt-1 leading-relaxed font-semibold">
                      Redirecting to WhatsApp and downloading brochure...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => handleLeadSubmit(e, true, modalTrigger)} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-brand-red-bg border border-brand-red-border text-brand-red text-xs rounded-xl font-medium animate-in slide-in-from-top-1">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="modal-name" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input 
                      id="modal-name"
                      type="text" 
                      required 
                      placeholder="Enter your name"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-phone" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input 
                      id="modal-phone"
                      type="tel" 
                      required 
                      placeholder="Enter your phone number"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-city" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                      Your City
                    </label>
                    <input 
                      id="modal-city"
                      type="text" 
                      required 
                      placeholder="Enter your city"
                      value={leadCity}
                      onChange={(e) => setLeadCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5 shadow-brand-blue"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {modalTrigger.includes("Brochure") ? "Download & Chat" : "Submit Inquiry"} <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
