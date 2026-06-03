"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";

import { T, fadeUp } from '@/constants/theme';
import { Input, Select, FieldBadge, FlowContext } from './FlowElements';
import { submitWatchlist } from '@/services/api';
import { CATEGORIES, CITIES, BANKS, YEARS } from '@/constants/property';

// ─── Category selector grid ───────────────────────────────────────────────────
function CategoryGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-[18px]">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const selected = value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(selected ? "" : cat.id)}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all duration-180 text-left ${
              selected 
                ? "border-brand-teal bg-brand-tealBg shadow-[0_0_0_1px_rgba(13,148,136,0.13)]" 
                : "border-brand-borderMid bg-brand-bgCard shadow-brand hover:bg-brand-bgAlt"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
              selected ? "bg-brand-teal" : "bg-brand-bgAlt"
            }`}>
              <Icon size={15} color={selected ? "#fff" : "#8C97A8"} />
            </div>
            <span className={`text-xs font-semibold ${
              selected ? "text-brand-tealDark" : "text-brand-navyMid"
            }`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main WatchlistFlow ───────────────────────────────────────────────────────
export default function WatchlistFlow({ onClose, onSubmitSuccess }) {
  const router = useRouter();
  const [form, setForm] = useState({
    mainCategory: "",
    specificType: "",
    city: "",
    locality: "",
    budget: "",
    preApprovedBank: "",
    loanAmount: "",
    downPayment: "",
    possessionYear: "",
    preferredBuilder: "",
  });
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetUnit, setBudgetUnit] = useState("Cr");
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  // Sync and calculate absolute Rupees value
  useEffect(() => {
    const val = Number(budgetInput);
    if (isNaN(val) || val <= 0) {
      setForm((f) => ({ ...f, budget: "" }));
      return;
    }

    let absoluteBudget = 0;
    if (budgetUnit === "Cr") {
      absoluteBudget = val * 10000000;
    } else if (budgetUnit === "Lakh") {
      absoluteBudget = val * 100000;
    } else if (budgetUnit === "Rupees") {
      absoluteBudget = val;
    }

    setForm((f) => ({ ...f, budget: absoluteBudget }));
  }, [budgetInput, budgetUnit]);

  // Pre-populate if form.budget starts with a value
  useEffect(() => {
    if (form.budget && !budgetInput) {
      const b = Number(form.budget);
      if (b >= 10000000) {
        setBudgetInput(String(b / 10000000));
        setBudgetUnit("Cr");
      } else if (b >= 100000) {
        setBudgetInput(String(b / 100000));
        setBudgetUnit("Lakh");
      } else {
        setBudgetInput(String(b));
        setBudgetUnit("Rupees");
      }
    }
  }, [form.budget]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const selectedCategory = CATEGORIES.find((c) => c.id === form.mainCategory);

  const requiredFilled =
    form.mainCategory &&
    form.specificType &&
    form.city &&
    form.locality &&
    form.budget;

  async function handleSubmit() {
    if (!requiredFilled) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(form.budget) <= 0) {
      setError("Budget must be a positive number.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("watchlistFilters", JSON.stringify(form));
        console.log("Saved to sessionStorage:", form);
      }

      await submitWatchlist(form);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onSubmitSuccess?.("watchlist", form);
        router.push("/watchlist");
      }, 3000);

    } catch (e) {
      console.error(e);
      setError("Failed to submit to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FlowContext.Provider value={{ accent: 'teal' }}>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-6 right-6 bg-white px-5 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] flex items-center gap-3 z-[9999] border border-brand-border border-l-4 border-l-brand-teal"
          >
            <CheckCircle2 size={20} className="text-brand-teal" />
            <span className="text-sm font-semibold text-brand-navy">
              Your watchlist has been created!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen flex flex-col bg-brand-bgCard font-sans antialiased">
        {/* Header */}
        <div className="pt-6 px-7 pb-5 border-b border-brand-border flex items-start justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-brand-amberLight to-[#EA580C] flex items-center justify-center shadow-[0_2px_10px_rgba(217,119,6,0.30)]">
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
              className="bg-transparent border-none cursor-pointer text-brand-slateLight p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="py-3 px-7 bg-brand-bgAlt border-b border-brand-border flex items-center gap-2.5">
          <div className="flex-1 h-1 rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-full bg-brand-teal rounded-full transition-[width] duration-400 ease-out"
              style={{
                width: `${(Object.values(form).filter(Boolean).length / 10) * 100}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-brand-slate font-medium whitespace-nowrap">
            {Object.values(form).filter(Boolean).length} / 10 filled
          </span>
        </div>

        {/* Form */}
        <div className="w-full max-w-4xl mx-auto pt-6 px-7 pb-[60px] flex-1 bg-brand-bgCard">
          {/* Field 01 */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-3 mb-1.5">
              <FieldBadge n={1} active={!!form.mainCategory} />
              <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                Main Category <span className="text-brand-teal">*</span>
              </label>
            </div>
            <CategoryGrid
              value={form.mainCategory}
              onChange={(v) => {
                set("mainCategory")(v);
                set("specificType")("");
              }}
            />
          </motion.div>

          {/* Field 02 */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-3 mb-1.5">
              <FieldBadge n={2} active={!!form.specificType} />
              <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                Specific Type <span className="text-brand-teal">*</span>
              </label>
            </div>
            <Select
              label=""
              value={form.specificType}
              onChange={set("specificType")}
              options={selectedCategory?.types || []}
              required
              placeholder={
                form.mainCategory ? "Select type..." : "Select a category first"
              }
            />
          </motion.div>

          {/* Fields 03–04 side by side */}
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3.5"
          >
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={3} active={!!form.city} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  City <span className="text-brand-teal">*</span>
                </label>
              </div>
              <Select
                label=""
                value={form.city}
                onChange={set("city")}
                options={CITIES}
                required
                placeholder="Choose city"
              />
            </div>
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={4} active={!!form.locality} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  Locality / Sector <span className="text-brand-teal">*</span>
                </label>
              </div>
              <Input
                label=""
                value={form.locality}
                onChange={set("locality")}
                placeholder="e.g. Sector 65, Whitefield"
                required
              />
            </div>
          </motion.div>

          {/* Field 05 */}
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-3 mb-1.5">
              <FieldBadge n={5} active={!!form.budget} />
              <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                Budget <span className="text-brand-teal">*</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slateLight text-sm font-semibold pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={budgetInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && Number(val) < 0) return; // block negative numbers
                    setBudgetInput(val);
                  }}
                  placeholder={budgetUnit === "Cr" ? "e.g. 3" : budgetUnit === "Lakh" ? "e.g. 75" : "e.g. 7500000"}
                  className="w-full pl-7 pr-3.5 py-2.5 text-sm text-brand-navy bg-brand-bgCard border border-brand-borderMid rounded-[10px] outline-none transition-all duration-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
                />
              </div>
              <div>
                <select
                  value={budgetUnit}
                  onChange={(e) => setBudgetUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-brand-navy bg-brand-bgCard border border-brand-borderMid rounded-[10px] outline-none transition-all duration-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 appearance-none bg-no-repeat bg-[right_14px_center] cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="Cr">Cr</option>
                  <option value="Lakh">Lakh</option>
                  <option value="Rupees">Rupees</option>
                </select>
              </div>
            </div>
            {form.budget && (
              <p className="text-[11px] text-brand-teal mt-1 font-semibold">
                ≈ ₹{Number(form.budget).toLocaleString("en-IN")} absolute Rupees
              </p>
            )}
          </motion.div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-brand-border" />
            <span className="text-[10px] text-brand-slateLight tracking-widest uppercase">
              Optional Fields
            </span>
            <div className="flex-1 h-[1px] bg-brand-border" />
          </div>

          {/* Fields 06–08 */}
          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-3 mb-1.5">
              <FieldBadge n={6} active={!!form.preApprovedBank} />
              <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                Pre-approved Bank
              </label>
            </div>
            <Select
              label=""
              value={form.preApprovedBank}
              onChange={set("preApprovedBank")}
              options={BANKS}
              placeholder="Select bank (if any)"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3.5"
          >
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={7} active={!!form.loanAmount} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  Loan Amount (₹)
                </label>
              </div>
              <Input
                label=""
                value={form.loanAmount}
                onChange={set("loanAmount")}
                placeholder="e.g. 5000000"
                type="number"
              />
            </div>
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={8} active={!!form.downPayment} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  Down Payment (₹)
                </label>
              </div>
              <Input
                label=""
                value={form.downPayment}
                onChange={set("downPayment")}
                placeholder="e.g. 2500000"
                type="number"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3.5"
          >
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={9} active={!!form.possessionYear} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  Possession Year
                </label>
              </div>
              <Select
                label=""
                value={form.possessionYear}
                onChange={set("possessionYear")}
                options={YEARS}
                placeholder="When do you want?"
              />
            </div>
            <div>
              <div className="flex gap-2.5 mb-1.5">
                <FieldBadge n={10} active={!!form.preferredBuilder} />
                <label className="text-xs font-semibold text-brand-navyMid pt-1.5 tracking-wider">
                  Preferred Builder
                </label>
              </div>
              <Input
                label=""
                value={form.preferredBuilder}
                onChange={set("preferredBuilder")}
                placeholder="e.g. DLF, M3M, Godrej"
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-lg bg-brand-redBg border border-brand-redBorder mb-4">
              <p className="text-xs text-brand-red font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <motion.button
            variants={fadeUp}
            custom={7}
            initial="hidden"
            animate="visible"
            onClick={handleSubmit}
            disabled={submitting}
            whileHover={requiredFilled ? { y: -2 } : {}}
            whileTap={requiredFilled ? { scale: 0.98 } : {}}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-[13px] border-none font-bold text-[15px] text-white transition-all duration-220 mt-2 ${
              submitting ? 'cursor-not-allowed' : 'cursor-pointer'
            } ${
              requiredFilled 
                ? 'bg-brand-teal shadow-[0_4px_20px_rgba(13,148,136,0.30)] hover:-translate-y-[1px]' 
                : 'bg-brand-slateLight cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                />
                Saving Watchlist...
              </>
            ) : (
              <>
                Create My Watchlist <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          <p className="text-[11px] text-brand-slateLight text-center mt-3">
            <span className="text-brand-teal">*</span> Required fields · Optional
            fields help us personalise alerts
          </p>
        </div>
      </div>
    </FlowContext.Provider>
  );
}
