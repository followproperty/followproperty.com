"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES, CITY_TO_STATE } from "@/constants/admin/cities";

export default function ProjectForm({ mode = "create", initialData = null, onSubmitSuccess }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // --- Form States ---
  const [projectName, setProjectName] = useState("");
  const [builderName, setBuilderName] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [location, setLocation] = useState("");

  const [bhk, setBhk] = useState([]);
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");

  const [minPriceVal, setMinPriceVal] = useState("");
  const [minPriceUnit, setMinPriceUnit] = useState("Cr");
  const [maxPriceVal, setMaxPriceVal] = useState("");
  const [maxPriceUnit, setMaxPriceUnit] = useState("Cr");

  const [status, setStatus] = useState("Under Construction");
  const [possessionYear, setPossessionYear] = useState("2026");

  // --- Optional Extra Specifications Form States ---
  const [isLocationEdited, setIsLocationEdited] = useState(false);
  const [launchedDate, setLaunchedDate] = useState("");
  const [launchingPrice, setLaunchingPrice] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [units, setUnits] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [towers, setTowers] = useState("");
  const [apartmentsPerFloor, setApartmentsPerFloor] = useState("");
  const [perSqftRate, setPerSqftRate] = useState("");
  const [perSqftRentalAvg, setPerSqftRentalAvg] = useState("");
  const [monthlyRentRange, setMonthlyRentRange] = useState("");
  const [avgAreaSqft, setAvgAreaSqft] = useState("");
  const [gps, setGps] = useState("");
  const [unitSize, setUnitSize] = useState("");

  // --- Preload Initial Data in Edit Mode ---
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setProjectName(initialData.projectName || "");
      setBuilderName(initialData.builderName || "");
      setPropertyType(initialData.propertyType || "Residential");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setLocality(initialData.locality || "");
      setLocation(initialData.location || "");
      setBhk(initialData.bhk || []);
      setMinArea(initialData.minArea !== undefined ? String(initialData.minArea) : "");
      setMaxArea(initialData.maxArea !== undefined ? String(initialData.maxArea) : "");
      setStatus(initialData.status || "Under Construction");
      setPossessionYear(initialData.possessionYear !== undefined ? String(initialData.possessionYear) : "2026");

      // Unpack minPrice (stored as absolute Rupees in DB)
      if (initialData.minPrice) {
        if (initialData.minPrice >= 10000000) {
          setMinPriceVal(String(initialData.minPrice / 10000000));
          setMinPriceUnit("Cr");
        } else {
          setMinPriceVal(String(initialData.minPrice / 100000));
          setMinPriceUnit("Lakh");
        }
      }

      // Unpack maxPrice (stored as absolute Rupees in DB)
      if (initialData.maxPrice) {
        if (initialData.maxPrice >= 10000000) {
          setMaxPriceVal(String(initialData.maxPrice / 10000000));
          setMaxPriceUnit("Cr");
        } else {
          setMaxPriceVal(String(initialData.maxPrice / 100000));
          setMaxPriceUnit("Lakh");
        }
      }

      // Optional specifications fields
      setLaunchedDate(initialData.launchedDate || "");
      setLaunchingPrice(initialData.launchingPrice || "");
      setPossessionDate(initialData.possessionDate || "");
      setUnits(initialData.units || "");
      setTotalArea(initialData.totalArea || "");
      setTowers(initialData.towers || "");
      setApartmentsPerFloor(initialData.apartmentsPerFloor || "");
      setPerSqftRate(initialData.perSqftRate || "");
      setPerSqftRentalAvg(initialData.perSqftRentalAvg || "");
      setMonthlyRentRange(initialData.monthlyRentRange || "");
      setAvgAreaSqft(initialData.avgAreaSqft || "");
      setGps(initialData.gps || "");
      setUnitSize(initialData.unitSize || "");

      setIsLocationEdited(true); // Prevents overriding during edit edits
    }
  }, [mode, initialData]);

  // --- Automatic State & Location Mappings ---
  useEffect(() => {
    if (city) {
      const mappedState = CITY_TO_STATE[city] || "";
      setState(mappedState);
      
      // Auto-build address candidates if not customized manually
      if (!isLocationEdited && locality) {
        setLocation(`${locality}, ${city}, ${mappedState}`);
      }
    }
  }, [city, locality, isLocationEdited]);

  // Handle BHK Multi-checkboxes toggling
  const handleBhkChange = (val) => {
    if (bhk.includes(val)) {
      setBhk(bhk.filter((b) => b !== val));
    } else {
      setBhk([...bhk, val].sort((a, b) => a - b));
    }
  };

  // Convert raw value + Cr/Lakh unit back to absolute Rupees
  const getAbsolutePrice = (val, unit) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    if (unit === "Cr") return Math.round(num * 10000000);
    if (unit === "Lakh") return Math.round(num * 100000);
    return Math.round(num);
  };

  // Validation before going to the next step
  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!projectName.trim()) return "Project Name is required";
      if (!builderName.trim()) return "Builder Name is required";
      if (!propertyType) return "Property Type is required";
    }
    if (step === 2) {
      if (!city) return "City is required";
      if (!locality.trim()) return "Locality/Sector is required";
      if (!location.trim()) return "Full Location address is required";
    }
    if (step === 3) {
      if (propertyType === "Residential" && bhk.length === 0) {
        return "At least one BHK configuration must be selected for Residential properties";
      }
      const minA = parseInt(minArea, 10);
      const maxA = parseInt(maxArea, 10);
      if (isNaN(minA) || minA <= 0 || isNaN(maxA) || maxA <= 0) {
        return "Min and Max Area must be valid positive numbers";
      }
      if (maxA < minA) {
        return "Maximum Area cannot be less than Minimum Area";
      }
    }
    if (step === 4) {
      const minP = parseFloat(minPriceVal);
      const maxP = parseFloat(maxPriceVal);
      if (isNaN(minP) || minP <= 0 || isNaN(maxP) || maxP <= 0) {
        return "Prices must be positive numbers";
      }
      const absMin = getAbsolutePrice(minPriceVal, minPriceUnit);
      const absMax = getAbsolutePrice(maxPriceVal, maxPriceUnit);
      if (absMax < absMin) {
        return "Maximum Price cannot be less than Minimum Price";
      }
    }
    if (step === 5) {
      if (status === "Under Construction") {
        const year = parseInt(possessionYear, 10);
        if (isNaN(year) || year < 2024 || year > 2035) {
          return "Please select a valid future possession year";
        }
      }
    }
    return "";
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 6) {
      handleNext();
      return;
    }
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError("");

    const absMinPrice = getAbsolutePrice(minPriceVal, minPriceUnit);
    const absMaxPrice = getAbsolutePrice(maxPriceVal, maxPriceUnit);
    const payload = {
      projectName,
      builderName,
      propertyType,
      status,
      city,
      locality,
      location,
      bhk: propertyType === "Residential" ? bhk : [],
      minPrice: absMinPrice,
      maxPrice: absMaxPrice,
      minArea: parseInt(minArea, 10),
      maxArea: parseInt(maxArea, 10),
      possessionYear: status === "Ready to Move" ? 0 : parseInt(possessionYear, 10),
      // Optional fields
      launchedDate,
      launchingPrice,
      possessionDate,
      units,
      totalArea,
      towers,
      apartmentsPerFloor,
      perSqftRate,
      perSqftRentalAvg,
      monthlyRentRange,
      avgAreaSqft,
      gps,
      unitSize
    };

    try {
      const url = mode === "edit" ? `/api/admin/upcoming-projects/${initialData._id}` : "/api/admin/upcoming-projects";
      const method = mode === "edit" ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessData(data);
        if (onSubmitSuccess) {
          setTimeout(() => {
            onSubmitSuccess();
          }, 1500);
        }
      } else {
        setError(data.error || "Failed to save project. Please verify all inputs.");
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setBuilderName("");
    setPropertyType("Residential");
    setCity("");
    setState("");
    setLocality("");
    setLocation("");
    setBhk([]);
    setMinArea("");
    setMaxArea("");
    setMinPriceVal("");
    setMaxPriceVal("");
    setStatus("Under Construction");
    setPossessionYear("2026");
    setLaunchedDate("");
    setLaunchingPrice("");
    setPossessionDate("");
    setUnits("");
    setTotalArea("");
    setTowers("");
    setApartmentsPerFloor("");
    setPerSqftRate("");
    setPerSqftRentalAvg("");
    setMonthlyRentRange("");
    setAvgAreaSqft("");
    setGps("");
    setUnitSize("");
    setIsLocationEdited(false);
    setStep(1);
    setSuccessData(null);
    setError("");
  };

  // --- Render Success Dashboard Panel ---
  if (successData) {
    const nv = successData.normalizedValues;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(16,185,129,0.06)] animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase">Save Confirmed</span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {mode === "edit" ? "Project Updated Successfully" : "Project Saved Successfully"}
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">Ingestion Metadata</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Collection:</span>
                  <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[12px]">
                    {successData.collection || "upcomingprojects"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Document ID:</span>
                  <span className="font-mono font-medium text-slate-600 truncate max-w-[200px] text-[12px]" title={successData.documentId}>
                    {successData.documentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Project Source:</span>
                  <span className="font-semibold text-slate-700">{nv.projectSource || "upcoming"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created By:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]" title={nv.createdByEmail}>
                    {nv.createdByEmail || "Admin Portal"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">Normalized Values Stored</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Project Name:</span>
                  <span className="font-semibold text-slate-900">{nv.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Builder Name:</span>
                  <span className="font-semibold text-slate-900">{nv.builderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Locality:</span>
                  <span className="font-medium">{nv.locality} ({nv.city}, {nv.state})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BHK / Config:</span>
                  <span className="font-semibold text-amber-600">{nv.propertyType === "Residential" ? nv.configuration : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prices:</span>
                  <span className="font-semibold">{nv.marketPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Area Sizes:</span>
                  <span className="font-semibold">{nv.superArea} Sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Possession:</span>
                  <span className="font-semibold">{nv.status} {nv.possessionYear > 0 ? `(${nv.possessionYear})` : ""}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-slate-100 pt-6">
            {mode === "create" ? (
              <button
                onClick={resetForm}
                className="flex items-center justify-center bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Add Another Project
              </button>
            ) : (
              <button
                onClick={onSubmitSuccess}
                className="flex items-center justify-center bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Back to Suggestions list
              </button>
            )}
            <Link
              href="/admin"
              className="flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Step Titles ---
  const stepTitles = [
    "Basic Info",
    "Location",
    "Configuration",
    "Pricing",
    "Possession",
    "Specs (Optional)"
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center w-full">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (onSubmitSuccess) onSubmitSuccess();
              else router.push("/admin");
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 mb-3 border-none bg-transparent cursor-pointer"
          >
            ← {mode === "edit" ? "Back to Search / suggestions" : "Back to Admin Portal"}
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {mode === "edit" ? "Edit Upcoming Project" : "Add Upcoming Project"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === "edit"
              ? "Modify and normalize existing dynamic ingestion record safely."
              : "Safely ingest and normalize new launching properties into the temporary testing collection."}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 tracking-wider uppercase">
            <span>Progress</span>
            <span className="text-amber-600">Step {step} of 6 — {stepTitles[step - 1]}</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
          <div className="hidden md:flex justify-between text-[11px] text-slate-400 font-medium mt-1">
            {stepTitles.map((t, idx) => (
              <span
                key={idx}
                className={idx + 1 === step ? "text-amber-600 font-bold" : idx + 1 < step ? "text-slate-500" : ""}
              >
                {idx + 1}. {t}
              </span>
            ))}
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div className="flex-1 min-h-[250px] mb-8">
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. DLF The Skycourt"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Builder Name</label>
                  <input
                    type="text"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    placeholder="e.g. DLF"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                    <option value="Farmhouse">Farmhouse</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    >
                      <option value="">Select city context...</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">State (Auto-mapped)</label>
                    <input
                      type="text"
                      value={state}
                      readOnly
                      placeholder="State maps automatically"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Locality / Sector</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Sector 82"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Full Ingestion Location Address</label>
                    <button
                      type="button"
                      onClick={() => setIsLocationEdited(true)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      Override manually
                    </button>
                  </div>
                  <textarea
                    value={location}
                    onChange={(e) => {
                      setIsLocationEdited(true);
                      setLocation(e.target.value);
                    }}
                    placeholder="Full ingestion location..."
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300 min-h-[80px]"
                  />
                  {!isLocationEdited && city && locality && (
                    <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                      {/* ✨ Dynamically generated from City + Locality choice. */}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Configuration */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {propertyType === "Residential" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      BHK Configurations
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        const active = bhk.includes(num);
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleBhkChange(num)}
                            className={`px-5 py-3.5 rounded-2xl text-xs md:text-sm font-bold border transition-all cursor-pointer ${
                              active
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {num} BHK
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Super Built-up Area Range (Sqft)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      placeholder="Min Area (e.g. 1800)"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                    <input
                      type="number"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      placeholder="Max Area (e.g. 2800)"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Pricing */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Market Price Range Valuations
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Min Price */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={minPriceVal}
                      onChange={(e) => setMinPriceVal(e.target.value)}
                      placeholder="Min Price (e.g. 3.5)"
                      required
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                    <select
                      value={minPriceUnit}
                      onChange={(e) => setMinPriceUnit(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="Cr">Cr</option>
                      <option value="Lakh">Lakh</option>
                    </select>
                  </div>

                  {/* Max Price */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={maxPriceVal}
                      onChange={(e) => setMaxPriceVal(e.target.value)}
                      placeholder="Max Price (e.g. 7)"
                      required
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                    <select
                      value={maxPriceUnit}
                      onChange={(e) => setMaxPriceUnit(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="Cr">Cr</option>
                      <option value="Lakh">Lakh</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Possession */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Construction Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                  </select>
                </div>

                {status === "Under Construction" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Possession Year</label>
                    <select
                      value={possessionYear}
                      onChange={(e) => setPossessionYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[13px] text-emerald-800 font-medium">
                    ℹ Possession Year is automatically set to `0` (Ready) for `"Ready to Move"` project status.
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Specs (Optional Extra Details) */}
            {step === 6 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Launched Date</label>
                    <input
                      type="text"
                      value={launchedDate}
                      onChange={(e) => setLaunchedDate(e.target.value)}
                      placeholder="e.g. Feb 2024"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Launching Price</label>
                    <input
                      type="text"
                      value={launchingPrice}
                      onChange={(e) => setLaunchingPrice(e.target.value)}
                      placeholder="e.g. ~10,500/sqft"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Possession Date</label>
                    <input
                      type="text"
                      value={possessionDate}
                      onChange={(e) => setPossessionDate(e.target.value)}
                      placeholder="e.g. Dec 2026"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Units</label>
                    <input
                      type="text"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      placeholder="e.g. 520"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Area (Acres)</label>
                    <input
                      type="text"
                      value={totalArea}
                      onChange={(e) => setTotalArea(e.target.value)}
                      placeholder="e.g. 14.5 Acres"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Towers</label>
                    <input
                      type="text"
                      value={towers}
                      onChange={(e) => setTowers(e.target.value)}
                      placeholder="e.g. 6 Towers"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Apartments Per Floor</label>
                    <input
                      type="text"
                      value={apartmentsPerFloor}
                      onChange={(e) => setApartmentsPerFloor(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Per Sqft Rate (₹)</label>
                    <input
                      type="text"
                      value={perSqftRate}
                      onChange={(e) => setPerSqftRate(e.target.value)}
                      placeholder="e.g. ₹11,200/sqft"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rental Avg (₹/sqft)</label>
                    <input
                      type="text"
                      value={perSqftRentalAvg}
                      onChange={(e) => setPerSqftRentalAvg(e.target.value)}
                      placeholder="e.g. ₹35 - ₹45 / sqft"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Rent Range (₹)</label>
                    <input
                      type="text"
                      value={monthlyRentRange}
                      onChange={(e) => setMonthlyRentRange(e.target.value)}
                      placeholder="e.g. ₹45k - ₹65k"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Size (Sqft)</label>
                    <input
                      type="text"
                      value={avgAreaSqft}
                      onChange={(e) => setAvgAreaSqft(e.target.value)}
                      placeholder="e.g. 2,150 Sqft"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">GPS Coordinates</label>
                    <input
                      type="text"
                      value={gps}
                      onChange={(e) => setGps(e.target.value)}
                      placeholder="e.g. 28.3948, 76.9583"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Sizes Detail</label>
                    <input
                      type="text"
                      value={unitSize}
                      onChange={(e) => setUnitSize(e.target.value)}
                      placeholder="e.g. 1960 - 3250 Sqft"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Navigation Buttons */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-amber-500 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-amber-600 transition-colors cursor-pointer shadow-sm"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors disabled:opacity-75 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{mode === "edit" ? "Save Changes" : "Save Project"}</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}