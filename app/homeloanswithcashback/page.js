"use client";

import React, { useState, useEffect } from "react";
import Nav from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { statesList, indiaStatesCities } from "@/constants/indiaStatesCities";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  CirclePercent, 
  Landmark, 
  Zap, 
  ShieldCheck 
} from "lucide-react";

export default function HomeLoansWithCashbackPage() {
  const { showToast } = useToast();
  
  // Auth state tracking
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
    hasPortfolio: false,
    hasWatchlist: false
  });

  // DB Builders & Projects list
  const [dbBuilders, setDbBuilders] = useState([]);
  const [builderInputMode, setBuilderInputMode] = useState("dropdown"); // "dropdown" or "manual"
  const [projectInputMode, setProjectInputMode] = useState("dropdown"); // "dropdown" or "manual"

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

          // Pre-fill contact details if authenticated
          setFormData(prev => ({
            ...prev,
            fullName: `${currentUser.displayName || ""}`.trim(),
            emailAddress: currentUser.email || ""
          }));
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

  // Fetch unique builders and projects list on mount
  useEffect(() => {
    const fetchBuildersAndProjects = async () => {
      try {
        const res = await fetch("/api/homeloanapplications/builders");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDbBuilders(json.data);
          // If we successfully get a list, default to dropdown selector
          setBuilderInputMode("dropdown");
          setProjectInputMode("dropdown");
        } else {
          // If endpoint fails or database has no projects, fall back to manual input mode
          setBuilderInputMode("manual");
          setProjectInputMode("manual");
        }
      } catch (err) {
        console.error("Failed to load builders/projects list:", err);
        setBuilderInputMode("manual");
        setProjectInputMode("manual");
      }
    };
    fetchBuildersAndProjects();
  }, []);

  // Form State
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    // Property Details
    propertyPurpose: "",
    propertyType: "",
    state: "",
    city: "",
    customCity: "",
    builder: "",
    project: "",
    propertyValue: "",
    propertyStatus: "",

    // Loan Requirement
    requiredLoanAmount: "",
    downPaymentAvailable: "",
    preferredLoanTenure: "",
    preferredBank: "",
    preferredInterestRate: "",

    // Employment Details
    employmentType: "",
    monthlyNetIncome: "",
    totalWorkExperience: "",
    employerOrBusinessName: "",

    // Existing Liabilities
    existingMonthlyEmi: "",
    existingHomeLoan: "No",
    existingHomeLoanOutstanding: "",
    existingHomeLoanBank: "",

    // Co-applicant
    coApplicant: "No",
    coApplicantMonthlyIncome: "",

    // Credit Profile
    approximateCreditScore: "",

    // Contact Details
    fullName: "",
    mobileNumber: "",
    emailAddress: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formatting and Input Helpers
  const formatToIndianCurrency = (digitsStr) => {
    if (!digitsStr) return "";
    const num = parseInt(digitsStr, 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleCurrencyChange = (fieldName, rawValue) => {
    const digits = rawValue.replace(/\D/g, "");
    setFormData(prev => ({
      ...prev,
      [fieldName]: digits
    }));
    // Clear error
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Helper to dynamically inject error boundary styling on inputs
  const getInputClassName = (fieldName, isSelect = false) => {
    const hasError = formErrors[fieldName];
    const baseClass = "form-input h-12 font-medium transition-all duration-200";
    const errorClass = hasError
      ? "border-brand-red bg-brand-red-bg/20 focus:border-brand-red focus:ring-brand-red-border/30"
      : "border-brand-border-mid focus:border-brand-blue focus:ring-brand-blue-glow";
    const selectClass = isSelect ? "appearance-none bg-no-repeat bg-[right_14px_center] pr-10 cursor-pointer" : "";
    return `${baseClass} ${errorClass} ${selectClass} text-brand-navy`;
  };

  // Step 1 Validation: Only Property Purpose, Property Type, City, Property Value, and Required Loan Amount are mandatory
  const validateStep1 = () => {
    const errors = {};
    const requiredStep1 = [
      { name: "propertyPurpose", label: "Property Purpose" },
      { name: "propertyType", label: "Property Type" },
      { name: "city", label: "City" },
      { name: "propertyValue", label: "Property Market Value / Cost" },
      { name: "requiredLoanAmount", label: "Required Loan Amount" }
    ];

    requiredStep1.forEach(field => {
      if (!formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    if (formData.city === "Other" && !formData.customCity?.trim()) {
      errors.customCity = "Please enter your city name";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation: Check all mandatory Step 2 fields
  const validateStep2 = () => {
    const errors = {};
    // Note: existingMonthlyEmi is now optional and will not block validation
    const requiredStep2 = [
      { name: "employmentType", label: "Employment Type" },
      { name: "monthlyNetIncome", label: "Monthly Net Income" },
      { name: "totalWorkExperience", label: "Total Work Experience" },
      { name: "employerOrBusinessName", label: "Employer / Business Name" },
      { name: "approximateCreditScore", label: "Approximate Credit Score" },
      { name: "fullName", label: "Full Name" },
      { name: "mobileNumber", label: "Mobile Number" },
      { name: "emailAddress", label: "Email Address" }
    ];

    requiredStep2.forEach(field => {
      if (!formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    if (formData.existingHomeLoan === "Yes" && !formData.existingHomeLoanOutstanding?.trim()) {
      errors.existingHomeLoanOutstanding = "Outstanding Loan Amount is required";
    }

    if (formData.coApplicant === "Yes" && !formData.coApplicantMonthlyIncome?.trim()) {
      errors.coApplicantMonthlyIncome = "Co-applicant Monthly Income is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailAddress && !emailRegex.test(formData.emailAddress.trim())) {
      errors.emailAddress = "Please enter a valid email address";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.mobileNumber && !phoneRegex.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setActiveStep(2);
      // Smoothly scroll to the form card header
      const formCard = document.getElementById("form-card");
      if (formCard) {
        formCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      showToast("Please fill in the required fields to continue.", "error", "Required Fields Missing");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateStep2()) {
      showToast("Please fill in the required applicant details before submitting.", "error", "Required Fields Missing");
      // Find the first error element and scroll to it
      const firstErrorKey = Object.keys(formErrors)[0];
      const errorEl = document.getElementById(`field-${firstErrorKey}`);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCity = formData.city === "Other" ? formData.customCity.trim() : formData.city.trim();
      
      const res = await fetch("/api/homeloanapplications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          emailAddress: formData.emailAddress.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          city: finalCity,
          state: formData.state || null,
          propertyPurpose: formData.propertyPurpose,
          propertyType: formData.propertyType,
          builder: formData.builder || null,
          project: formData.project || null,
          propertyValue: formData.propertyValue,
          propertyStatus: formData.propertyStatus || null,
          requiredLoanAmount: formData.requiredLoanAmount,
          downPaymentAvailable: formData.downPaymentAvailable || null,
          preferredLoanTenure: formData.preferredLoanTenure ? parseInt(formData.preferredLoanTenure, 10) : null,
          preferredBank: formData.preferredBank || null,
          preferredInterestRate: formData.preferredInterestRate ? parseFloat(formData.preferredInterestRate) : null,
          employmentType: formData.employmentType,
          monthlyNetIncome: formData.monthlyNetIncome,
          totalWorkExperience: formData.totalWorkExperience,
          employerOrBusinessName: formData.employerOrBusinessName,
          existingMonthlyEmi: formData.existingMonthlyEmi || 0,
          existingHomeLoan: formData.existingHomeLoan === "Yes",
          existingHomeLoanOutstanding: formData.existingHomeLoan === "Yes" ? formData.existingHomeLoanOutstanding : null,
          existingHomeLoanBank: formData.existingHomeLoan === "Yes" ? formData.existingHomeLoanBank : null,
          coApplicant: formData.coApplicant === "Yes",
          coApplicantMonthlyIncome: formData.coApplicant === "Yes" ? formData.coApplicantMonthlyIncome : null,
          approximateCreditScore: formData.approximateCreditScore,
          source: "homeloanswithcashback"
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit loan lead registration.");
      }

      setIsSuccess(true);
      showToast("Home Loan Application submitted successfully!", "success", "Submitted");
    } catch (err) {
      console.error("Error submitting loan application:", err);
      showToast(err.message || "An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Dropdown arrow style
  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  };

  // Find filtered projects list based on builder select
  const getProjectsForSelectedBuilder = () => {
    if (!formData.builder) return [];
    const matched = dbBuilders.find(b => b.builder === formData.builder);
    return matched ? matched.projects : [];
  };

  return (
    <div className="bg-brand-bg min-h-screen font-sans antialiased overflow-x-hidden max-w-full flex flex-col">
      {/* Navigation Header */}
      <Nav authState={authState} />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Hero and Benefits */}
          <div className="lg:col-span-5 text-left lg:sticky lg:top-28 space-y-8 py-4">
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full border border-brand-blue-border bg-brand-blue-bg text-brand-blue-dark text-[10px] md:text-[11px] font-bold tracking-wider uppercase shadow-inner">
                <CirclePercent size={13} className="text-brand-blue animate-pulse" />
                Exclusive Cashback Offers
              </div>
              <div className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full border border-brand-amber-border bg-brand-amber-bg text-brand-amber text-[10px] md:text-[11px] font-bold tracking-wider uppercase shadow-inner">
                Approved Fintech Partner Coming Soon
              </div>
            </div>

            {/* Core Titles */}
            <div className="space-y-4">
              <h1 className="text-[clamp(36px,5vw,52px)] font-extrabold tracking-tight leading-[1.08] text-brand-navy">
                Home Loans with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-blue-deep">Cashback</span>
              </h1>

              <h2 className="text-xl md:text-2xl font-bold text-brand-blue tracking-tight">
                Apply for a Home Loan from Us
              </h2>

              <p className="text-sm md:text-base text-brand-slate leading-relaxed max-w-lg">
                Get expert assistance in finding the right home loan with exclusive cashback offers. Our approved fintech partner is coming soon. Submit your requirements and our team will get back to you within 7 days.
              </p>
            </div>

            {/* Action-Oriented Benefit Cards - Hidden on Mobile, Displayed on Desktop */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8 border-t border-brand-border">
              {[
                { title: "Claim Cashback", desc: "Cashback on Eligible Home Loans", icon: <CirclePercent className="text-brand-blue" size={20} /> },
                { title: "Compare Quotes", desc: "Multiple Banking Partners", icon: <Landmark className="text-brand-blue" size={20} /> },
                { title: "Get Loan Help", desc: "Dedicated Loan Assistance", icon: <Zap className="text-brand-blue" size={20} /> },
                { title: "Quick Decisions", desc: "Response Within 7 Days", icon: <ShieldCheck className="text-brand-blue" size={20} /> }
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-brand-border shadow-xs hover:shadow-brand transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-bg flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">{benefit.title}</h3>
                    <p className="text-xs text-brand-slate font-medium leading-relaxed m-0">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form Wizard Card */}
          <div className="lg:col-span-7" id="form-card">
            {isSuccess ? (
              <div className="bg-white border border-brand-border rounded-2xl shadow-brand-md p-8 md:p-12 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-brand-emerald-bg text-brand-emerald border border-brand-emerald/10 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                    Application Submitted Successfully
                  </h2>
                  <div className="text-sm text-brand-slate max-w-md mx-auto leading-relaxed font-medium space-y-2">
                    <p>Thank you for applying.</p>
                    <p>Our home loan specialist will review your application and contact you within 7 days.</p>
                    <p className="text-brand-blue font-bold">If eligible, we'll also share cashback details during the process.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setActiveStep(1);
                      setFormData({
                        propertyPurpose: "",
                        propertyType: "",
                        state: "",
                        city: "",
                        customCity: "",
                        builder: "",
                        project: "",
                        propertyValue: "",
                        propertyStatus: "",
                        requiredLoanAmount: "",
                        downPaymentAvailable: "",
                        preferredLoanTenure: "",
                        preferredBank: "",
                        preferredInterestRate: "",
                        employmentType: "",
                        monthlyNetIncome: "",
                        totalWorkExperience: "",
                        employerOrBusinessName: "",
                        existingMonthlyEmi: "",
                        existingHomeLoan: "No",
                        existingHomeLoanOutstanding: "",
                        existingHomeLoanBank: "",
                        coApplicant: "No",
                        coApplicantMonthlyIncome: "",
                        approximateCreditScore: "",
                        fullName: authState?.isAuthenticated ? formData.fullName : "",
                        mobileNumber: "",
                        emailAddress: authState?.isAuthenticated ? formData.emailAddress : ""
                      });
                    }}
                    className="btn-secondary px-6 py-3 text-xs tracking-wider font-bold rounded-xl h-12"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-brand-border rounded-2xl shadow-brand-md p-6 sm:p-8 md:p-10">
                
                {/* Progress Indicator */}
                <div className="mb-8 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-slate uppercase tracking-wider">
                    <span className="font-extrabold">Step {activeStep} of 2</span>
                    {activeStep === 1 && (
                      <span className="text-[10px] text-brand-emerald font-extrabold normal-case tracking-normal flex items-center gap-1.5">
                        ⏱ Takes less than 2 minutes
                      </span>
                    )}
                    <span className="text-brand-blue font-extrabold">{activeStep === 1 ? "Property & Loan Details" : "Applicant Details"}</span>
                  </div>
                  <div className="w-full h-2 bg-brand-bg-alt rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-blue transition-all duration-300 ease-in-out rounded-full" 
                      style={{ width: activeStep === 1 ? "50%" : "100%" }}
                    />
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-8">
                  
                  {/* CSS-Only Transitions between Step 1 and Step 2 */}
                  <div className="transition-all duration-300 ease-in-out">
                    
                    {/* STEP 1: Property & Loan Details */}
                    {activeStep === 1 && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        
                        {/* Section: Property Details */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Property Details
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-propertyPurpose">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Property Purpose <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <select
                                value={formData.propertyPurpose}
                                onChange={(e) => handleInputChange("propertyPurpose", e.target.value)}
                                className={getInputClassName("propertyPurpose", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Purpose...</option>
                                <option value="Purchase of Ready Property">Purchase of Ready Property</option>
                                <option value="Purchase of Under-Construction Property">Purchase of Under-Construction Property</option>
                                <option value="Construction on own land">Construction on own land</option>
                                <option value="Home Renovation/Extension">Home Renovation/Extension</option>
                                <option value="Balance Transfer">Balance Transfer</option>
                              </select>
                              {formErrors.propertyPurpose && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.propertyPurpose}</p>}
                            </div>

                            <div id="field-propertyType">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Property Type <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <select
                                value={formData.propertyType}
                                onChange={(e) => handleInputChange("propertyType", e.target.value)}
                                className={getInputClassName("propertyType", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Type...</option>
                                <option value="Apartment / Flat">Apartment / Flat</option>
                                <option value="Independent Villa / House">Independent Villa / House</option>
                                <option value="Plot of Land">Plot of Land</option>
                                <option value="Builder Floor">Builder Floor</option>
                                <option value="Others">Others</option>
                              </select>
                              {formErrors.propertyType && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.propertyType}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-state">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                State <span className="text-brand-slate-light font-medium">(Optional)</span>
                              </label>
                              <select
                                value={formData.state}
                                onChange={(e) => {
                                  const selectedState = e.target.value;
                                  handleInputChange("state", selectedState);
                                  handleInputChange("city", "");
                                  handleInputChange("customCity", "");
                                }}
                                className={getInputClassName("state", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select State...</option>
                                {statesList.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>

                            <div id="field-city">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                City <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <select
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                disabled={!formData.state}
                                className={getInputClassName("city", true)}
                                style={selectArrowStyle}
                              >
                                {!formData.state ? (
                                  <option value="">Select State first...</option>
                                ) : (
                                  <>
                                    <option value="">Select City...</option>
                                    {(indiaStatesCities[formData.state] || []).map(ct => (
                                      <option key={ct} value={ct}>{ct}</option>
                                    ))}
                                    <option value="Other">Other...</option>
                                  </>
                                )}
                              </select>
                              {formErrors.city && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.city}</p>}
                            </div>
                          </div>

                          {/* Fallback custom text input if user selects "Other" */}
                          {formData.city === "Other" && (
                            <div id="field-customCity" className="animate-in slide-in-from-top-2 duration-200">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Enter City Name <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Type your city name"
                                value={formData.customCity}
                                onChange={(e) => handleInputChange("customCity", e.target.value)}
                                className={getInputClassName("customCity")}
                              />
                              {formErrors.customCity && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.customCity}</p>}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Builder Filter Dropdown */}
                            <div id="field-builder">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider">
                                  Builder <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </label>
                                {dbBuilders.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newMode = builderInputMode === "dropdown" ? "manual" : "dropdown";
                                      setBuilderInputMode(newMode);
                                      handleInputChange("builder", "");
                                      handleInputChange("project", "");
                                      setProjectInputMode("manual");
                                    }}
                                    className="text-[9px] font-extrabold text-brand-blue bg-transparent border-none p-0 cursor-pointer hover:underline"
                                  >
                                    {builderInputMode === "dropdown" ? "Enter Manually" : "Choose from List"}
                                  </button>
                                )}
                              </div>

                              {builderInputMode === "dropdown" && dbBuilders.length > 0 ? (
                                <select
                                  value={formData.builder}
                                  onChange={(e) => {
                                    handleInputChange("builder", e.target.value);
                                    handleInputChange("project", "");
                                    setProjectInputMode(e.target.value ? "dropdown" : "manual");
                                  }}
                                  className={getInputClassName("builder", true)}
                                  style={selectArrowStyle}
                                >
                                  <option value="">Select Builder...</option>
                                  {dbBuilders.map(b => (
                                    <option key={b.builder} value={b.builder}>{b.builder}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="e.g. Omaxe Group"
                                  value={formData.builder}
                                  onChange={(e) => handleInputChange("builder", e.target.value)}
                                  className={getInputClassName("builder")}
                                />
                              )}
                            </div>

                            {/* Project Filter Dropdown linked to Builder */}
                            <div id="field-project">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider">
                                  Project <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </label>
                                {formData.builder && builderInputMode === "dropdown" && getProjectsForSelectedBuilder().length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newMode = projectInputMode === "dropdown" ? "manual" : "dropdown";
                                      setProjectInputMode(newMode);
                                      handleInputChange("project", "");
                                    }}
                                    className="text-[9px] font-extrabold text-brand-blue bg-transparent border-none p-0 cursor-pointer hover:underline"
                                  >
                                    {projectInputMode === "dropdown" ? "Enter Manually" : "Choose from List"}
                                  </button>
                                )}
                              </div>

                              {projectInputMode === "dropdown" && formData.builder && getProjectsForSelectedBuilder().length > 0 ? (
                                <select
                                  value={formData.project}
                                  onChange={(e) => handleInputChange("project", e.target.value)}
                                  className={getInputClassName("project", true)}
                                  style={selectArrowStyle}
                                >
                                  <option value="">Select Project...</option>
                                  {getProjectsForSelectedBuilder().map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                  <option value="Other">Other / Enter manually...</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="e.g. Omaxe Eternity"
                                  value={formData.project}
                                  onChange={(e) => handleInputChange("project", e.target.value)}
                                  className={getInputClassName("project")}
                                />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-propertyValue">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Property Market Value / Cost <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 50,00,000"
                                  value={formatToIndianCurrency(formData.propertyValue)}
                                  onChange={(e) => handleCurrencyChange("propertyValue", e.target.value)}
                                  className={`${getInputClassName("propertyValue")} pl-8 font-semibold text-brand-navy-deep`}
                                />
                              </div>
                              {formErrors.propertyValue && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.propertyValue}</p>}
                            </div>

                            <div id="field-propertyStatus">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Property Status <span className="text-brand-slate-light font-medium">(Optional)</span>
                              </label>
                              <select
                                value={formData.propertyStatus}
                                onChange={(e) => handleInputChange("propertyStatus", e.target.value)}
                                className={getInputClassName("propertyStatus", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Status...</option>
                                <option value="Ready to Move">Ready to Move</option>
                                <option value="Under Construction">Under Construction</option>
                                <option value="New Launch">New Launch</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section: Loan Requirement */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Loan Requirement
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-requiredLoanAmount">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Required Loan Amount <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 45,00,000"
                                  value={formatToIndianCurrency(formData.requiredLoanAmount)}
                                  onChange={(e) => handleCurrencyChange("requiredLoanAmount", e.target.value)}
                                  className={`${getInputClassName("requiredLoanAmount")} pl-8 font-semibold text-brand-navy-deep`}
                                />
                              </div>
                              {formErrors.requiredLoanAmount && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.requiredLoanAmount}</p>}
                            </div>

                            <div id="field-downPaymentAvailable">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Down Payment Available <span className="text-brand-slate-light font-medium">(Optional)</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 5,00,000"
                                  value={formatToIndianCurrency(formData.downPaymentAvailable)}
                                  onChange={(e) => handleCurrencyChange("downPaymentAvailable", e.target.value)}
                                  className={`${getInputClassName("downPaymentAvailable")} pl-8 font-semibold text-brand-navy-deep`}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div id="field-preferredLoanTenure">
                              <label className="block sm:h-8 flex sm:items-end text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                <span>
                                  Preferred Tenure <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </span>
                              </label>
                              <select
                                value={formData.preferredLoanTenure}
                                onChange={(e) => handleInputChange("preferredLoanTenure", e.target.value)}
                                className={getInputClassName("preferredLoanTenure", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select...</option>
                                <option value="5 Years">5 Years</option>
                                <option value="10 Years">10 Years</option>
                                <option value="15 Years">15 Years</option>
                                <option value="20 Years">20 Years</option>
                                <option value="25 Years">25 Years</option>
                                <option value="30 Years">30 Years</option>
                              </select>
                            </div>

                            <div id="field-preferredBank">
                              <label className="block sm:h-8 flex sm:items-end text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                <span>
                                  Preferred Bank <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </span>
                              </label>
                              <select
                                value={formData.preferredBank}
                                onChange={(e) => handleInputChange("preferredBank", e.target.value)}
                                className={getInputClassName("preferredBank", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Bank...</option>
                                <option value="Any Bank (Best Rate)">Any Bank (Best Rate)</option>
                                <option value="SBI">State Bank of India (SBI)</option>
                                <option value="HDFC Bank">HDFC Bank</option>
                                <option value="ICICI Bank">ICICI Bank</option>
                                <option value="Axis Bank">Axis Bank</option>
                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                <option value="LIC Housing Finance">LIC Housing Finance</option>
                                <option value="Other Bank">Other Bank</option>
                              </select>
                            </div>

                            <div id="field-preferredInterestRate">
                              <label className="block sm:h-8 flex sm:items-end text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                <span>
                                  Preferred Interest Rate % <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 8.5%"
                                value={formData.preferredInterestRate}
                                onChange={(e) => handleInputChange("preferredInterestRate", e.target.value)}
                                className={getInputClassName("preferredInterestRate")}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Continue CTA Button - Premium Conversion Blue */}
                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={handleContinue}
                            className="w-full h-13 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl text-white bg-brand-blue hover:bg-brand-blue-deep shadow-[0_4px_16px_rgba(50,95,236,0.22)] hover:shadow-[0_6px_20px_rgba(50,95,236,0.32)] active:translate-y-px transition-all border-none cursor-pointer"
                          >
                            Continue <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Applicant & Contact Details */}
                    {activeStep === 2 && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        
                        {/* Section: Employment Details */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Employment Details
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-employmentType">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Employment Type <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <select
                                value={formData.employmentType}
                                onChange={(e) => handleInputChange("employmentType", e.target.value)}
                                className={getInputClassName("employmentType", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Employment...</option>
                                <option value="Salaried">Salaried</option>
                                <option value="Self-Employed Professional (Doctor, CA, etc.)">Self-Employed Professional</option>
                                <option value="Self-Employed Business Owner">Self-Employed Business Owner</option>
                                <option value="Other">Other</option>
                              </select>
                              {formErrors.employmentType && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.employmentType}</p>}
                            </div>

                            <div id="field-monthlyNetIncome">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Monthly Net Income <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="e.g. 1,00,000"
                                  value={formatToIndianCurrency(formData.monthlyNetIncome)}
                                  onChange={(e) => handleCurrencyChange("monthlyNetIncome", e.target.value)}
                                  className={`${getInputClassName("monthlyNetIncome")} pl-8 font-semibold text-brand-navy-deep`}
                                />
                              </div>
                              {formErrors.monthlyNetIncome && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.monthlyNetIncome}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-totalWorkExperience">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Total Work Experience <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <select
                                value={formData.totalWorkExperience}
                                onChange={(e) => handleInputChange("totalWorkExperience", e.target.value)}
                                className={getInputClassName("totalWorkExperience", true)}
                                style={selectArrowStyle}
                              >
                                <option value="">Select Experience...</option>
                                <option value="Under 1 Year">Under 1 Year</option>
                                <option value="1 - 3 Years">1 - 3 Years</option>
                                <option value="3 - 5 Years">3 - 5 Years</option>
                                <option value="5 - 10 Years">5 - 10 Years</option>
                                <option value="10+ Years">10+ Years</option>
                              </select>
                              {formErrors.totalWorkExperience && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.totalWorkExperience}</p>}
                            </div>

                            <div id="field-employerOrBusinessName">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Employer / Business Name <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Google or business name"
                                value={formData.employerOrBusinessName}
                                onChange={(e) => handleInputChange("employerOrBusinessName", e.target.value)}
                                className={getInputClassName("employerOrBusinessName")}
                              />
                              {formErrors.employerOrBusinessName && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.employerOrBusinessName}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Section: Existing Liabilities */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Existing Liabilities
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-existingMonthlyEmi">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Existing Monthly EMI <span className="text-brand-slate-light font-medium">(Optional)</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Optional"
                                  value={formatToIndianCurrency(formData.existingMonthlyEmi)}
                                  onChange={(e) => handleCurrencyChange("existingMonthlyEmi", e.target.value)}
                                  className={`${getInputClassName("existingMonthlyEmi")} pl-8 font-semibold text-brand-navy-deep`}
                                />
                              </div>
                            </div>

                            <div id="field-existingHomeLoan">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Existing Home Loan? <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <div className="flex gap-3.5 items-center h-12">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextVal = formData.existingHomeLoan === "Yes" ? "No" : "Yes";
                                    handleInputChange("existingHomeLoan", nextVal);
                                  }}
                                  className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                    formData.existingHomeLoan === "Yes" ? "bg-brand-blue" : "bg-brand-border-mid"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                      formData.existingHomeLoan === "Yes" ? "translate-x-5.5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                                <span className="text-sm font-extrabold text-brand-navy select-none">
                                  {formData.existingHomeLoan}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Conditional details fields if Existing Home Loan is Yes */}
                          {formData.existingHomeLoan === "Yes" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-2 duration-200">
                              <div id="field-existingHomeLoanOutstanding">
                                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                  Outstanding Loan Amount <span className="text-brand-red font-extrabold">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="e.g. 35,00,000"
                                    value={formatToIndianCurrency(formData.existingHomeLoanOutstanding)}
                                    onChange={(e) => handleCurrencyChange("existingHomeLoanOutstanding", e.target.value)}
                                    className={`${getInputClassName("existingHomeLoanOutstanding")} pl-8 font-semibold text-brand-navy-deep`}
                                  />
                                </div>
                                {formErrors.existingHomeLoanOutstanding && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.existingHomeLoanOutstanding}</p>}
                              </div>

                              <div id="field-existingHomeLoanBank">
                                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                  Bank Name <span className="text-brand-slate-light font-medium">(Optional)</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. SBI, HDFC"
                                  value={formData.existingHomeLoanBank}
                                  onChange={(e) => handleInputChange("existingHomeLoanBank", e.target.value)}
                                  className={getInputClassName("existingHomeLoanBank")}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section: Co-applicant details */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Co-applicant details
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                            <div id="field-coApplicant">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Add Co-applicant? <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <div className="flex gap-3.5 items-center h-12">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextVal = formData.coApplicant === "Yes" ? "No" : "Yes";
                                    handleInputChange("coApplicant", nextVal);
                                  }}
                                  className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                    formData.coApplicant === "Yes" ? "bg-brand-blue" : "bg-brand-border-mid"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                      formData.coApplicant === "Yes" ? "translate-x-5.5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                                <span className="text-sm font-extrabold text-brand-navy select-none">
                                  {formData.coApplicant}
                                </span>
                              </div>
                            </div>

                            {/* Conditional income field if Co-applicant is Yes */}
                            {formData.coApplicant === "Yes" && (
                              <div id="field-coApplicantMonthlyIncome" className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                  Co-applicant Monthly Income <span className="text-brand-red font-extrabold">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-[14px] text-sm text-brand-slate-light font-medium select-none pointer-events-none">₹</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="e.g. 50,000"
                                    value={formatToIndianCurrency(formData.coApplicantMonthlyIncome)}
                                    onChange={(e) => handleCurrencyChange("coApplicantMonthlyIncome", e.target.value)}
                                    className={`${getInputClassName("coApplicantMonthlyIncome")} pl-8 font-semibold text-brand-navy-deep`}
                                  />
                                </div>
                                {formErrors.coApplicantMonthlyIncome && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.coApplicantMonthlyIncome}</p>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section: Contact Details (Secure) - Moved up as requested */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2 flex items-center gap-1.5">
                            <Lock size={13} className="text-brand-slate" /> Contact Details (Secure)
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div id="field-fullName">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Full Name <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                className={getInputClassName("fullName")}
                              />
                              {formErrors.fullName && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.fullName}</p>}
                            </div>

                            <div id="field-mobileNumber">
                              <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Mobile Number <span className="text-brand-red font-extrabold">*</span>
                              </label>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="10-digit mobile number"
                                value={formData.mobileNumber}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                                  handleInputChange("mobileNumber", clean);
                                }}
                                className={`${getInputClassName("mobileNumber")} font-semibold text-brand-navy-deep`}
                              />
                              {formErrors.mobileNumber && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.mobileNumber}</p>}
                            </div>
                          </div>

                          <div id="field-emailAddress" className="max-w-md">
                            <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                              Email Address <span className="text-brand-red font-extrabold">*</span>
                            </label>
                            <input
                              type="email"
                              placeholder="Enter your email address"
                              value={formData.emailAddress}
                              onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                              className={getInputClassName("emailAddress")}
                            />
                            {formErrors.emailAddress && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.emailAddress}</p>}
                          </div>
                        </div>

                        {/* Section: Credit Profile - Positioned below Contact details */}
                        <div className="space-y-5">
                          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2">
                            Credit Profile
                          </h3>

                          <div id="field-approximateCreditScore" className="max-w-md">
                            <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                              Approximate Credit Score <span className="text-brand-red font-extrabold">*</span>
                            </label>
                            <select
                              value={formData.approximateCreditScore}
                              onChange={(e) => handleInputChange("approximateCreditScore", e.target.value)}
                              className={getInputClassName("approximateCreditScore", true)}
                              style={selectArrowStyle}
                            >
                              <option value="">Select Score Range...</option>
                              <option value="Excellent (750+)">Excellent (750+)</option>
                              <option value="Good (700 - 749)">Good (700 - 749)</option>
                              <option value="Fair (650 - 699)">Fair (650 - 699)</option>
                              <option value="Needs Work (Below 650)">Needs Work (Below 650)</option>
                              <option value="Don't Know / No Credit History">Don't Know / No Credit History</option>
                            </select>
                            {formErrors.approximateCreditScore && <p className="text-xs text-brand-red mt-1.5 font-semibold">{formErrors.approximateCreditScore}</p>}
                          </div>
                        </div>

                        {/* Back and Submit CTA Buttons */}
                        <div className="flex gap-4 items-center pt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStep(1);
                              // Smoothly scroll back to the card header
                              const formCard = document.getElementById("form-card");
                              if (formCard) {
                                formCard.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }}
                            className="btn-secondary h-13 px-6 text-xs font-bold flex items-center gap-1.5 border border-brand-border-mid rounded-xl active:translate-y-px hover:shadow-sm transition-all"
                          >
                            &larr; Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 btn-primary h-13 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-brand-blue rounded-xl hover:shadow-brand-blue/35 active:translate-y-px transition-all"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                Apply for Home Loan <ArrowRight size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </form>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
