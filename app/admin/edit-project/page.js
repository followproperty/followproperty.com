"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CITIES } from "@/constants/admin/cities";
import ProjectForm from "@/components/forms/ProjectForm";

export default function EditProjectPage() {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedProject, setSelectedProject] = useState(null);

  // Flow State Transitions
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Mapped state on city choice
  const CITY_TO_STATE = {
    "Gurgaon": "Haryana",
    "Noida": "Uttar Pradesh",
    "Delhi": "Delhi",
    "Mumbai": "Maharashtra",
    "Pune": "Maharashtra",
    "Hyderabad": "Telangana",
    "Bengaluru": "Karnataka",
    "Chennai": "Tamil Nadu",
    "Ahmedabad": "Gujarat",
    "Kolkata": "West Bengal",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh"
  };

  useEffect(() => {
    if (city) {
      setState(CITY_TO_STATE[city] || "");
      setSearchQuery("");
      setSuggestions([]);
    } else {
      setState("");
    }
  }, [city]);

  // Autocomplete querying on search input changes
  useEffect(() => {
    if (!city || !state || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/upcoming-projects?state=${state}&city=${city}&query=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuggestions(json.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Autocomplete search failed:", err);
        setError("Error loading autocomplete suggestions.");
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, city, state]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setSuggestions([]);
    setSearchQuery("");
  };

  const handleBackToSearch = () => {
    setSelectedProject(null);
    setSearchQuery("");
    setSuggestions([]);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setDeleteInput("");
    setDeleteError("");
  };

  const handleDeleteProject = async () => {
    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/upcoming-projects/${selectedProject._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleBackToSearch();
      } else {
        setDeleteError(data.error || "Failed to delete project.");
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      setDeleteError("A network error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Render Edit form if editing is active ---
  if (selectedProject && isEditing) {
    return (
      <div className="max-w-4xl mx-auto w-full min-h-[80vh] flex flex-col justify-center py-8">
        <ProjectForm 
          mode="edit" 
          initialData={selectedProject} 
          onDeleteSuccess={handleBackToSearch}
          onSubmitSuccess={handleBackToSearch} 
        />
      </div>
    );
  }

  // --- Render Preview Summary / Delete Choice Modal ---
  if (selectedProject && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col w-full">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackToSearch}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 mb-3 border-none bg-transparent cursor-pointer"
            >
              ← Back to Search
            </button>
            <div className="mt-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Manage Selected Project
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              {selectedProject.projectName}
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-0.5">
              By {selectedProject.builderName}
            </p>
          </div>

          {/* Project Details Preview Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 space-y-3.5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Locality</span>
                <span className="font-semibold text-slate-800">{selectedProject.locality}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">City & State</span>
                <span className="font-semibold text-slate-800">{selectedProject.city}, {selectedProject.state}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-slate-200/50">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Price Range</span>
                <span className="font-bold text-slate-950">{selectedProject.marketPrice || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Super Area</span>
                <span className="font-semibold text-slate-800">{selectedProject.superArea || "N/A"} Sqft</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-slate-200/50">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Property Type</span>
                <span className="font-semibold text-slate-800">{selectedProject.propertyType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Possession Status</span>
                <span className="font-semibold text-slate-800">
                  {selectedProject.status} {selectedProject.possessionYear > 0 ? `(${selectedProject.possessionYear})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Main Action Choice / Confirmation UI */}
          {!showDeleteConfirm ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-6 py-4 rounded-xl shadow-sm hover:bg-slate-800 transition-colors cursor-pointer text-sm"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Project Details
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold px-6 py-4 rounded-xl hover:bg-red-50/50 hover:border-red-300 transition-all cursor-pointer text-sm"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Project From Database
              </button>
            </div>
          ) : (
            <div className="border border-red-100 bg-red-50/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-950">Confirm Permanent Deletion</h3>
                  <p className="text-xs text-red-600/80 mt-0.5 leading-relaxed font-semibold">
                    Are you sure you want to permanently delete this project listing? This action cannot be undone.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="text-xs font-bold text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200">
                  ⚠ {deleteError}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type <span className="font-mono bg-red-100 text-red-700 px-1 py-0.5 rounded select-all">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium uppercase"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={deleteInput.trim().toUpperCase() !== "DELETE" || isDeleting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl transition-colors disabled:opacity-50 text-xs md:text-sm cursor-pointer shadow-sm"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                    setDeleteError("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-100 border border-slate-200 text-slate-600 font-bold px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors text-xs md:text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center w-full">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 mb-3">
            ← Back to Admin Portal
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Edit / Update Project</h1>
          <p className="text-slate-400 text-sm mt-1">Search, modify, or archive projects safely in the temporary ingestion collection.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-semibold">
            ⚠ {error}
          </div>
        )}

        <div className="space-y-6">
          {/* State / City Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">City Selector</label>
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

          {/* Autocomplete Input Search Area */}
          {city && state && (
            <div className="border-t border-slate-100 pt-6 animate-in fade-in duration-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Search Project Name or Builder Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. DLF, M3M, Skyline, Heights..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-300"
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <svg className="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching...</span>
                  </div>
                )}
              </div>

              {/* Autocomplete Suggestion Results Pane */}
              {searchQuery.trim().length >= 2 && !loading && (
                <div className="mt-4 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => handleSelectProject(project)}
                        className="w-full text-left px-4 py-3.5 hover:bg-amber-50/50 transition-colors flex flex-col justify-center cursor-pointer border-none bg-transparent"
                      >
                        <span className="text-sm font-bold text-slate-800">{project.projectName}</span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          By {project.builderName} · {project.locality} · {project.propertyType}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-400 text-xs font-semibold">
                      No matching upcoming projects found in {city}.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
