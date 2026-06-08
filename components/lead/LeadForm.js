"use client";

import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";

export default function LeadForm({ 
  source = "landing", 
  projectId = null, 
  projectName = "", 
  onSubmitSuccess = null, 
  isEmbed = false 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    requirements: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: source !== "brochure_download" ? formData.city : "",
          requirements: source !== "brochure_download" ? formData.requirements : "",
          projectId,
          projectName,
          source
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit request.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", city: "", requirements: "" });

      // Call success callback (e.g. to download file)
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Hide success message after 5 seconds for embedded forms
      if (isEmbed) {
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Error submitting lead:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success && !isEmbed) {
    return (
      <div className="text-center py-6 px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-brand-emerald-bg text-brand-emerald border border-brand-emerald/20 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Check size={24} strokeWidth={3} />
        </div>
        <h4 className="text-base font-extrabold text-brand-navy mb-1.5">Request Submitted!</h4>
        <p className="text-xs text-brand-slate leading-relaxed m-0 font-semibold">
          Thank you for sharing your details. An advisor will get in touch with you shortly.
        </p>
      </div>
    );
  }

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-brand-red-bg border border-brand-red-border text-brand-red text-xs rounded-xl font-medium animate-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="lead-name" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          disabled={submitting}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="lead-email" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          placeholder="e.g. john.doe@example.com"
          value={formData.email}
          onChange={handleChange}
          disabled={submitting}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="lead-phone" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Phone Number
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          required
          placeholder="e.g. +91 99999 99999"
          value={formData.phone}
          onChange={handleChange}
          disabled={submitting}
          className="form-input"
        />
      </div>

      {source !== "brochure_download" && (
        <>
          <div>
            <label htmlFor="lead-city" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              City
            </label>
            <input
              id="lead-city"
              name="city"
              type="text"
              required
              placeholder="e.g. Gurugram"
              value={formData.city}
              onChange={handleChange}
              disabled={submitting}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="lead-requirements" className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Tell your requirements
            </label>
            <textarea
              id="lead-requirements"
              name="requirements"
              rows={3}
              placeholder="e.g. Looking for a 3 BHK apartment in Gurugram under 4 Cr."
              value={formData.requirements}
              onChange={handleChange}
              disabled={submitting}
              className="form-input resize-none"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full btn-primary py-3 text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5"
      >
        {submitting ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            {source === "brochure_download" ? "Downloading..." : "Submitting..."}
          </>
        ) : (
          source === "brochure_download" 
            ? "Download Brochure" 
            : source === "project_detail"
            ? "Interested in this project? Let us know"
            : "Connect with Expert"
        )}
      </button>
    </form>
  );

  if (isEmbed) {
    return (
      <div className="bg-brand-bg-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-brand max-w-xl mx-auto animate-in fade-in duration-200">
        <h3 className="text-xl font-extrabold text-brand-navy mb-1.5 tracking-tight text-center">
          Request Project Consultation
        </h3>
        <p className="text-xs text-brand-slate text-center max-w-sm mx-auto mb-6 leading-relaxed font-semibold">
          Share your contact details below. Our certified property advisor will reach out to you within 48 hours to help you find the best inventory.
        </p>

        {success ? (
          <div className="p-4 bg-brand-emerald-bg border border-brand-emerald/10 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center flex-shrink-0">
              ✓
            </div>
            <div>
              <h5 className="text-xs font-bold text-brand-navy m-0">Inquiry Received Successfully!</h5>
              <p className="text-[10px] text-brand-slate m-0 font-medium">An expert advisor will contact you shortly.</p>
            </div>
          </div>
        ) : (
          formFields
        )}
      </div>
    );
  }

  return formFields;
}
