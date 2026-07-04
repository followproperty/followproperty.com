"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ListPlus, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Search,
  ChevronRight,
  FolderOpen,
  FileText
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const router = useRouter();

  const tabs = [
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Building2,
      description: "See the current estimated market value and growth of all your holdings in one place.",
    },
    {
      id: "watchlist",
      label: "Watchlist",
      icon: ListPlus,
      description: "Follow specific projects and get notified the moment comparable sale prices adjust.",
    },
    {
      id: "rates",
      label: "Circle Rates",
      icon: TrendingUp,
      description: "Check official government valuation guidelines for any locality in real time.",
    },
    {
      id: "rera",
      label: "RERA",
      icon: ShieldAlert,
      description: "Monitor developer timelines, project extensions, and warning flags before you purchase.",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      description: "Access verified builder approvals, unit specifications, and layout documents directly.",
    },
  ];

  return (
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-24 sm:py-32 bg-brand-bg border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-4 shadow-brand">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              Product Workspace
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(26px,4vw,38px)] font-extrabold text-brand-navy tracking-tight mb-4">
            Here's what your workspace looks like
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-sm sm:text-base text-brand-slate leading-relaxed max-w-[580px] mx-auto">
            Explore the active workspace components designed to help you track values and search properties.
          </motion.p>
        </div>

        {/* Interactive Tab System */}
        <motion.div 
          variants={fadeUp} 
          custom={3}
          className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-brand-navy border-brand-navy text-white shadow-brand-md" 
                    : "bg-brand-bg-card border-brand-border text-brand-slate hover:text-brand-navy hover:border-brand-border-mid hover:bg-[#F4F3EF]/40"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Tab Description & Crop Screen */}
        <motion.div 
          variants={fadeUp} 
          custom={4}
          className="w-full max-w-[940px] mx-auto"
        >
          {/* Active Tab outcome sentence */}
          <div className="text-center mb-6 h-8 flex items-center justify-center">
            <p className="text-[14px] sm:text-base font-bold text-brand-navy-mid m-0">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Premium Browser Mockup Wrapper */}
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-brand-border-mid shadow-brand-lg overflow-hidden flex flex-col select-none text-left">
            
            {/* Chrome Top Bar */}
            <div className="bg-[#F4F3EF] px-4 py-3 border-b border-brand-border-mid flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
              </div>
              <div className="flex-1 max-w-[340px] bg-white/90 border border-brand-border text-[11px] font-semibold text-brand-slate py-1 px-3.5 rounded-lg flex items-center shadow-inner">
                <span className="truncate">
                  followproperty.com/dashboard/{activeTab}
                </span>
              </div>
            </div>

            {/* Viewport Screen Area (Cropped intelligently) */}
            <div className="p-6 bg-white/50 min-h-[260px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {activeTab === "portfolio" && (
                  <motion.div
                    key="portfolio-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4 flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Tracked Asset holdings</span>
                      <span className="text-[9px] font-bold bg-brand-emerald-bg text-brand-emerald border border-brand-emerald-bg px-2 py-0.5 rounded uppercase tracking-wider">Live values</span>
                    </div>

                    <div className="flex flex-col border border-brand-border rounded-xl bg-white overflow-hidden shadow-xs">
                      <div className="grid grid-cols-12 gap-2 bg-[#F4F3EF]/60 p-3 text-[10px] font-extrabold text-brand-slate border-b border-brand-border uppercase tracking-wider">
                        <div className="col-span-6">Asset details</div>
                        <div className="col-span-3 text-right">Value</div>
                        <div className="col-span-3 text-right">Gains</div>
                      </div>
                      <div className="grid grid-cols-12 gap-2 p-3 text-[11px] font-bold text-brand-navy border-b border-brand-border items-center">
                        <div className="col-span-6 min-w-0">
                          <p className="m-0 truncate">Skyline Heights, Sector 49</p>
                          <p className="m-0 text-[9px] text-brand-slate mt-0.5 font-medium truncate">Gurgaon · 3 BHK Apartment</p>
                        </div>
                        <div className="col-span-3 text-right font-black text-brand-navy-deep">₹2.10 Cr</div>
                        <div className="col-span-3 text-right text-brand-emerald font-black">+12.4%</div>
                      </div>
                      <div className="grid grid-cols-12 gap-2 p-3 text-[11px] font-bold text-brand-navy items-center">
                        <div className="col-span-6 min-w-0">
                          <p className="m-0 truncate">Prestige Greens, Whitefield</p>
                          <p className="m-0 text-[9px] text-brand-slate mt-0.5 font-medium truncate">Bangalore · 4 BHK Villa</p>
                        </div>
                        <div className="col-span-3 text-right font-black text-brand-navy-deep">₹5.40 Cr</div>
                        <div className="col-span-3 text-right text-brand-emerald font-black">+31.2%</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "watchlist" && (
                  <motion.div
                    key="watchlist-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4 flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Locality criteria monitoring</span>
                      <span className="text-[9px] font-bold bg-brand-blue-bg text-brand-blue border border-brand-blue-border px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-blue uppercase tracking-wider mb-1.5">
                            <MapPin size={10} /> Gurgaon Sector 102
                          </div>
                          <h5 className="text-[13px] font-bold text-brand-navy mb-1 m-0">BPTP Downtown Project</h5>
                          <p className="text-[10px] text-brand-slate m-0 leading-normal font-medium">Monitoring 3 BHK sizes listing rates below ₹1.70 Cr.</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center text-[10px] font-bold">
                          <span className="text-brand-emerald">1 Match available</span>
                          <span className="text-brand-navy-deep font-black">₹1.65 Cr</span>
                        </div>
                      </div>

                      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-blue uppercase tracking-wider mb-1.5">
                            <MapPin size={10} /> Bangalore Whitefield
                          </div>
                          <h5 className="text-[13px] font-bold text-brand-navy mb-1 m-0">Prestige Tech Residency</h5>
                          <p className="text-[10px] text-brand-slate m-0 leading-normal font-medium">Monitoring sizes above 2,200 sq.ft, completion by 2026.</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center text-[10px] font-bold">
                          <span className="text-brand-slate">No direct matches today</span>
                          <span className="text-brand-slate-light font-medium">Tracking prices...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rates" && (
                  <motion.div
                    key="rates-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4 flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Revenue department registries</span>
                      <span className="text-[9px] font-bold bg-[#F4F3EF] border border-brand-border px-2 py-0.5 rounded uppercase tracking-wider text-brand-slate">2026 Notification</span>
                    </div>

                    <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-brand-slate" />
                          <span className="text-xs font-bold text-brand-navy">Gurgaon Sector 49</span>
                        </div>
                        <span className="text-[9px] font-bold text-brand-slate">Revenue Circle Code: 07</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-brand-bg-alt p-3 rounded-lg border border-brand-border text-center">
                          <p className="text-[8px] text-brand-slate uppercase font-bold tracking-wider m-0">Residential Plots</p>
                          <p className="text-sm font-black text-brand-navy mt-1 m-0">₹84,000</p>
                          <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium">per sq. yard</p>
                        </div>
                        <div className="bg-brand-bg-alt p-3 rounded-lg border border-brand-border text-center">
                          <p className="text-[8px] text-brand-slate uppercase font-bold tracking-wider m-0">Commercial Plots</p>
                          <p className="text-sm font-black text-brand-navy mt-1 m-0">₹1,95,000</p>
                          <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium">per sq. yard</p>
                        </div>
                        <div className="bg-brand-bg-alt p-3 rounded-lg border border-brand-border text-center">
                          <p className="text-[8px] text-brand-slate uppercase font-bold tracking-wider m-0">Multi-Story Flats</p>
                          <p className="text-sm font-black text-brand-navy mt-1 m-0">₹6,200</p>
                          <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium">per sq. ft</p>
                        </div>
                        <div className="bg-brand-bg-alt p-3 rounded-lg border border-brand-border text-center">
                          <p className="text-[8px] text-brand-slate uppercase font-bold tracking-wider m-0">Group Housing</p>
                          <p className="text-sm font-black text-brand-navy mt-1 m-0">₹64,000</p>
                          <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-medium">per sq. yard</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rera" && (
                  <motion.div
                    key="rera-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4 flex-1"
                  >
                    <div>
                      <h4 className="text-[14px] font-bold text-brand-navy m-0">BPTP District Blocks A-D</h4>
                      <p className="text-[9px] text-brand-slate mt-0.5 m-0 uppercase tracking-wide font-medium">RERA Number: RERA-GRG-102-2023</p>
                    </div>

                    <div className="bg-white border border-brand-border rounded-xl p-4.5 shadow-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-brand-emerald mt-0.5 shrink-0" />
                          <div>
                            <h6 className="text-[11px] font-bold text-brand-navy m-0">RERA Filing</h6>
                            <p className="text-[9px] text-brand-slate mt-0.5 m-0 font-medium">Approved Jan 2023</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-brand-emerald mt-0.5 shrink-0" />
                          <div>
                            <h6 className="text-[11px] font-bold text-brand-navy m-0">Groundwork</h6>
                            <p className="text-[9px] text-brand-slate mt-0.5 m-0 font-medium">Completed Aug 2023</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-brand-emerald mt-0.5 shrink-0" />
                          <div>
                            <h6 className="text-[11px] font-bold text-brand-navy m-0">Superstructure</h6>
                            <p className="text-[9px] text-brand-slate mt-0.5 m-0 font-medium">Completed Dec 2024</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-brand-amber-bg border border-brand-amber-light flex items-center justify-center font-bold text-[9px] text-brand-amber shrink-0 mt-0.5 animate-pulse">
                            !
                          </div>
                          <div>
                            <h6 className="text-[11px] font-bold text-brand-navy m-0">Finishing Phase</h6>
                            <p className="text-[9px] text-brand-amber font-semibold mt-0.5 m-0">Target: Dec 2026</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "projects" && (
                  <motion.div
                    key="projects-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4 flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Project Approvals Registry</span>
                      <span className="text-[9px] font-bold bg-brand-emerald-bg text-brand-emerald border border-brand-emerald-bg px-2 py-0.5 rounded uppercase tracking-wider">Verified docs</span>
                    </div>

                    <div className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-[13px] font-extrabold text-brand-navy m-0">BPTP District, Gurgaon</h5>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-[8.5px] font-bold bg-brand-emerald-bg text-brand-emerald px-2 py-0.5 rounded border border-brand-emerald-bg">RERA Registered</span>
                          <span className="text-[8.5px] font-bold bg-[#F4F3EF] text-brand-navy px-2 py-0.5 rounded border border-brand-border">DTCP Licensed</span>
                          <span className="text-[8.5px] font-bold bg-[#F4F3EF] text-brand-navy px-2 py-0.5 rounded border border-brand-border">Approved Layouts</span>
                        </div>
                      </div>
                      <button className="btn-secondary text-[11px] py-1.5 px-3.5 whitespace-nowrap bg-[#F4F3EF] hover:bg-brand-navy hover:text-white cursor-pointer font-bold border border-brand-border-mid rounded-xl flex items-center gap-1.5">
                        <FileText size={12} /> Download Approved Layout Plans
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mock footer action */}
              <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between text-[10px] font-semibold text-brand-slate">
                <span>View matches and compliance lists live on FollowProperty.</span>
                <span className="text-brand-blue flex items-center gap-0.5 font-bold">
                  Track live workspace <ChevronRight size={10} />
                </span>
              </div>
            </div>

          </div>

          {/* Centered preview conversion prompt */}
          <div className="text-center mt-10">
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex items-center gap-1.5 text-brand-blue text-[13px] sm:text-[14px] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Setup my dashboard in 3 minutes <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
