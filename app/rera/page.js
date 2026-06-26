"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  FileText
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/components/ui/Loading";

const STATES = [
  { code: "HR", name: "Haryana" },
  { code: "DL", name: "Delhi" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "GJ", name: "Gujarat" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "AP", name: "Andhra Pradesh" }
];

export default function ReraPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedState, setSelectedState] = useState("HR");
  const [searchTerm, setSearchTerm] = useState("");
  const [districtTerm, setDistrictTerm] = useState("");
  
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedDistrict, setDebouncedDistrict] = useState("");
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const limit = 15;

  // Debounce search and district filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDistrict(districtTerm);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [districtTerm]);

  // Fetch RERA records
  async function fetchReraData() {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams({
        state: selectedState,
        search: debouncedSearch,
        district: debouncedDistrict,
        page: page.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/rera?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load RERA records");
      }
      
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items || []);
        setTotalCount(json.data.pagination?.total || 0);
        setTotalPages(json.data.pagination?.totalPages || 1);
      } else {
        throw new Error(json.error || "Failed to load database items");
      }
    } catch (err) {
      console.error("Error loading RERA registry:", err);
      setError(err.message || "Failed to retrieve RERA registration logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchReraData();
    }
  }, [mounted, selectedState, debouncedSearch, debouncedDistrict, page]);

  const handleCopy = (regNo, id) => {
    if (!regNo) return;
    navigator.clipboard.writeText(regNo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("ongoing") || s.includes("going") || s.includes("new")) {
      return "badge-blue";
    }
    if (s.includes("complete") || s.includes("delivered")) {
      return "badge-emerald";
    }
    return "badge-amber";
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-12 animate-pulse">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-2">RERA Registry</h1>
          <div className="h-4 w-48 bg-brand-bg-alt rounded mb-6" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-brand-blue" size={30} /> RERA Registration Directory
          </h1>
          <p className="text-xs md:text-sm text-brand-slate m-0">
            Real-time verification of registered real estate projects, promoter details, and regulatory compliance logs.
          </p>
        </div>

        {/* State Selection */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap mb-5">
          {STATES.map((state) => (
            <button
              key={state.code}
              onClick={() => {
                setSelectedState(state.code);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap cursor-pointer transition-all border-none ${
                selectedState === state.code
                  ? "bg-brand-blue text-white shadow-brand-blue hover:bg-brand-blue-dark"
                  : "bg-brand-bg-card text-brand-navy-mid border border-brand-border hover:bg-brand-bg-alt"
              }`}
            >
              {state.name} ({state.code})
            </button>
          ))}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-slate-light" size={18} />
            <input
              type="text"
              placeholder="Search by project name, promoter, or reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-slate-light" size={18} />
            <input
              type="text"
              placeholder="Filter by district (e.g. Gurugram, Noida, Nagpur)..."
              value={districtTerm}
              onChange={(e) => setDistrictTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert-amber mb-6 p-4 text-sm font-medium flex items-center gap-3">
            <span className="shrink-0 font-bold bg-brand-amber text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-brand-bg-card rounded-2xl border border-brand-border p-5 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 w-20 bg-brand-bg-alt rounded" />
                  <div className="h-4 w-12 bg-brand-bg-alt rounded" />
                </div>
                <div className="h-6 w-3/4 bg-brand-bg-alt rounded mb-3" />
                <div className="h-4 w-1/2 bg-brand-bg-alt rounded mb-3" />
                <div className="h-8 w-full bg-brand-bg-alt rounded mb-4" />
                <div className="h-9 w-full bg-brand-bg-alt rounded" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item._id} className="card-frame p-5 flex flex-col justify-between h-full bg-brand-bg-card">
                  <div>
                    {/* Top Row with pill tags */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="badge-blue text-[9px]">
                        {item.rera_authority?.code || "RERA"}
                      </span>
                      {item.project_status && (
                        <span className={`badge-translucent ${getStatusBadgeClass(item.project_status)} text-[9px]`}>
                          {item.project_status}
                        </span>
                      )}
                      {item.project_type && (
                        <span className="badge-amber text-[9px]">
                          {item.project_type}
                        </span>
                      )}
                    </div>

                    {/* Project Name */}
                    <h3 className="text-sm md:text-base font-extrabold text-brand-navy line-clamp-2 mb-2 leading-snug" title={item.project_name || "N/A"}>
                      {item.project_name || "Unnamed Project"}
                    </h3>

                    {/* Promoter / Developer */}
                    {item.promoter_name && (
                      <p className="text-xs text-brand-slate font-medium flex items-center gap-1.5 mb-3 m-0">
                        <Building2 size={13} className="text-brand-slate-light shrink-0" />
                        <span className="truncate">{item.promoter_name}</span>
                      </p>
                    )}

                    {/* Registration Monospace Box */}
                    <div className="bg-brand-bg-alt/60 border border-brand-border rounded-xl p-2.5 mb-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[8px] text-brand-slate uppercase font-bold tracking-wider mb-0.5">RERA Registration No</span>
                        <span className="font-mono text-xs text-brand-navy-mid font-semibold block truncate">
                          {item.registration_no || "Pending/NA"}
                        </span>
                      </div>
                      {item.registration_no && (
                        <button
                          onClick={() => handleCopy(item.registration_no, item._id)}
                          className="p-1.5 hover:bg-brand-bg rounded-lg border-none text-brand-slate hover:text-brand-navy cursor-pointer shrink-0 transition-colors flex items-center justify-center bg-transparent"
                          title="Copy registration number"
                        >
                          {copiedId === item._id ? (
                            <Check size={13} className="text-brand-emerald" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-3 border-t border-brand-border flex items-center justify-between gap-3 mt-auto">
                    {/* Location Info */}
                    <div className="flex items-center gap-1 text-xs text-brand-slate min-w-0">
                      <MapPin size={13} className="text-brand-slate-light shrink-0" />
                      <span className="truncate">
                        {item.district || "Default district"}, {item.state?.code || selectedState}
                      </span>
                    </div>

                    {/* Action Link */}
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-1.5 px-3 text-[10px] sm:text-xs flex items-center gap-1 shrink-0 cursor-pointer text-white no-underline font-bold"
                      >
                        Portal <ExternalLink size={11} />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="py-1.5 px-3 bg-brand-bg-alt text-brand-slate-light border-none text-[10px] sm:text-xs rounded-xl font-bold cursor-not-allowed flex items-center gap-1 shrink-0"
                      >
                        No Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-brand-border">
                <span className="text-xs sm:text-sm text-brand-slate font-medium">
                  Showing <span className="text-brand-navy font-bold">{Math.min(totalCount, (page - 1) * limit + 1)}</span> to{" "}
                  <span className="text-brand-navy font-bold">{Math.min(totalCount, page * limit)}</span> of{" "}
                  <span className="text-brand-navy font-bold">{totalCount.toLocaleString()}</span> registered projects
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-brand-border bg-brand-bg-card hover:bg-brand-bg-alt disabled:opacity-40 disabled:cursor-not-allowed rounded-xl cursor-pointer flex items-center justify-center transition-colors text-brand-navy-mid"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      // Simple sliding window for page numbers
                      let pageNumber = i + 1;
                      if (page > 3 && totalPages > 5) {
                        if (page + 2 > totalPages) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = page - 2 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors border-none ${
                            page === pageNumber
                              ? "bg-brand-blue text-white shadow-brand-blue"
                              : "bg-brand-bg-card hover:bg-brand-bg-alt text-brand-navy-mid border border-brand-border"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-brand-border bg-brand-bg-card hover:bg-brand-bg-alt disabled:opacity-40 disabled:cursor-not-allowed rounded-xl cursor-pointer flex items-center justify-center transition-colors text-brand-navy-mid"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="bg-brand-bg-card border border-brand-border rounded-3xl p-12 text-center shadow-brand max-w-xl mx-auto mt-8">
            <div className="w-14 h-14 bg-brand-blue-bg border border-brand-blue-border rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-blue">
              <FileText size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-brand-navy mb-1.5">No RERA Projects Found</h3>
            <p className="text-xs sm:text-sm text-brand-slate max-w-md mx-auto mb-0 leading-relaxed">
              We couldn't find any registered projects in <span className="font-extrabold">{STATES.find(s => s.code === selectedState)?.name}</span> matching your current search parameters. Please try adjusting your filters or search keywords.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
