"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, Loader2, Check } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import LeadForm from "@/components/lead/LeadForm";

export default function DownloadReportButton({ projectId, projectName = "", variant }) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Auth state tracking
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerPDFDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/report`);
      if (!response.ok) {
        throw new Error("Failed to generate PDF report");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_report.pdf` || "project_report.pdf";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "").trim();
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error downloading project report PDF:", err);
      alert("An error occurred while generating your report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    if (downloading) return;
    if (loadingAuth) return;

    if (user) {
      // Logged in user: Register lead silently in database first
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            source: "brochure_download",
            projectId,
            projectName
          })
        });
      } catch (err) {
        console.error("Silent lead registration failed for logged-in user:", err);
      }
      
      // Trigger PDF download directly
      await triggerPDFDownload();
    } else {
      // Guest: Open details collection modal
      setShowModal(true);
    }
  };

  const handleModalSubmitSuccess = () => {
    // Close modal and initiate download
    setTimeout(() => {
      setShowModal(false);
      triggerPDFDownload();
    }, 1200);
  };

  // Render modal content at body root level
  const modalContent = mounted && showModal && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-xs transition-opacity" 
        onClick={() => setShowModal(false)}
      />
      
      <div className="relative w-full max-w-md bg-brand-bg-card rounded-3xl overflow-hidden shadow-2xl border border-brand-border p-6 sm:p-8 z-[10000] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-brand-border">
          <div>
            <h3 className="text-base font-extrabold text-brand-navy m-0">Download Brochure</h3>
            <p className="text-[10px] text-brand-slate font-bold m-0 mt-0.5">
              Share your contact details to download the PDF for <span className="text-brand-blue font-extrabold">{projectName}</span>
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
          source="brochure_download"
          projectId={projectId}
          projectName={projectName}
          isEmbed={false}
          onSubmitSuccess={handleModalSubmitSuccess}
        />
      </div>
    </div>,
    document.body
  );

  if (variant === "brochure-card") {
    return (
      <>
        <div className="bg-brand-bg-card p-4 rounded-2xl border border-brand-border shadow-brand flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-red-bg text-brand-red flex items-center justify-center border border-brand-red-border flex-shrink-0 font-extrabold text-xs">
              PDF
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-brand-navy m-0">Brochure</h4>
              <p className="text-[10px] text-brand-slate-light m-0 font-bold">Download PDF Report</p>
            </div>
          </div>
          <button 
            onClick={handleDownloadClick}
            disabled={downloading || success || loadingAuth}
            className={`text-xs font-black transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 ${
              success 
                ? "text-brand-emerald" 
                : downloading 
                  ? "text-brand-slate-light" 
                  : "text-brand-blue hover:text-brand-blue-dark hover:underline"
            }`}
          >
            {success ? "Downloaded!" : downloading ? "Loading..." : "Download"}
          </button>
        </div>

        {modalContent}
      </>
    );
  }

  if (success) {
    return (
      <button
        disabled
        className="badge-emerald px-3 py-1.5 text-[11px] normal-case cursor-not-allowed select-none animate-in fade-in duration-200"
      >
        <Check size={13} strokeWidth={3} />
        Report Downloaded!
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={downloading || loadingAuth}
        className={`btn-primary px-3 py-1.5 text-[11px] transition-all border-none select-none active:scale-[0.97] disabled:opacity-50 ${
          downloading
            ? "bg-brand-bg-alt text-brand-slate cursor-wait"
            : ""
        }`}
      >
        {downloading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={13} />
            Download Project Details
          </>
        )}
      </button>

      {modalContent}
    </>
  );
}
