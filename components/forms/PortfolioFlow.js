"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  X,
  Shield,
  ArrowRight,
  Search,
  Check,
  PlusCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";

import { fadeUp } from '@/constants/theme';
import { 
  Input, 
  Select, 
  Toggle, 
  AlertToggle, 
  FieldBadge, 
  SectionHeader, 
  FlowContext 
} from './FlowElements';
import { submitPortfolio } from '@/services/api';
import { convertToRupees } from '@/utils/currency';
import {
  PROJECT_TYPES,
  BANKS,
  USE_OPTIONS,
  MONTHS,
  YEARS_PAST,
  YEARS_FUTURE,
  CURRENCY_UNITS
} from '@/constants/property';

const STATE_CITY_MAP = {
  "Haryana": ["Gurgaon"],
  "Uttar Pradesh": ["Noida", "Lucknow"],
  "Delhi": ["Delhi"],
  "Maharashtra": ["Mumbai", "Pune"],
  "Telangana": ["Hyderabad"],
  "Karnataka": ["Bengaluru"],
  "Tamil Nadu": ["Chennai"],
  "Gujarat": ["Ahmedabad"],
  "West Bengal": ["Kolkata"],
  "Rajasthan": ["Jaipur"]
};

export default function PortfolioFlow({ onClose, onSubmitSuccess }) {
  const router = useRouter();
  const [form, setForm] = useState({
    state: "",
    isManualProject: false,
    currencyUnit: "Cr",
    // Fields 1–12
    builderName: "",
    projectName: "",
    unitName: "",
    projectType: "",
    city: "",
    locality: "",
    superArea: "",
    carpetArea: "",
    totalPricePaid: "",
    floorNumber: "",
    parkingSpots: "",
    possessionStatus: "",
    // Fields 13–24
    possessionDateMonth: "",
    possessionDateYear: "",
    expectedPossessionMonth: "",
    expectedPossessionYear: "",
    currentUse: "",
    ongoingLoan: "",
    bankName: "",
    monthlyEMI: "",
    rentalIncome: "",
    monthlyRent: "",
    alertBuilder: true,
    alertProject: true,
    alertCity: true,
    alertState: false,
    // Linkage fields
    projectId: null,
    builderId: null,
    projectSlug: null,
    builderSlug: null,
  });
  const [totalPricePaidInput, setTotalPricePaidInput] = useState("");
const [totalPricePaidUnit, setTotalPricePaidUnit] = useState("Cr");
const [section, setSection] = useState(1); // 1 = form part A, 2 = form part B
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const set = (key) => (val) => {
    setForm((f) => {
      const updated = { ...f, [key]: val };
      // Clear city if state changes
      if (key === "state") {
        updated.city = "";
        updated.projectName = "";
        updated.builderName = "";
        updated.projectId = null;
        updated.builderId = null;
        updated.projectSlug = null;
        updated.builderSlug = null;
        setSearchQuery("");
      }
      // Clear project selection if city or propertyType changes
      if (key === "city" || key === "projectType") {
        updated.projectName = "";
        updated.builderName = "";
        updated.projectId = null;
        updated.builderId = null;
        updated.projectSlug = null;
        updated.builderSlug = null;
        setSearchQuery("");
      }
      return updated;
    });
  };

  const required1 =
    form.state &&
    form.city &&
    form.projectType &&
    form.builderName &&
    form.projectName &&
    form.locality &&
    form.superArea &&
    form.carpetArea &&
    totalPricePaidInput &&
    form.possessionStatus;
  
  const required2 = form.currentUse && form.ongoingLoan && form.rentalIncome;

  // Debounced search trigger
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/projects/search?state=${encodeURIComponent(form.state)}&city=${encodeURIComponent(form.city)}&propertyType=${encodeURIComponent(form.projectType)}&search=${encodeURIComponent(searchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch search results:", err);
      } finally {
        setSearching(false);
      }
    }, 350); // 350ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, form.state, form.city, form.projectType]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < searchResults.length) {
        handleSelectProject(searchResults[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectProject = (project) => {
    setForm((f) => ({
      ...f,
      projectName: project.projectName,
      builderName: project.builderName,
      projectId: project._id || null,
      builderId: project.builderId || null,
      projectSlug: project.projectSlug || null,
      builderSlug: project.builderSlug || null,
      isManualProject: false,
    }));
    setSearchQuery("");
    setShowDropdown(false);
    setActiveSuggestionIndex(-1);
  };

  async function handleSubmit() {
    if (!required2) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalPricePaid: convertToRupees(totalPricePaidInput, totalPricePaidUnit),
        monthlyEMI: form.monthlyEMI ? Number(form.monthlyEMI) : "",
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : "",
      };
      await submitPortfolio(payload);

      if (typeof window !== "undefined") {
        const existingStr = sessionStorage.getItem("portfolioProperties");
        let existing = [];
        if (existingStr) existing = JSON.parse(existingStr);
        existing.push({ ...payload, id: Date.now() });
        sessionStorage.setItem("portfolioProperties", JSON.stringify(existing));
      }

      if (onSubmitSuccess) {
        onSubmitSuccess("portfolio", payload);
      } else {
        router.push("/portfolio");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to submit to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const citiesList = form.state ? STATE_CITY_MAP[form.state] : [];

  return (
    <FlowContext.Provider value={{ accent: 'amber' }}>
      <div className="min-h-screen flex flex-col bg-brand-bg-card font-sans antialiased">
        {/* Header */}
        <div className="pt-6 px-7 pb-5 border-b border-brand-border flex items-start justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[9px] bg-linear-to-br from-brand-amber-light to-[#EA580C] flex items-center justify-center shadow-[0_2px_10px_rgba(217,119,6,0.30)]">
              <Building2 size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[17px] text-brand-navy tracking-[-0.025em]">
              FollowProperty
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="bg-transparent border-none cursor-pointer text-brand-slate-light p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress + Step tabs */}
        <div className="py-3 px-7 bg-brand-bg-alt border-b border-brand-border">
          <div className="flex gap-1.5 mb-2.5">
            {[
              { n: 1, label: "Property Details (1–12)" },
              { n: 2, label: "Loan, Rent & Alerts (13–24)" },
            ].map((tab) => (
              <button
                key={tab.n}
                type="button"
                onClick={() => {
                  if (tab.n === 2 && !required1) return;
                  setSection(tab.n);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border-[1.5px] font-semibold text-xs cursor-pointer transition-all duration-180 ${
                  section === tab.n 
                    ? "border-brand-amber bg-brand-amber-bg text-brand-amber" 
                    : "border-brand-border-mid bg-brand-bg-card text-brand-slate-light hover:bg-brand-bg-alt"
                }`}
              >
                {tab.n === section && "→ "}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-1 rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-brand-amber-light to-[#EA580C] rounded-full transition-[width] duration-400 ease-out"
              style={{
                width: section === 1 ? "50%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-4xl mx-auto pt-6 px-7 pb-[60px] flex-1 bg-brand-bg-card">
          {!onClose && (
            <div className="mb-6 flex justify-start">
              <Link
                href="/dashboard"
                className="no-underline text-xs font-bold text-brand-slate hover:text-brand-navy transition-colors px-3.5 py-2 rounded-xl border border-brand-border-mid bg-brand-bg-card shadow-brand flex items-center gap-1.5"
              >
                ← Back to Dashboard
              </Link>
            </div>
          )}
          <AnimatePresence mode="wait">
            {section === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SectionHeader
                  number="A"
                  title="Property Selection"
                />

                {/* State and City Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={1} active={!!form.state} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        State <span className="text-brand-amber">*</span>
                      </span>
                    </div>
                    <Select
                      label=""
                      value={form.state}
                      onChange={set("state")}
                      options={Object.keys(STATE_CITY_MAP)}
                      required
                      placeholder="Select state"
                    />
                  </div>
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={2} active={!!form.city} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        City <span className="text-brand-amber">*</span>
                      </span>
                    </div>
                    <Select
                      label=""
                      value={form.city}
                      onChange={set("city")}
                      options={citiesList}
                      required
                      placeholder={form.state ? "Select city" : "Select state first"}
                    />
                  </div>
                </div>

                {/* Property Type Selector */}
                <div className="flex gap-3 mb-1.5">
                  <FieldBadge n={3} active={!!form.projectType} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Property Type <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <Select
                  label=""
                  value={form.projectType}
                  onChange={set("projectType")}
                  options={PROJECT_TYPES}
                  required
                  placeholder={form.city ? "Select type" : "Select city first"}
                />

                {/* Autocomplete Project Search */}
                {form.state && form.city && form.projectType && (
                  <div className="mb-4 relative" ref={dropdownRef}>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={4} active={!!form.projectName} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Project / Builder Search <span className="text-brand-amber">*</span>
                      </span>
                    </div>

                    {form.projectName && !form.isManualProject ? (
                      /* Read-Only Locked Card for Selected Project */
                      <div className="bg-brand-amber-bg/30 border border-brand-amber-border/60 rounded-xl p-4 flex items-center justify-between shadow-brand-sm transition-all duration-200">
                        <div>
                          <div className="text-[10px] text-brand-amber font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Check size={11} strokeWidth={3} /> In Database
                          </div>
                          <h4 className="text-sm font-bold text-brand-navy mt-1">
                            {form.projectName}
                          </h4>
                          <p className="text-xs text-brand-slate mt-0.5 font-medium">
                            by {form.builderName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              projectName: "",
                              builderName: "",
                              projectId: null,
                              builderId: null,
                              projectSlug: null,
                              builderSlug: null,
                            }));
                            setSearchQuery("");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-brand-amber-border text-brand-amber bg-brand-bg-card text-xs font-bold cursor-pointer transition-colors duration-200 hover:bg-brand-amber-bg/45"
                        >
                          Change Project
                        </button>
                      </div>
                    ) : form.isManualProject ? (
                      /* Manual Entry Input Fields */
                      <div className="bg-brand-bg-alt border border-brand-border rounded-xl p-4.5 mb-2 shadow-brand-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-brand-slate font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <PlusCircle size={12} className="text-brand-slate" /> Manual Project Entry
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                isManualProject: false,
                                projectName: "",
                                builderName: "",
                                projectId: null,
                                builderId: null,
                                projectSlug: null,
                                builderSlug: null,
                              }));
                              setSearchQuery("");
                            }}
                            className="bg-transparent border-none text-[10px] text-brand-amber font-bold cursor-pointer hover:underline"
                          >
                            ← Back to Search
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] font-semibold text-brand-navy-mid mb-1 block">
                              Builder Name <span className="text-brand-amber">*</span>
                            </span>
                            <Input
                              label=""
                              value={form.builderName}
                              onChange={set("builderName")}
                              placeholder="e.g. DLF, M3M"
                              required
                            />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-brand-navy-mid mb-1 block">
                              Project Name <span className="text-brand-amber">*</span>
                            </span>
                            <Input
                              label=""
                              value={form.projectName}
                              onChange={set("projectName")}
                              placeholder="e.g. DLF Cyber City"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Autocomplete Search input */
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-slate-light pointer-events-none">
                          <Search size={16} />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type at least 2 characters to search project..."
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm text-brand-navy bg-brand-bg-card border border-brand-border-mid rounded-[10px] outline-none transition-all duration-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20"
                        />

                        {showDropdown && (searchQuery.trim().length >= 2 || searching) && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-brand-bg-card border border-brand-border-mid rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.1)] max-h-[280px] overflow-y-auto divide-y divide-brand-border overflow-hidden">
                            {searching ? (
                              <div className="p-4 text-center text-xs text-brand-slate-light flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-brand-amber/40 border-t-brand-amber rounded-full animate-spin" />
                                Searching database...
                              </div>
                            ) : searchResults.length > 0 ? (
                              <>
                                {searchResults.map((project, idx) => (
                                  <div
                                    key={project._id}
                                    onClick={() => handleSelectProject(project)}
                                    className={`p-3.5 cursor-pointer text-left transition-colors duration-150 flex items-start gap-2.5 ${
                                      idx === activeSuggestionIndex 
                                        ? "bg-brand-amber-bg/40 text-brand-amber" 
                                        : "hover:bg-brand-bg-alt"
                                    }`}
                                  >
                                    <div className="w-6 h-6 rounded-md bg-brand-amber-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Building2 size={13} className="text-brand-amber" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-bold text-brand-navy truncate">
                                        {project.projectName}
                                      </div>
                                      <div className="text-xs text-brand-slate truncate mt-0.5">
                                        by {project.builderName} · {project.location || project.city}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div 
                                  onClick={() => setForm((f) => ({
                                    ...f,
                                    isManualProject: true,
                                    projectId: null,
                                    builderId: null,
                                    projectSlug: null,
                                    builderSlug: null,
                                  }))}
                                  className="p-3.5 bg-brand-bg-alt hover:bg-brand-amber-bg/20 cursor-pointer text-left text-xs font-bold text-brand-amber flex items-center gap-2 border-t border-brand-border"
                                >
                                  <PlusCircle size={14} />
                                  <span>Project not listed? Enter manually</span>
                                </div>
                              </>
                            ) : (
                              <div className="p-4 text-center">
                                <p className="text-xs text-brand-slate font-medium">No matching projects found.</p>
                                <button
                                  type="button"
                                  onClick={() => setForm((f) => ({
                                    ...f,
                                    isManualProject: true,
                                    projectId: null,
                                    builderId: null,
                                    projectSlug: null,
                                    builderSlug: null,
                                  }))}
                                  className="mt-2 text-xs font-bold text-brand-amber bg-brand-amber-bg hover:bg-brand-amber-bg/80 border border-brand-amber-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                                >
                                  Project not listed? Enter manually
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Locality and Unit Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={5} active={!!form.locality} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Locality / Sector <span className="text-brand-amber">*</span>
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.locality}
                      onChange={set("locality")}
                      placeholder="e.g. Sector 65"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={6} active={!!form.unitName} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Unit / Apartment Name
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.unitName}
                      onChange={set("unitName")}
                      placeholder="e.g. Tower A, Unit 401"
                    />
                  </div>
                </div>

                <SectionHeader
                  number="B"
                  title="Area & Price (Fields 07 – 09)"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={7} active={!!form.superArea} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Super Area (sqft){" "}
                        <span className="text-brand-amber">*</span>
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.superArea}
                      onChange={set("superArea")}
                      placeholder="e.g. 2500"
                      type="number"
                      required
                      hideApprox={true}
                    />
                  </div>
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={8} active={!!form.carpetArea} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Carpet Area (sqft){" "}
                        <span className="text-brand-amber">*</span>
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.carpetArea}
                      onChange={set("carpetArea")}
                      placeholder="e.g. 1875"
                      type="number"
                      required
                      hideApprox={true}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mb-1.5">
                  <FieldBadge n={9} active={!!totalPricePaidInput} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Total Price Paid (₹){" "}
                    <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate-light text-sm font-semibold pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={totalPricePaidInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && Number(val) < 0) return;
                        setTotalPricePaidInput(val);
                      }}
                      placeholder={totalPricePaidUnit === "Cr" ? "e.g. 3" : totalPricePaidUnit === "Lakh" ? "e.g. 75" : "e.g. 7500000"}
                      className="w-full pl-7 pr-3.5 py-2.5 text-sm text-brand-navy bg-brand-bg-card border border-brand-border-mid rounded-[10px] outline-none transition-all duration-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20"
                    />
                  </div>
                  <div>
                    <select
                      value={totalPricePaidUnit}
                      onChange={(e) => setTotalPricePaidUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-brand-navy bg-brand-bg-card border border-brand-border-mid rounded-[10px] outline-none transition-all duration-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 appearance-none bg-no-repeat bg-[right_14px_center] cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                    >
                      <option value="Cr">Cr</option>
                      <option value="Lakh">Lakh</option>
                      <option value="₹">₹</option>
                    </select>
                  </div>
                </div>

                <SectionHeader
                  number="C"
                  title="Unit Details (Fields 10 – 12)"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={10} active={!!form.floorNumber} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Floor Number
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.floorNumber}
                      onChange={set("floorNumber")}
                      placeholder="e.g. 12"
                      type="number"
                    />
                  </div>
                  <div>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={11} active={!!form.parkingSpots} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Parking Spots
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.parkingSpots}
                      onChange={(val) => {
                        if (val !== "" && Number(val) < 0) return;
                        set("parkingSpots")(val);
                      }}
                      placeholder="e.g. 2"
                      type="number"
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mb-1.5">
                  <FieldBadge n={12} active={!!form.possessionStatus} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Possession Status <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <div className="flex gap-3 mb-5">
                  {["Already Taken", "Expected in Future"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("possessionStatus")(opt)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border-[1.5px] font-semibold text-xs cursor-pointer transition-all duration-180 ${
                        form.possessionStatus === opt 
                          ? "border-brand-amber bg-brand-amber-bg text-brand-amber" 
                          : "border-brand-border-mid bg-brand-bg-card text-brand-slate hover:bg-brand-bg-alt"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!required1) {
                      setError(
                        "Please fill all required fields in this section.",
                      );
                      return;
                    }
                    setError("");
                    setSection(2);
                  }}
                  className={`w-full py-3.5 rounded-xl border-none font-bold text-[15px] text-white transition-all duration-220 flex items-center justify-center gap-3 ${
                    required1 
                      ? "bg-linear-to-r from-brand-amber-light to-[#EA580C] shadow-brand-amber cursor-pointer hover:-translate-y-[1px]" 
                      : "bg-brand-slate-light cursor-not-allowed"
                  }`}
                >
                  Continue to Loan & Alerts <ArrowRight size={16} />
                </button>
                {error && (
                  <p className="text-xs text-brand-red text-center mt-2.5">
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {section === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SectionHeader
                  number="D"
                  title="Possession Dates (Fields 13 – 14)"
                />

                {form.possessionStatus === "Already Taken" && (
                  <>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={13} active={!!form.possessionDateMonth} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Possession Date (Taken)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <Select
                        label=""
                        value={form.possessionDateMonth}
                        onChange={set("possessionDateMonth")}
                        options={MONTHS}
                        placeholder="Month"
                      />
                      <Select
                        label=""
                        value={form.possessionDateYear}
                        onChange={set("possessionDateYear")}
                        options={YEARS_PAST}
                        placeholder="Year"
                      />
                    </div>
                  </>
                )}

                {form.possessionStatus === "Expected in Future" && (
                  <>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge
                        n={14}
                        active={!!form.expectedPossessionMonth}
                      />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Expected Possession Date
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <Select
                        label=""
                        value={form.expectedPossessionMonth}
                        onChange={set("expectedPossessionMonth")}
                        options={MONTHS}
                        placeholder="Month"
                      />
                      <Select
                        label=""
                        value={form.expectedPossessionYear}
                        onChange={set("expectedPossessionYear")}
                        options={YEARS_FUTURE}
                        placeholder="Year"
                      />
                    </div>
                  </>
                )}

                <SectionHeader
                  number="E"
                  title="Current Use & Loan (Fields 15 – 18)"
                />

                <div className="flex gap-3 mb-1.5">
                  <FieldBadge n={15} active={!!form.currentUse} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Current Use <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {USE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("currentUse")(opt)}
                      className={`py-2.5 px-3 rounded-lg border-[1.5px] font-semibold text-xs cursor-pointer transition-all duration-180 ${
                        form.currentUse === opt 
                          ? "border-brand-amber bg-brand-amber-bg text-brand-amber" 
                          : "border-brand-border-mid bg-brand-bg-card text-brand-slate hover:bg-brand-bg-alt"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mb-2">
                  <FieldBadge n={16} active={!!form.ongoingLoan} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Ongoing Loan? <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <Toggle
                  label=""
                  value={form.ongoingLoan}
                  onChange={set("ongoingLoan")}
                  required
                />

                {form.ongoingLoan === "Yes" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex gap-3 mb-1.5">
                        <FieldBadge n={17} active={!!form.bankName} />
                        <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                          Bank Name
                        </span>
                      </div>
                      <Select
                        label=""
                        value={form.bankName}
                        onChange={set("bankName")}
                        options={BANKS}
                        placeholder="Select bank"
                      />
                    </div>
                    <div>
                      <div className="flex gap-3 mb-1.5">
                        <FieldBadge n={18} active={!!form.monthlyEMI} />
                        <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                          Monthly EMI (₹)
                        </span>
                      </div>
                      <Input
                        label=""
                        value={form.monthlyEMI}
                        onChange={set("monthlyEMI")}
                        placeholder="e.g. 55000"
                        type="number"
                        prefix="₹"
                      />
                    </div>
                  </div>
                )}

                <SectionHeader
                  number="F"
                  title="Rental Income (Fields 19 – 20)"
                />

                <div className="flex gap-3 mb-2">
                  <FieldBadge n={19} active={!!form.rentalIncome} />
                  <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                    Rental Income? <span className="text-brand-amber">*</span>
                  </span>
                </div>
                <Toggle
                  label=""
                  value={form.rentalIncome}
                  onChange={set("rentalIncome")}
                  required
                />

                {form.rentalIncome === "Yes" && (
                  <>
                    <div className="flex gap-3 mb-1.5">
                      <FieldBadge n={20} active={!!form.monthlyRent} />
                      <span className="text-xs font-semibold text-brand-navy-mid pt-1.5">
                        Monthly Rent (₹)
                      </span>
                    </div>
                    <Input
                      label=""
                      value={form.monthlyRent}
                      onChange={set("monthlyRent")}
                      placeholder="e.g. 50000"
                      type="number"
                      prefix="₹"
                    />
                  </>
                )}

                <SectionHeader
                  number="G"
                  title="Alert Preferences (Fields 21 – 24)"
                />
                <p className="text-xs text-brand-slate mb-3.5 leading-relaxed">
                  Choose what you want us to monitor daily for fraud alerts, RERA
                  actions, news & more.
                </p>

                <AlertToggle
                  label={`Alert: Builder — ${form.builderName || "Your Builder"}`}
                  sublabel="Monitor builder name in news & RERA"
                  value={form.alertBuilder}
                  onChange={set("alertBuilder")}
                />
                <AlertToggle
                  label={`Alert: Project — ${form.projectName || "Your Project"}`}
                  sublabel="Monitor project name in news"
                  value={form.alertProject}
                  onChange={set("alertProject")}
                />
                <AlertToggle
                  label={`Alert: City — ${form.city || "Your City"}`}
                  sublabel="City-level real estate news"
                  value={form.alertCity}
                  onChange={set("alertCity")}
                />
                <AlertToggle
                  label="Alert: State"
                  sublabel="State-level real estate & RERA news"
                  value={form.alertState}
                  onChange={set("alertState")}
                />

                {error && (
                  <div className="p-3.5 rounded-lg bg-brand-red-bg border border-brand-red-border mb-3.5">
                    <p className="text-xs text-brand-red font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setSection(1)}
                    className="flex-[0_0_44px] h-12 rounded-xl border-[1.5px] border-brand-border-mid bg-brand-bg-card text-brand-slate cursor-pointer flex items-center justify-center hover:bg-brand-bg-alt transition-colors duration-200"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`flex-1 h-12 rounded-xl border-none font-bold text-[15px] text-white flex items-center justify-center gap-3 transition-all duration-220 ${
                      submitting ? "cursor-not-allowed" : "cursor-pointer"
                    } ${
                      required2 
                        ? "bg-linear-to-r from-brand-amber-light to-[#EA580C] shadow-brand-amber hover:-translate-y-[1px]" 
                        : "bg-brand-slate-light cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Shield size={16} /> Track My Portfolio
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-brand-slate-light text-center mt-2.5">
                  Submitting will open your live DRAF Dashboard
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FlowContext.Provider>
  );
}
