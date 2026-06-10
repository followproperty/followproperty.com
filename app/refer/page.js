"use client";

import { useState } from "react";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export default function ReferPage() {
  const [referrerName, setReferrerName] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [referrals, setReferrals] = useState([{ name: "", phone: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAddReferral = () => {
    setReferrals([...referrals, { name: "", phone: "" }]);
  };

  const handleRemoveReferral = (index) => {
    const updated = referrals.filter((_, idx) => idx !== index);
    setReferrals(updated);
  };

  const handleReferralChange = (index, field, value) => {
    const updated = referrals.map((r, idx) => {
      if (idx === index) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setReferrals(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName,
          referrerPhone,
          referrals,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccess(true);
      setReferrerName("");
      setReferrerPhone("");
      setReferrals([{ name: "", phone: "" }]);
    } catch (err) {
      setError(err.message || "Failed to submit referral. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0b0907] text-[#f7f5f1] font-sans antialiased selection:bg-[#fd793359] selection:text-[#f7f5f1] ${instrumentSerif.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --radius: .875rem;
          --background: #0b0907;
          --foreground: #f7f5f1;
          --card: #110f0d;
          --card-foreground: #f7f5f1;
          --popover: #110f0d;
          --popover-foreground: #f7f5f1;
          --primary: #fd7933;
          --primary-foreground: #0b0907;
          --ember: #f5642b;
          --gold: #e5bf6d;
          --secondary: #1d1a18;
          --secondary-foreground: #f7f5f1;
          --muted: #1d1a18;
          --muted-foreground: #9c9792;
          --accent: #fd7933;
          --accent-foreground: #0b0907;
          --destructive: #f94144;
          --destructive-foreground: #f8f8f8;
          --border: rgba(255, 255, 255, 0.08);
          --input: rgba(255, 255, 255, 0.1);
          --ring: #fd7933;
          --gradient-hero: radial-gradient(ellipse at 70% 30%, rgba(253, 121, 51, 0.25), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(172, 84, 63, 0.18), transparent 55%), linear-gradient(180deg, #0b0907, #040302);
          --gradient-gold: linear-gradient(135deg, #e5bf6d, #fd7933);
          --gradient-ember: linear-gradient(135deg, #fd7933, #c53829);
          --shadow-glow: 0 0 120px -20px rgba(253, 121, 51, 0.55);
          --shadow-soft: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
          --shadow-card: 0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 30px 60px -30px rgba(0, 0, 0, 0.7);
          --ease-luxury: cubic-bezier(.22,1,.36,1);
        }

        .hero-bg {
          background: var(--gradient-hero);
        }

        .glass {
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          backdrop-filter: blur(20px) saturate(140%);
          background: linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015));
          border: 1px solid var(--border);
        }

        .ember-text {
          background: var(--gradient-ember);
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .gold-text {
          background: var(--gradient-gold);
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .hairline {
          background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
          height: 1px;
        }

        .shadow-glow {
          box-shadow: var(--shadow-glow);
        }

        .shadow-card {
          box-shadow: var(--shadow-card);
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-18px) rotate(-2deg); }
        }

        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: .85; transform: scale(1.05); }
        }

        .animate-float-slow {
          animation: float-slow 7s var(--ease-luxury) infinite;
        }

        .animate-fade-up {
          animation: fade-up 0.9s var(--ease-luxury) both;
        }

        .animate-pulse-glow {
          animation: pulse-glow 6s ease-in-out infinite;
        }

        .font-display {
          font-family: var(--font-instrument-serif), serif;
          letter-spacing: -0.01em;
        }
      ` }} />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-4">
          <div className="glass rounded-full flex items-center justify-between px-4 sm:px-6 py-2.5">
            <a href="/" className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#fd7933] shadow-glow"></span>
              <span className="text-sm font-medium tracking-wide">FollowProperty</span>
            </a>
            <a href="#refer" className="text-xs sm:text-sm px-4 py-2 rounded-full bg-[#f7f5f1] text-[#0b0907] font-medium hover:opacity-90 transition">
              Refer Now
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="top" className="relative min-h-screen overflow-x-hidden text-[#f7f5f1]">
        <section className="relative hero-bg pt-32 sm:pt-36 pb-20 lg:pb-32 overflow-hidden">
          {/* Subtle background grid overlay */}
          <div 
            aria-hidden="true" 
            className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none" 
            style={{
              backgroundImage: 'url("/images/refer/bptp-downtown.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              WebkitMaskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
              maskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)'
            }}
          />

          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative">
            {/* Phone Visual Column */}
            <div className="lg:col-span-6 lg:order-2 order-1 flex justify-center">
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 m-auto size-[80%] rounded-full blur-3xl bg-[#fd7933]/40 animate-pulse-glow"></div>
                
                <div className="relative animate-float-slow will-change-transform" style={{ perspective: '1200px' }}>
                  <Image 
                    src="/images/refer/iphone-orange.png" 
                    alt="iPhone Pro Cosmic Orange" 
                    width={1024} 
                    height={1024}
                    priority
                    className="relative w-[78vw] max-w-[460px] lg:max-w-[560px] drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
                  />
                </div>

                <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-[60%] h-24 rounded-[50%] bg-[#fd7933]/20 blur-2xl"></div>
              </div>
            </div>

            {/* Copy Column */}
            <div className="lg:col-span-6 lg:order-1 order-2 text-center lg:text-left">
              <p className="animate-fade-up text-xs uppercase tracking-[0.3em] text-[#9c9792] mb-6">
                <span className="gold-text font-semibold">BPTP Downtown</span> · Gurgaon
              </p>
              <h1 className="animate-fade-up font-display text-balance text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl xl:text-[5.5rem] [animation-delay:150ms]">
                Refer a Buyer.<br />Win an <em className="not-italic ember-text">iPhone Pro.</em>
              </h1>
              <p className="animate-fade-up mt-7 text-base sm:text-lg text-[#9c9792] max-w-xl mx-auto lg:mx-0 text-pretty [animation-delay:300ms]">
                Know someone planning to buy a luxury residence at BPTP Downtown, Gurgaon? Refer them today. If they purchase a residence worth <span className="text-[#f7f5f1] font-medium">₹6 Crore or more</span>, you'll receive a brand-new <span className="text-[#f7f5f1] font-medium">iPhone Pro Cosmic Orange</span>.
              </p>
              
              <div className="animate-fade-up mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start [animation-delay:450ms]">
                <a 
                  href="#refer" 
                  className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 bg-[#fd7933] text-[#0b0907] font-medium shadow-glow hover:translate-y-[-1px] transition"
                  style={{ background: 'var(--gradient-ember)' }}
                >
                  Refer Someone Now
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
                <a 
                  href="tel:+918796508866" 
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 glass text-[#f7f5f1] hover:bg-white/5 transition"
                >
                  <span className="opacity-70">Call</span> +91 87965 08866
                </a>
              </div>

              {/* Specs Grid */}
              <div className="animate-fade-up mt-10 flex items-center gap-6 justify-center lg:justify-start text-xs text-[#9c9792] [animation-delay:600ms]">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#9c9792]/70">Reward</div>
                  <div className="text-sm text-[#f7f5f1] font-medium mt-1">iPhone Pro</div>
                </div>
                <span className="h-8 w-px bg-[#ffffff14]"></span>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#9c9792]/70">Threshold</div>
                  <div className="text-sm text-[#f7f5f1] font-medium mt-1">₹6 Cr+</div>
                </div>
                <span className="h-8 w-px bg-[#ffffff14]"></span>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#9c9792]/70">Project</div>
                  <div className="text-sm text-[#f7f5f1] font-medium mt-1">BPTP Downtown</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="relative py-24 lg:py-36 overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#9c9792] mb-5">
              <span className="inline-block size-1.5 rounded-full bg-[#fd7933] mr-3 align-middle"></span>
              The Process
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-balance max-w-3xl">How It Works</h2>
            <p className="mt-5 text-[#9c9792] max-w-xl">Four quiet steps between a thoughtful introduction and a new iPhone Pro.</p>

            <div className="relative mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Desktop connecting line */}
              <div aria-hidden="true" className="hidden lg:block absolute top-[58px] left-[8%] right-[8%] hairline"></div>

              <article className="glass rounded-3xl p-7 relative group hover:bg-white/[0.04] transition">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-full glass flex items-center justify-center text-sm font-medium text-[#fd7933]">01</div>
                  <div className="size-2 rounded-full bg-[#fd7933]/50 group-hover:bg-[#fd7933] transition"></div>
                </div>
                <h3 className="mt-8 text-lg font-medium text-balance">Submit Referral</h3>
                <p className="mt-2 text-sm text-[#9c9792] text-pretty">Share your details and your buyer's contact.</p>
              </article>

              <article className="glass rounded-3xl p-7 relative group hover:bg-white/[0.04] transition">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-full glass flex items-center justify-center text-sm font-medium text-[#fd7933]">02</div>
                  <div className="size-2 rounded-full bg-[#fd7933]/50 group-hover:bg-[#fd7933] transition"></div>
                </div>
                <h3 className="mt-8 text-lg font-medium text-balance">We Contact Buyer</h3>
                <p className="mt-2 text-sm text-[#9c9792] text-pretty">Our team reaches out with curated options.</p>
              </article>

              <article className="glass rounded-3xl p-7 relative group hover:bg-white/[0.04] transition">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-full glass flex items-center justify-center text-sm font-medium text-[#fd7933]">03</div>
                  <div className="size-2 rounded-full bg-[#fd7933]/50 group-hover:bg-[#fd7933] transition"></div>
                </div>
                <h3 className="mt-8 text-lg font-medium text-balance">Property Purchased</h3>
                <p className="mt-2 text-sm text-[#9c9792] text-pretty">They close a residence worth ₹6 Cr+.</p>
              </article>

              <article className="glass rounded-3xl p-7 relative group hover:bg-white/[0.04] transition">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-full glass flex items-center justify-center text-sm font-medium text-[#fd7933]">04</div>
                  <div className="size-2 rounded-full bg-[#fd7933]/50 group-hover:bg-[#fd7933] transition"></div>
                </div>
                <h3 className="mt-8 text-lg font-medium text-balance">Receive iPhone Pro</h3>
                <p className="mt-2 text-sm text-[#9c9792] text-pretty">Delivered to your door, Cosmic Orange.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Detailed Reward Focus Section */}
        <section className="relative py-28 lg:py-40 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(253, 121, 51, 0.22), transparent 60%)' }}></div>
          
          <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#9c9792] mb-5">
              <span className="inline-block size-1.5 rounded-full bg-[#fd7933] mr-3 align-middle"></span>
              The Reward
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-balance max-w-4xl mx-auto">
              Win an <span className="ember-text">iPhone Pro</span><br className="hidden sm:block" />
              <span className="text-[#9c9792] italic">Cosmic Orange.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-[#9c9792] text-pretty">
              For every successful referral that results in a qualifying purchase at BPTP Downtown worth <span className="text-[#f7f5f1]">₹6 Crore or more</span>.
            </p>

            <div className="relative mt-16 mx-auto max-w-3xl">
              <div aria-hidden="true" className="absolute inset-0 m-auto size-[70%] rounded-full blur-3xl bg-[#fd7933]/40 animate-pulse-glow"></div>
              <Image 
                src="/images/refer/iphone-orange.png" 
                alt="iPhone Pro Cosmic Orange reward" 
                width={1024} 
                height={1024} 
                className="relative w-full drop-shadow-[0_50px_80px_rgba(0,0,0,0.7)]"
              />
            </div>
          </div>
        </section>

        {/* The Address Section */}
        <section className="relative py-24 lg:py-36 overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Image with overlay */}
            <div className="lg:col-span-6 reveal in">
              <div className="relative rounded-3xl overflow-hidden shadow-card aspect-[4/5]">
                <Image 
                  src="/images/refer/bptp-downtown.jpg" 
                  alt="BPTP Downtown luxury tower at twilight" 
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0907]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#9c9792]">BPTP Downtown</p>
                  <p className="font-display text-2xl mt-1">Sector 65, Gurgaon</p>
                </div>
              </div>
            </div>

            {/* Right Column: Copy and Grid */}
            <div className="lg:col-span-6">
              <p className="reveal text-[11px] uppercase tracking-[0.35em] text-[#9c9792] mb-5 in">
                <span className="inline-block size-1.5 rounded-full bg-[#fd7933] mr-3 align-middle"></span>
                The Address
              </p>
              <h2 className="reveal font-display text-4xl sm:text-5xl lg:text-6xl text-balance in">
                A residence written in <span className="gold-text">quiet luxury.</span>
              </h2>
              <p className="reveal mt-5 text-[#9c9792] max-w-xl text-pretty in">
                BPTP Downtown is a defining luxury address — designed for those who appreciate craft, calm, and the art of living well.
              </p>
              <dl className="reveal mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-7 in">
                <div className="border-t border-[#ffffff14] pt-5">
                  <dt className="text-base font-medium text-[#f7f5f1]">Luxury Living</dt>
                  <dd className="mt-1.5 text-sm text-[#9c9792]">Residences crafted for those who measure life in detail.</dd>
                </div>
                <div className="border-t border-[#ffffff14] pt-5">
                  <dt className="text-base font-medium text-[#f7f5f1]">World-Class Amenities</dt>
                  <dd className="mt-1.5 text-sm text-[#9c9792]">Spa, sky lounges, concierge, fine dining — within reach.</dd>
                </div>
                <div className="border-t border-[#ffffff14] pt-5">
                  <dt className="text-base font-medium text-[#f7f5f1]">Prime Gurgaon Location</dt>
                  <dd className="mt-1.5 text-sm text-[#9c9792]">A defining address in the city's most coveted district.</dd>
                </div>
                <div className="border-t border-[#ffffff14] pt-5">
                  <dt className="text-base font-medium text-[#f7f5f1]">Premium Lifestyle</dt>
                  <dd className="mt-1.5 text-sm text-[#9c9792]">Curated experiences that redefine modern Indian luxury.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Submission Form Section */}
        <section id="refer" className="relative py-24 lg:py-36 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 -z-10" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(253, 121, 51, 0.18), transparent 60%)' }}></div>
          
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-center">
              <p className="reveal text-[11px] uppercase tracking-[0.35em] text-[#9c9792] mb-5 in">
                <span className="inline-block size-1.5 rounded-full bg-[#fd7933] mr-3 align-middle"></span>
                Refer Now
              </p>
              <h2 className="reveal font-display text-4xl sm:text-5xl lg:text-6xl text-balance in">Submit Your Referral</h2>
              <p className="reveal mt-4 text-[#9c9792] max-w-lg mx-auto in">Fill in your details and refer potential buyers. We'll handle the rest with discretion.</p>
            </div>

            <div className="reveal relative mt-12 in">
              <div aria-hidden="true" className="absolute -inset-px rounded-[28px] opacity-60" style={{ background: 'linear-gradient(135deg, rgba(253, 121, 51, 0.4), transparent 60%)' }}></div>
              
              <div className="relative glass rounded-[28px] p-6 sm:p-10 shadow-card">
                {success ? (
                  <div className="text-center py-12 animate-fade-up">
                    <div className="size-16 rounded-full bg-[#fd7933]/20 text-[#fd7933] flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-medium text-[#f7f5f1] mb-2">Referral Submitted!</h4>
                    <p className="text-sm text-[#9c9792] max-w-md mx-auto mb-8">
                      Thank you for referring your contact. Our luxury residential experts will reach out to them shortly.
                    </p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
                    >
                      Refer Someone Else
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    {error && (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl">
                        {error}
                      </div>
                    )}

                    {/* Referrer Section */}
                    <fieldset className="border-none p-0 m-0">
                      <legend className="text-xs uppercase tracking-[0.25em] text-white mb-4 font-semibold">Referrer Information</legend>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">Your Name</span>
                          <input 
                            type="text" 
                            placeholder="Full name" 
                            required 
                            value={referrerName}
                            onChange={(e) => setReferrerName(e.target.value)}
                            className="mt-2 w-full bg-transparent border-b border-white/30 hover:border-white/50 focus:border-[#fd7933] outline-none py-3 text-base text-white placeholder:text-white/30 transition-all"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">Your Phone Number</span>
                          <input 
                            type="tel" 
                            placeholder="+91 …" 
                            required 
                            value={referrerPhone}
                            onChange={(e) => setReferrerPhone(e.target.value)}
                            className="mt-2 w-full bg-transparent border-b border-white/30 hover:border-white/50 focus:border-[#fd7933] outline-none py-3 text-base text-white placeholder:text-white/30 transition-all"
                          />
                        </label>
                      </div>
                    </fieldset>

                    {/* Referrals Section */}
                    <div className="space-y-5">
                      {referrals.map((referral, index) => (
                        <div key={index} className="animate-fade-up">
                          <fieldset className="border-none p-0 m-0">
                            <div className="flex items-center justify-between mb-4">
                              <legend className="text-xs uppercase tracking-[0.25em] text-white font-semibold">
                                Referral Contact {index + 1}
                              </legend>
                              {referrals.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveReferral(index)}
                                  className="text-xs text-red-400 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                              <label className="block">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">Person's Name</span>
                                <input 
                                  type="text" 
                                  placeholder="Full name" 
                                  required 
                                  value={referral.name}
                                  onChange={(e) => handleReferralChange(index, "name", e.target.value)}
                                  className="mt-2 w-full bg-transparent border-b border-white/30 hover:border-white/50 focus:border-[#fd7933] outline-none py-3 text-base text-white placeholder:text-white/30 transition-all"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">Person's Phone Number</span>
                                <input 
                                  type="tel" 
                                  placeholder="+91 …" 
                                  required 
                                  value={referral.phone}
                                  onChange={(e) => handleReferralChange(index, "phone", e.target.value)}
                                  className="mt-2 w-full bg-transparent border-b border-white/30 hover:border-white/50 focus:border-[#fd7933] outline-none py-3 text-base text-white placeholder:text-white/30 transition-all"
                                />
                              </label>
                            </div>
                          </fieldset>
                        </div>
                      ))}

                      <button 
                        type="button" 
                        onClick={handleAddReferral}
                        className="w-full rounded-2xl border border-dashed border-white/20 py-4 text-sm text-white/70 hover:text-white hover:border-white/40 transition"
                      >
                        + Add More Referral
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-full py-5 text-base font-medium text-[#0b0907] shadow-glow transition disabled:opacity-50" 
                      style={{ background: 'var(--gradient-ember)' }}
                    >
                      <span className="inline-flex items-center gap-3 transition">
                        {loading ? "Submitting..." : "Submit Referral"}
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </button>

                    <p className="text-center text-[11px] text-[#9c9792]/80">
                      By submitting, you agree to be contacted by FollowProperty regarding this referral.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Bar */}
        <section className="relative py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="glass rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-[#9c9792]">Questions?</p>
                <p className="mt-3 font-display text-3xl sm:text-4xl">Talk to our team.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="tel:+918796508866" 
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 bg-[#f7f5f1] text-[#0b0907] font-medium hover:opacity-90 transition"
                >
                  Call +91 87965 08866
                </a>
                <a 
                  href="https://wa.me/918796508866?text=Hi%2C%20I%27d%20like%20to%20refer%20a%20buyer%20for%20BPTP%20Downtown." 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 glass hover:bg-white/5 transition"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#ffffff14] mt-10 pb-28 sm:pb-10">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 grid sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#fd7933]"></span>
                <span className="font-medium">FollowProperty</span>
              </div>
              <p className="mt-4 text-sm text-[#9c9792] max-w-xs">Curating India's most defining luxury residences.</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#9c9792]">Campaign</p>
              <p className="mt-3 text-sm">BPTP Downtown Referral Program</p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-[#9c9792]">Contact</p>
              <a href="tel:+918796508866" className="mt-3 block text-sm hover:text-[#fd7933] transition">+91 87965 08866</a>
            </div>
          </div>

          <div className="border-t border-[#ffffff14]">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 text-xs text-[#9c9792] flex flex-col sm:flex-row justify-between gap-2">
              <p>© 2026 FollowProperty. All rights reserved.</p>
              <p>Reward subject to successful purchase of ₹6 Cr+ at BPTP Downtown.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Bottom Bar for Mobile */}
      <div className="fixed bottom-4 inset-x-0 z-40 px-5 md:hidden">
        <div className="glass rounded-full flex items-center gap-3 p-2 shadow-soft">
          <a 
            href="#refer" 
            className="flex-1 py-3 px-6 rounded-full text-white font-bold text-center text-sm shadow-glow transition hover:opacity-95"
            style={{ background: 'var(--gradient-ember)' }}
          >
            Refer Now
          </a>
          <a 
            href="tel:+918796508866" 
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md transition hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#f5642b]">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.18.282-.108.43a13.54 13.54 0 0 0 5.606 5.606c.148.072.33.027.43-.108l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
