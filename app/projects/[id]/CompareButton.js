"use client";

import React, { useState, useEffect } from "react";
import { GitCompare, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function CompareButton({ projectId, projectName }) {
  const [compareList, setCompareList] = useState([]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const syncList = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("compare_projects") || "[]");
        setCompareList(stored);
      } catch (err) {
        console.error("Failed to parse compare list:", err);
      }
    };

    syncList();
    window.addEventListener("compare-updated", syncList);
    window.addEventListener("storage", syncList);

    return () => {
      window.removeEventListener("compare-updated", syncList);
      window.removeEventListener("storage", syncList);
    };
  }, []);

  const isSelected = compareList.some((item) => item.id === projectId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let newList = [...compareList];

    if (isSelected) {
      // Remove it
      newList = newList.filter((item) => item.id !== projectId);
      localStorage.setItem("compare_projects", JSON.stringify(newList));
      window.dispatchEvent(new Event("compare-updated"));
    } else {
      // Add it
      if (compareList.length >= 3) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 2500);
        return;
      }
      newList.push({ id: projectId, name: projectName });
      localStorage.setItem("compare_projects", JSON.stringify(newList));
      window.dispatchEvent(new Event("compare-updated"));

      if (newList.length === 1) {
        showToast("First project added. Go back and add more projects to compare!", "info", "Compare List");
      }
    }
  };

  if (showLimitWarning) {
    return (
      <button
        disabled
        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-amber-bg text-brand-amber border border-brand-amber/30 cursor-not-allowed select-none animate-bounce"
      >
        Limit Reached (Max 3)
      </button>
    );
  }

  if (isSelected) {
    return (
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-blue text-white border border-brand-blue shadow-sm hover:bg-brand-blue/90 active:scale-95 transition-all cursor-pointer select-none"
      >
        <Check size={11} strokeWidth={3} />
        Added to Compare
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-bg-alt text-brand-blue hover:bg-brand-blue-bg border border-brand-blue-border active:scale-95 transition-all cursor-pointer select-none"
    >
      <GitCompare size={11} strokeWidth={2.5} />
      Add to Compare
    </button>
  );
}
