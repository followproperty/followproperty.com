"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home as HomeIcon, ArrowRight, Search } from "lucide-react";

const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.75, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Counter({ target, suffix = "", decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / 55;
    const t = setInterval(() => {
      v += step;
      if (v >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(v);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  
  return (
    <span ref={ref}>
      {decimals ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
}

export default function Hero({ authState }) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const opacity = useTransform(scrollY, [0, 380], [1, 0]);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Video Background (Royalty-free for commercial use, self-hosted) */}
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source 
            src="/hero-bg-skyline.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Video Overlay Blend */}
        <div className="absolute inset-0 bg-linear-to-b from-brand-bg/10 via-brand-bg/40 to-brand-bg" />

        {/* Radial glows and mesh grid */}
        <div className="absolute -top-[8%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-[radial-gradient(ellipse,rgba(50,95,236,0.06)_0%,transparent_60%)]" />
        <div className="absolute top-[20%] -right-[8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(81,143,255,0.04)_0%,transparent_65%)]" />
        <div className="absolute top-[30%] -left-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(13,148,136,0.03)_0%,transparent_65%)]" />
        <div 
          className="absolute inset-0 opacity-40" 
          style={{ 
            backgroundImage: "radial-gradient(var(--color-brand-border) 1.2px, transparent 1.2px)", 
            backgroundSize: "28px 28px" 
          }} 
        />
      </div>

      <div className="relative z-10 mt-[68px]">
        {/* <Ticker /> */}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="flex-1 flex items-center justify-center text-center px-6 pt-[64px] pb-[52px] relative z-10"
      >
        <div className="max-w-[860px] w-full">
          <motion.div variants={blurIn} custom={0} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-border bg-brand-bg-card mb-7 shadow-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block animate-pulse-custom" />
              <span className="text-[11px] text-brand-navy tracking-[0.1em] uppercase font-bold">
                Live Market Intelligence
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={blurIn}
            custom={1}
            initial="hidden"
            animate="visible"
            className="text-[clamp(28px,6.5vw,76px)] font-extrabold tracking-tight leading-[1.05] sm:leading-[0.95] text-brand-navy-deep mb-0"
          >
            <span className="block">Track Real Estate</span>
            <span className="block mt-2 bg-linear-to-r from-brand-navy-deep via-brand-blue-deep to-brand-blue bg-clip-text text-transparent">
              Like a Portfolio
            </span>
          </motion.h1>

          <motion.p
            variants={blurIn}
            custom={2}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-[18px] text-brand-slate leading-relaxed max-w-[540px] mx-auto mt-[22px] mb-[36px] px-2 sm:px-0"
          >
            Appreciation tracking, rental yield analytics, builder fraud alerts,
            and 4-source market intelligence — built for serious Indian property
            investors.
          </motion.p>

          <motion.div
            variants={blurIn}
            custom={3}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-[52px] max-w-sm mx-auto sm:max-w-none px-4 sm:px-0"
          >
            <button
              onClick={() => router.push("/portfolio")}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-linear-to-r from-brand-navy-deep to-brand-navy-mid text-white font-bold text-[14px] sm:text-[15px] py-3.5 px-5 sm:px-7 rounded-[14px] border border-white/5 cursor-pointer shadow-brand-md transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_12px_36px_rgba(50,95,236,0.14)]"
            >
              <HomeIcon size={17} /> {authState?.isAuthenticated && authState?.hasPortfolio ? "Open Portfolio" : "Start Tracking Portfolio"} <ArrowRight size={15} />
            </button>
 
            <button
              onClick={() => router.push("/watchlist")}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-brand-bg-card text-brand-navy font-semibold text-[14px] sm:text-[15px] py-3.5 px-5 sm:px-7 rounded-[14px] border border-brand-border cursor-pointer shadow-brand transition-all duration-250 hover:-translate-y-0.5 hover:shadow-brand-md hover:border-brand-blue-border hover:bg-brand-bg-alt"
            >
              <Search size={17} /> {authState?.isAuthenticated && authState?.hasWatchlist ? "Open Watchlist" : "Looking to Buy"}
            </button>
          </motion.div>

          {/* <motion.div
            variants={blurIn}
            custom={3.5}
            initial="hidden"
            animate="visible"
            className="mt-[-32px] mb-[52px] text-[13.5px] text-brand-slate font-medium"
          >
            Are you a developer?{" "}
            <Link
              href="/signup?role=builder"
              className="font-bold text-brand-blue hover:text-brand-blue-deep transition-colors no-underline hover:underline inline-flex items-center gap-0.5"
            >
              Register as Builder &rarr;
            </Link>
          </motion.div> */}

          <motion.div
            variants={blurIn}
            custom={4}
            initial="hidden"
            animate="visible"
            className="flex justify-center gap-[clamp(12px,5vw,60px)] flex-wrap"
          >
            {[
              { value: 62, suffix: "+", label: "Data Points" },
              { value: 40, suffix: "+", label: "Property Types" },
              { value: 12, suffix: "", label: "Indian Cities" },
              { value: 4, suffix: " Sources", label: "Valuation Engine" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[clamp(22px,3vw,30px)] font-bold text-brand-navy tracking-tight">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[12px] font-medium text-brand-slate mt-1 tracking-[0.08em] uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-linear-to-t from-brand-bg to-transparent z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-[34px] rounded-full border-[1.5px] border-brand-border-mid flex justify-center pt-1.5"
        >
          <div className="w-[3px] h-2 rounded-full bg-brand-slate-light" />
        </motion.div>
      </motion.div>
    </div>
  );
}
