"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Search, 
  LayoutDashboard, 
  Building2, 
  ListPlus, 
  ShieldAlert, 
  TrendingUp, 
  ChevronRight,
  CheckCircle2,
  MapPin,
  FolderOpen,
  Plus,
  Info,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.75, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const keywords = ["properties.", "watchlists.", "investments."];

export default function Hero({ authState }) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 160]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const tabsList = ["overview", "portfolio", "watchlist", "projects", "rera", "rates"];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let timer;
    const currentWord = keywords[index];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
      }, 55);
    } else {
      timer = setTimeout(() => {
        setDisplayedText((prev) => currentWord.slice(0, prev.length + 1));
      }, 110);
    }

    if (!isDeleting && displayedText === currentWord) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % keywords.length);
      clearTimeout(timer);
      timer = setTimeout(() => {}, 250);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, index]);

  useEffect(() => {
    if (!isAutoPlayActive) return;

    const interval = setInterval(() => {
      setDashboardTab((prev) => {
        const nextIdx = (tabsList.indexOf(prev) + 1) % tabsList.length;
        return tabsList[nextIdx];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlayActive]);

  const handleTabClick = (tabId) => {
    setDashboardTab(tabId);
    setIsAutoPlayActive(false);
  };

  const handleBrowseProjects = (e) => {
    e.preventDefault();
    const target = document.getElementById("featured-developments");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/projects");
    }
  };

  const getTabUrl = () => {
    switch (dashboardTab) {
      case "overview":
        return "followproperty.com/dashboard";
      case "portfolio":
        return "followproperty.com/dashboard/portfolio";
      case "watchlist":
        return "followproperty.com/dashboard/watchlist";
      case "projects":
        return "followproperty.com/dashboard/projects";
      case "rera":
        return "followproperty.com/dashboard/rera-timeline";
      case "rates":
        return "followproperty.com/dashboard/circle-rates";
      default:
        return "followproperty.com/dashboard";
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Premium Indian Real Estate Towers Background with increased opacity (0.38) and slight blur (2px) */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ filter: "blur(2.5px)" }}
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
        >
          <Image 
            src="/images/hero-bg.png" 
            alt="Premium Indian Real Estate Towers"
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
            className="opacity-[0.38] select-none pointer-events-none"
          />
        </motion.div>

        {/* Video Overlay Blend */}
        <div className="absolute inset-0 bg-linear-to-b from-brand-bg/10 via-brand-bg/60 to-brand-bg" />

        {/* Radial glows and mesh grid */}
        <div className="absolute -top-[8%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-[radial-gradient(ellipse,rgba(50,95,236,0.05)_0%,transparent_60%)]" />
        <div className="absolute top-[25%] -right-[8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(81,143,255,0.03)_0%,transparent_65%)]" />
        <div className="absolute top-[35%] -left-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(13,148,136,0.02)_0%,transparent_65%)]" />
        <div 
          className="absolute inset-0 opacity-[0.25]" 
          style={{ 
            backgroundImage: "radial-gradient(var(--color-brand-border) 1.2px, transparent 1.2px)", 
            backgroundSize: "28px 28px" 
          }} 
        />
      </div>

      <motion.div
        style={isMobile ? {} : { y, opacity }}
        className="flex-1 flex items-center justify-center px-8 lg:px-16 pt-[120px] pb-[96px] lg:py-0 relative z-10"
      >
        <div className="max-w-[1320px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center text-center lg:text-left">
          
          {/* Left Column (Balanced column split) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-center lg:items-start">
            <motion.div variants={blurIn} custom={0} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-border bg-brand-bg-card mb-5 shadow-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block animate-pulse-custom" />
                <span className="text-[11px] text-brand-navy tracking-[0.14em] uppercase font-bold">
                  Interactive Live Workspace
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={blurIn}
              custom={1}
              initial="hidden"
              animate="visible"
              className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight leading-[1.15] text-brand-navy-deep mb-0 max-w-[500px]"
            >
              A single workspace for your{" "}
              <span className="inline-block bg-linear-to-r from-brand-blue-deep to-brand-blue bg-clip-text text-transparent font-black">
                {displayedText || "\u200b"}
              </span>
              <span className="inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-brand-blue ml-1.5 shrink-0 cursor-typing-blink align-middle" />
            </motion.h1>

            <div className="relative max-w-[500px] mt-3.5 mb-7 py-1">
              <motion.p
                variants={blurIn}
                custom={2}
                initial="hidden"
                animate="visible"
                className="text-sm sm:text-base text-brand-navy-mid leading-relaxed m-0 font-semibold"
              >
                Follow valuations, builder compliance, and official rates in one dashboard.
              </motion.p>
            </div>

            <motion.div
              variants={blurIn}
              custom={3}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-3.5 w-auto"
            >
              <button
                onClick={() => {
                  if (!authState?.isAuthenticated) {
                    router.push("/signup");
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="w-auto flex items-center justify-center gap-2 bg-linear-to-r from-brand-navy-deep to-brand-navy-mid text-white font-bold text-[14px] py-3 px-5.5 rounded-[12px] border border-white/5 cursor-pointer shadow-brand-md transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_12px_36px_rgba(50,95,236,0.14)] whitespace-nowrap"
              >
                <LayoutDashboard size={16} /> {authState?.isAuthenticated ? "Open Dashboard" : "Create Free Account"} <ArrowRight size={14} />
              </button>
   
              <button
                onClick={handleBrowseProjects}
                className="w-auto flex items-center justify-center gap-2 bg-brand-bg-card text-brand-navy font-semibold text-[14px] py-3 px-5.5 rounded-[12px] border border-brand-border cursor-pointer shadow-brand transition-all duration-250 hover:-translate-y-0.5 hover:shadow-brand-md hover:border-brand-blue-border hover:bg-brand-bg-alt whitespace-nowrap"
              >
                <Search size={16} /> Browse Monitored Projects
              </button>
            </motion.div>

            {/* Micro Trust Reassurance line */}
            <motion.div
              variants={blurIn}
              custom={3.2}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 text-[11px] font-bold text-brand-slate-light select-none"
            >
              <span>• Free account</span>
              <span>• Start tracking in minutes</span>
            </motion.div>
          </div>

          {/* Right Column (Balanced column split) */}
          <div className="col-span-1 lg:col-span-7 flex justify-center lg:justify-end w-full">
            {/* Premium CSS-based Product Dashboard Mockup */}
            <motion.div
              variants={blurIn}
              custom={3.5}
              initial="hidden"
              animate="visible"
              className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-brand-border-mid shadow-brand-lg overflow-hidden flex flex-col select-none text-left transform lg:translate-y-2 lg:-mb-2 relative z-20"
            >
              {/* Browser Header controls */}
              <div className="bg-[#F4F3EF] px-4 py-3 border-b border-brand-border-mid flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                </div>
                <div className="flex-1 max-w-[420px] bg-white/90 border border-brand-border text-[11px] font-semibold text-brand-slate py-1 px-3.5 rounded-lg flex items-center justify-between shadow-inner">
                  <span className="truncate text-[10.5px] font-mono tracking-tight text-brand-navy-mid select-all">{getTabUrl()}</span>
                  <span className="text-brand-emerald text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shrink-0 ml-2">
                    <span className="w-1 h-1 rounded-full bg-brand-emerald inline-block" /> Active
                  </span>
                </div>
              </div>

              {/* Browser Workspace Content */}
              <div className="flex flex-1 h-[410px] relative overflow-hidden">
                {/* Clickable Sidebar Workspace Selector (only visible above md) */}
                <div className="w-[180px] bg-[#F4F3EF]/60 border-r border-brand-border p-4 hidden md:flex flex-col gap-5 shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/favicon.svg" alt="FollowProperty" className="w-5 h-5 object-contain" />
                    <span className="font-bold text-[12px] text-brand-navy">FollowProperty</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
                      { id: "portfolio", label: "Portfolio", icon: Building2 },
                      { id: "watchlist", label: "Watchlist", icon: ListPlus },
                      { id: "projects", label: "Projects", icon: FolderOpen },
                      { id: "rera", label: "RERA Registry", icon: ShieldAlert },
                      { id: "rates", label: "Circle Rates", icon: TrendingUp },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = dashboardTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full flex items-center gap-2 text-[11px] font-extrabold py-1.5 px-2 rounded-lg border transition-all text-left cursor-pointer ${
                            isActive 
                              ? "text-brand-blue bg-white border-brand-blue-border/30 shadow-xs" 
                              : "text-brand-slate hover:text-brand-navy border-transparent bg-transparent hover:bg-white/40"
                          }`}
                        >
                          <Icon size={12} className={isActive ? "text-brand-blue" : "text-brand-slate"} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mock Workspace Panel content (fluid and overflow-hidden to eliminate scrollbars) */}
                <div className="flex-1 p-4.5 sm:p-5 bg-white/50 flex flex-col justify-between overflow-hidden">
                  
                  {/* Mobile Tab Swapper (only visible below md) */}
                  <div className="flex md:hidden flex-wrap gap-x-2 gap-y-1.5 mb-3.5 pb-2.5 border-b border-brand-border-mid">
                    {[
                      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
                      { id: "portfolio", label: "Portfolio", icon: Building2 },
                      { id: "watchlist", label: "Watchlist", icon: ListPlus },
                      { id: "projects", label: "Projects", icon: FolderOpen },
                      { id: "rera", label: "RERA", icon: ShieldAlert },
                      { id: "rates", label: "Circle Rates", icon: TrendingUp },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = dashboardTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold border shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? "bg-white border-brand-blue-border/30 text-brand-blue shadow-xs font-black"
                              : "bg-transparent border-transparent text-brand-slate"
                          }`}
                        >
                          <Icon size={10} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Render with Slide/Fade AnimatePresence */}
                  <div className="flex-1 overflow-y-auto scrollbar-none">
                    <AnimatePresence mode="wait">
                      {dashboardTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          {/* Overview Cards */}
                          <div className="grid grid-cols-3 gap-2.5 mb-4">
                            <div className="bg-white p-3 rounded-xl border border-brand-border shadow-xs flex flex-col justify-between min-h-[76px]">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-bold text-brand-slate uppercase tracking-wider">Portfolio</span>
                                <Building2 size={11} className="text-brand-amber" />
                              </div>
                              <div className="mt-1">
                                <div className="text-[14px] font-black text-brand-navy tracking-tight">₹12.45 Cr</div>
                                <div className="text-[8px] font-bold text-brand-emerald mt-0.5">
                                  <span>+24.8% YoY</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-brand-border shadow-xs flex flex-col justify-between min-h-[76px]">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-bold text-brand-slate uppercase tracking-wider">Watchlist</span>
                                <ListPlus size={11} className="text-brand-blue" />
                              </div>
                              <div className="mt-1">
                                <div className="text-[14px] font-black text-brand-navy tracking-tight">3 Areas</div>
                                <div className="text-[8px] font-bold text-brand-blue mt-0.5">
                                  <span>14 alerts</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-brand-border shadow-xs flex flex-col justify-between min-h-[76px]">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-bold text-brand-slate uppercase tracking-wider">Alerts</span>
                                <ShieldAlert size={11} className="text-brand-red" />
                              </div>
                              <div className="mt-1">
                                <div className="text-[14px] font-black text-brand-navy tracking-tight">1 Active</div>
                                <div className="text-[8px] font-bold text-brand-red mt-0.5">
                                  <span>RERA Delay</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Active Alert Row */}
                          <div className="bg-brand-red-bg border border-brand-red-border/60 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                            <div className="w-5.5 h-5.5 rounded bg-brand-red text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              !
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-[10px] font-extrabold text-brand-navy m-0">Skyline Residency delay warning</h4>
                                <span className="text-[7px] font-bold bg-brand-red text-white px-1 py-0.2 rounded tracking-widest uppercase">Negative</span>
                              </div>
                              <p className="text-[9.5px] text-brand-navy-mid leading-normal mt-0.5 m-0 font-medium font-bold">
                                Prestige Lakeside Habitat reports 6-month possession extension; monitoring Whitefield.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Portfolio Replica (My Properties Portfolio) */}
                      {dashboardTab === "portfolio" && (
                        <motion.div
                          key="portfolio"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col gap-3.5"
                        >
                          {/* Dashboard Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-[13px] font-black text-brand-navy tracking-tight m-0">My Properties Portfolio</h3>
                              <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium leading-relaxed font-bold">
                                Real-time valuations and appreciation calculated based on circle rates.
                              </p>
                            </div>
                            <button className="bg-brand-navy-deep text-white text-[9px] font-extrabold py-1 px-2 rounded-md flex items-center gap-1">
                              <Plus size={10} /> Track Property
                            </button>
                          </div>

                          {/* Stat Cards Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-white p-2 rounded-lg border border-brand-border flex items-center gap-1.5 shadow-3xs">
                              <div className="w-5 h-5 rounded-full bg-[#f5f8ff] text-brand-blue flex items-center justify-center font-bold text-[9px] shrink-0">₹</div>
                              <div className="min-w-0">
                                <p className="text-[6.5px] font-bold text-brand-slate uppercase m-0 truncate">Value</p>
                                <p className="text-[10px] font-black text-brand-navy mt-0.5 m-0 truncate">₹23.04 Cr</p>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-brand-border flex items-center gap-1.5 shadow-3xs">
                              <div className="w-5 h-5 rounded-full bg-[#fbf5ee] text-[#d97706] flex items-center justify-center font-bold text-[9px] shrink-0">🏛</div>
                              <div className="min-w-0">
                                <p className="text-[6.5px] font-bold text-brand-slate uppercase m-0 truncate">Invested</p>
                                <p className="text-[10px] font-black text-brand-navy mt-0.5 m-0 truncate">₹8.35 Cr</p>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-brand-border flex items-center gap-1.5 shadow-3xs">
                              <div className="w-5 h-5 rounded-full bg-[#ecfdf5] text-brand-emerald flex items-center justify-center font-bold text-[9px] shrink-0">📈</div>
                              <div className="min-w-0">
                                <p className="text-[6.5px] font-bold text-brand-slate uppercase m-0 truncate">Gains</p>
                                <p className="text-[10px] font-black text-brand-emerald mt-0.5 m-0 truncate">+₹14.69 Cr</p>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-brand-border flex items-center gap-1.5 shadow-3xs">
                              <div className="w-5 h-5 rounded-full bg-[#f5f8ff] text-brand-blue flex items-center justify-center font-bold text-[9px] shrink-0">₹</div>
                              <div className="min-w-0">
                                <p className="text-[6.5px] font-bold text-brand-slate uppercase m-0 truncate">Rent</p>
                                <p className="text-[10px] font-black text-brand-navy mt-0.5 m-0 truncate">₹1.80 L</p>
                              </div>
                            </div>
                          </div>

                          {/* Chart Illustration */}
                          <div className="bg-white rounded-xl border border-brand-border p-3 flex flex-col gap-2">
                            <span className="text-[9px] font-black text-brand-navy">Portfolio Investor Insights</span>
                            <div className="h-[90px] relative border-b border-brand-border flex items-end justify-around pb-1 pt-3">
                              {/* Greenwood */}
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-end gap-1 h-[60px]">
                                  <div className="w-5 bg-slate-400/80 h-[10px] rounded-t-xs" />
                                  <div className="w-5 bg-brand-blue h-[50px] rounded-t-xs" />
                                </div>
                                <span className="text-[7.5px] font-bold text-brand-slate truncate max-w-[80px] block">Greenwood Hts</span>
                              </div>
                              {/* DLF */}
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-end gap-1 h-[60px]">
                                  <div className="w-5 bg-slate-400/80 h-[25px] rounded-t-xs" />
                                  <div className="w-5 bg-brand-blue h-[55px] rounded-t-xs" />
                                </div>
                                <span className="text-[7.5px] font-bold text-brand-slate truncate max-w-[80px] block font-bold">DLF Arbour</span>
                              </div>
                              {/* Unitech */}
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-end gap-1 h-[60px]">
                                  <div className="w-5 bg-slate-400/80 h-[18px] rounded-t-xs" />
                                  <div className="w-5 bg-brand-blue h-[40px] rounded-t-xs" />
                                </div>
                                <span className="text-[7.5px] font-bold text-brand-slate truncate max-w-[80px] block">Unitech City</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Watchlist default */}
                      {dashboardTab === "watchlist" && (
                        <motion.div
                          key="watchlist"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-brand-slate uppercase tracking-wider">Watchlist local monitoring</span>
                            <span className="text-[8px] font-bold bg-brand-blue-bg text-brand-blue border border-brand-blue-border px-1.5 py-0.2 rounded uppercase">Active</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border border-brand-border rounded-xl p-3 shadow-xs">
                              <div className="flex items-center gap-1 text-[8px] font-bold text-brand-blue uppercase mb-1">
                                <MapPin size={9} /> Sector 102
                              </div>
                              <h5 className="text-[11px] font-extrabold text-brand-navy mb-0.5 m-0">BPTP Downtown</h5>
                              <p className="text-[8.5px] text-brand-slate leading-normal m-0 font-medium">Tracking 3 BHK prices under ₹1.70 Cr.</p>
                              <div className="mt-2.5 pt-2 border-t border-brand-border flex justify-between text-[8px] font-bold">
                                <span className="text-brand-emerald">1 Match</span>
                                <span className="text-brand-navy-deep font-black">₹1.65 Cr</span>
                              </div>
                            </div>

                            <div className="bg-white border border-brand-border rounded-xl p-3 shadow-xs">
                              <div className="flex items-center gap-1 text-[8px] font-bold text-brand-blue uppercase mb-1">
                                <MapPin size={9} /> Whitefield
                              </div>
                              <h5 className="text-[11px] font-extrabold text-brand-navy mb-0.5 m-0">Prestige Tech</h5>
                              <p className="text-[8.5px] text-brand-slate leading-normal m-0 font-medium">Tracking sizes above 2,200 sq.ft.</p>
                              <div className="mt-2.5 pt-2 border-t border-brand-border flex justify-between text-[8px] font-bold">
                                <span className="text-brand-slate">No matches today</span>
                                <span className="text-brand-slate-light font-bold">Tracking...</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Projects Directory Replica */}
                      {dashboardTab === "projects" && (
                        <motion.div
                          key="projects"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-[13px] font-black text-brand-navy tracking-tight m-0">Projects Directory</h3>
                              <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium font-bold">
                                Explore verified market properties, check construction status.
                              </p>
                            </div>
                          </div>

                          {/* Filters Bar Mock */}
                          <div className="bg-white border border-brand-border rounded-lg p-2.5 grid grid-cols-4 gap-2 text-[8px] font-bold text-brand-navy">
                            <div className="bg-[#F4F3EF] py-1 px-2.5 rounded flex items-center justify-between border border-brand-border">
                              <span className="truncate">Cities</span> <ChevronDown size={8} className="shrink-0" />
                            </div>
                            <div className="bg-[#F4F3EF] py-1 px-2.5 rounded flex items-center justify-between border border-brand-border">
                              <span className="truncate font-bold">Developers</span> <ChevronDown size={8} className="shrink-0" />
                            </div>
                            <div className="bg-[#F4F3EF] py-1 px-2.5 rounded flex items-center justify-between border border-brand-border">
                              <span className="truncate">Types</span> <ChevronDown size={8} className="shrink-0" />
                            </div>
                            <div className="bg-[#F4F3EF] py-1 px-2.5 rounded flex items-center justify-between border border-brand-border">
                              <span className="truncate font-bold">Statuses</span> <ChevronDown size={8} className="shrink-0" />
                            </div>
                          </div>

                          {/* Cards Row (3 Cards) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {/* Card A: Gaur Plume */}
                            <div className="bg-white border border-brand-border rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
                              <div className="h-[46px] bg-linear-to-b from-[#1E293B] to-[#0F172A] p-2 flex flex-col justify-between text-white">
                                <span className="text-[6.5px] font-bold bg-[#F59E0B] text-white px-1 py-0.2 rounded-sm w-fit uppercase">Under Constr.</span>
                                <h4 className="text-[10px] font-black tracking-tight m-0 text-white truncate">Gaur Plume</h4>
                              </div>
                              <div className="p-2 flex flex-col gap-1 text-[8px] font-semibold text-brand-slate">
                                <span className="truncate text-brand-navy">Sector 22D, Noida</span>
                                <div className="border-t border-brand-border pt-1 flex justify-between items-center mt-1">
                                  <span className="text-[9px] font-black text-brand-navy">₹1.36 Cr</span>
                                  <span className="text-[7.5px] bg-[#F4F3EF] border border-brand-border px-1 py-0.2 rounded text-brand-navy font-bold">Details</span>
                                </div>
                              </div>
                            </div>
                            {/* Card B: Gaur Bento */}
                            <div className="bg-white border border-brand-border rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
                              <div className="h-[46px] bg-linear-to-b from-[#1E293B] to-[#0F172A] p-2 flex flex-col justify-between text-white">
                                <span className="text-[6.5px] font-bold bg-[#F59E0B] text-white px-1 py-0.2 rounded-sm w-fit uppercase">Under Constr.</span>
                                <h4 className="text-[10px] font-black tracking-tight m-0 text-white truncate">Gaur Bento</h4>
                              </div>
                              <div className="p-2 flex flex-col gap-1 text-[8px] font-semibold text-brand-slate">
                                <span className="truncate text-brand-navy">Yamuna Exp., Noida</span>
                                <div className="border-t border-brand-border pt-1 flex justify-between items-center mt-1">
                                  <span className="text-[9px] font-black text-brand-navy font-bold">₹95.31 L</span>
                                  <span className="text-[7.5px] bg-[#F4F3EF] border border-brand-border px-1 py-0.2 rounded text-brand-navy font-bold">Details</span>
                                </div>
                              </div>
                            </div>
                            {/* Card C: Godrej Nagpur */}
                            <div className="bg-white border border-brand-border rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
                              <div className="h-[46px] bg-linear-to-b from-[#1E293B] to-[#0F172A] p-2 flex flex-col justify-between text-white">
                                <span className="text-[6.5px] font-bold bg-[#F59E0B] text-white px-1 py-0.2 rounded-sm w-fit uppercase">Under Constr.</span>
                                <h4 className="text-[10px] font-black tracking-tight m-0 text-white truncate font-bold">Godrej Nagpur</h4>
                              </div>
                              <div className="p-2 flex flex-col gap-1 text-[8px] font-semibold text-brand-slate">
                                <span className="truncate text-brand-navy">MIHAN, Nagpur</span>
                                <div className="border-t border-brand-border pt-1 flex justify-between items-center mt-1">
                                  <span className="text-[9px] font-black text-brand-navy font-bold">₹76.5 L</span>
                                  <span className="text-[7.5px] bg-[#F4F3EF] border border-brand-border px-1 py-0.2 rounded text-brand-navy font-bold">Details</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* RERA Timeline milestones */}
                      {dashboardTab === "rera" && (
                        <motion.div
                          key="rera"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col gap-3.5"
                        >
                          <div>
                            <h4 className="text-[13px] font-bold text-brand-navy m-0">BPTP District Blocks A-D</h4>
                            <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 uppercase tracking-wide font-semibold">RERA Registered</p>
                          </div>

                          <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 relative">
                              <div className="flex items-start gap-1">
                                <CheckCircle2 size={13} className="text-brand-emerald mt-0.5 shrink-0" />
                                <div>
                                  <h6 className="text-[9px] font-bold text-brand-navy m-0">Filing</h6>
                                  <p className="text-[7.5px] text-brand-slate mt-0.5 m-0 font-medium">Approved</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-1">
                                <CheckCircle2 size={13} className="text-brand-emerald mt-0.5 shrink-0" />
                                <div>
                                  <h6 className="text-[9px] font-bold text-brand-navy m-0">Ground</h6>
                                  <p className="text-[7.5px] text-brand-slate mt-0.5 m-0 font-medium">Completed</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-1">
                                <CheckCircle2 size={13} className="text-brand-emerald mt-0.5 shrink-0" />
                                <div>
                                  <h6 className="text-[9px] font-bold text-brand-navy m-0">Structure</h6>
                                  <p className="text-[7.5px] text-brand-slate mt-0.5 m-0 font-medium">Completed</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-1">
                                <div className="w-3.5 h-3.5 rounded-full bg-brand-amber-bg border border-brand-amber-light flex items-center justify-center font-bold text-[8px] text-brand-amber shrink-0 mt-0.5 animate-pulse">
                                  !
                                </div>
                                <div>
                                  <h6 className="text-[9px] font-bold text-brand-navy m-0">Finishing</h6>
                                  <p className="text-[7.5px] text-brand-amber font-semibold mt-0.5 m-0">Dec 2026</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Government Circle Rates Map Replica */}
                      {dashboardTab === "rates" && (
                        <motion.div
                          key="rates"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-[13px] font-black text-brand-navy tracking-tight m-0">Government Circle Rates</h3>
                              <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium">
                                Drill down on the map to explore circle rates across states, districts, and sectors.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                            {/* Left search */}
                            <div className="col-span-1 md:col-span-4 bg-white border border-brand-border rounded-xl p-3 flex flex-col justify-between gap-3 shadow-3xs">
                              <div className="relative">
                                <Search size={11} className="absolute left-2.5 top-2.5 text-brand-slate" />
                                <input 
                                  type="text" 
                                  placeholder="Search state/district..." 
                                  className="w-full bg-[#F4F3EF] border border-brand-border rounded-lg py-1.5 pl-7 pr-2.5 text-[8.5px] text-brand-navy font-bold focus:outline-none focus:border-brand-blue-border"
                                  readOnly
                                />
                              </div>
                              <div className="bg-[#fcf8f2] border border-[#fef3c7e0] rounded-lg p-2 flex items-start gap-1.5">
                                <Info size={12} className="text-[#d97706] shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-[9px] font-black text-brand-navy m-0">Rates Map</h5>
                                  <p className="text-[8px] text-brand-slate mt-0.5 m-0 leading-normal font-semibold">
                                    Hover over district polygons to see local circular rate index values.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Right vector map simulation */}
                            <div className="col-span-1 md:col-span-8 bg-[#EAE8E2] border border-brand-border rounded-xl overflow-hidden relative shadow-3xs min-h-[145px] flex items-center justify-center">
                              <svg className="w-full h-full absolute inset-0 p-2.5" viewBox="0 0 500 300" fill="none">
                                <path d="M40 80 L180 50 L200 120 L270 190 L190 270 L90 280 L40 180 Z" fill="#FCA5A5" fillOpacity="0.45" stroke="#EF4444" strokeWidth="1.5" />
                                <path d="M280 40 L450 30 L460 170 L380 250 L290 210 Z" fill="#86EFAC" fillOpacity="0.4" stroke="#22C55E" strokeWidth="1.5" />
                                <path d="M200 120 L280 80 L320 140 L280 210 L220 190 Z" fill="#93C5FD" fillOpacity="0.6" stroke="#2563EB" strokeWidth="2" />
                                <text x="110" y="160" fill="#7f1d1d" fontSize="11" fontWeight="900">Gurgaon</text>
                                <text x="238" y="152" fill="#1e3a8a" fontSize="11" fontWeight="900">New Delhi</text>
                                <text x="350" y="130" fill="#14532d" fontSize="11" fontWeight="900">Noida</text>
                              </svg>
                              <div className="absolute top-2 right-2 bg-white border border-brand-border rounded shadow-xs flex flex-col text-[8px] font-black">
                                <button className="w-5 h-5 flex items-center justify-center border-b border-brand-border">+</button>
                                <button className="w-5 h-5 flex items-center justify-center">-</button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[10px] font-semibold text-brand-slate">
                    <span>Sync status: Active</span>
                    <span className="text-brand-blue flex items-center gap-0.5 cursor-pointer hover:underline font-bold">
                      View all workspaces <ChevronRight size={10} />
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

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
