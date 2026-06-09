"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import LeadForm from "@/components/lead/LeadForm";

export default function LeadButton({ 
  className, 
  text = "Get Project Assistance", 
  successText = "✓ Verified request queued. An advisor will reach out to you shortly.",
  projectId = null,
  projectName = "",
  source = "project_detail",
  modalTitle = "Request Details",
  modalSubtitle = "Share your contact details below."
}) {
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (success) return;
    
    // Open the modal to collect visitor details
    setShowModal(true);
  };

  const handleModalSubmitSuccess = () => {
    setTimeout(() => {
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1200);
  };

  const modalContent = mounted && showModal && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-xs transition-opacity" 
        onClick={() => setShowModal(false)}
      />
      
      <div className="relative w-full max-w-md bg-brand-bg-card rounded-3xl overflow-hidden shadow-2xl border border-brand-border p-6 sm:p-8 z-[10000] animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-brand-border">
          <div>
            <h3 className="text-base font-extrabold text-brand-navy m-0">{modalTitle}</h3>
            <p className="text-[10px] text-brand-slate font-bold m-0 mt-0.5">
              {modalSubtitle} {projectName ? `for ` : ""}<span className="text-brand-blue font-extrabold">{projectName}</span>
            </p>
          </div>
          <button 
            onClick={() => setShowModal(false)}
            className="text-brand-slate hover:text-brand-navy bg-transparent border-none text-base cursor-pointer p-1 leading-none"
          >
            ✕
          </button>
        </div>

        <LeadForm 
          source={source}
          projectId={projectId}
          projectName={projectName}
          isEmbed={false}
          onSubmitSuccess={handleModalSubmitSuccess}
        />
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          onClick={handleClick}
          disabled={success}
          className={className || `px-8 py-3.5 rounded-xl border-none font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${
            success 
              ? "bg-brand-emerald text-white cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.3)]" 
              : "bg-brand-blue text-white hover:bg-brand-blue/95 shadow-[0_4px_20px_rgba(50,95,236,0.3)]"
          }`}
        >
          {success ? "Request Received!" : text}
        </button>
        
        {success && (
          <span className="text-[10px] sm:text-[11px] text-brand-emerald font-extrabold mt-1 text-center animate-in fade-in slide-in-from-top-1 duration-200">
            {successText}
          </span>
        )}
      </div>

      {modalContent}
    </>
  );
}
