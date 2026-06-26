"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  useMap 
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, 
  ArrowLeft, 
  Building, 
  TrendingUp, 
  MapPin, 
  Info,
  Navigation,
  Loader2,
  TrendingDown
} from "lucide-react";

// Helper component to dynamically change map bounds when drilling down
function ChangeMapView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 0.8 });
    }
  }, [bounds, map]);
  return null;
}

// Color scale helper for polygons based on rate per sqft
function getColor(rate) {
  if (!rate) return "#E2E8F0"; // Slate-200 for no data
  return rate > 50000 ? "#DC2626" // Red-600 (Very high)
       : rate > 20000 ? "#EA580C" // Orange-600
       : rate > 10000 ? "#D97706" // Amber-600
       : rate > 5000  ? "#2563EB" // Blue-600
       : "#059669";               // Emerald-600 (Low/Affordable)
}

export default function CircleRatesMap() {
  const [level, setLevel] = useState("state");
  const [stateCode, setStateCode] = useState("");
  const [district, setDistrict] = useState("");
  
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Drilldown navigation history/breadcrumbs
  const [bounds, setBounds] = useState([[28.2, 76.6], [29.0, 77.7]]); // Default Delhi NCR bounds
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: "Delhi NCR", level: "state", bounds: [[28.2, 76.6], [29.0, 77.7]] }]);
  
  // Selection and Hover States
  const [hoveredArea, setHoveredArea] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // Fetch GeoJSON with Rates
  const fetchData = async (currentLevel, currentSubState = "", currentSubDistrict = "") => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/circle-rates?level=${currentLevel}`;
      if (currentSubState) url += `&stateCode=${currentSubState}`;
      if (currentSubDistrict) url += `&district=${encodeURIComponent(currentSubDistrict)}`;
      
      const res = await fetch(url);
      const resData = await res.json();
      
      if (resData.success) {
        setGeojsonData(resData.data);
      } else {
        setError(resData.error || "Failed to load map data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the rates server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("state");

    const detectLocation = async () => {
      try {
        // Try IP geolocation (fast, silent)
        const res = await fetch("https://freeipapi.com/api/json");
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            const lat = Number(data.latitude);
            const lng = Number(data.longitude);
            // Verify within India coordinates roughly
            const isWithinIndia = lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
            if (isWithinIndia) {
              const nearbyBounds = [
                [lat - 0.15, lng - 0.15],
                [lat + 0.15, lng + 0.15]
              ];
              setBounds(nearbyBounds);
              setBreadcrumbs([{ name: data.cityName || "Nearby Location", level: "state", bounds: nearbyBounds }]);
              return;
            }
          }
        }
      } catch (err) {
        console.error("IP Geolocation detection failed:", err);
      }

      // Fallback to browser geolocation (requires permission)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const isWithinIndia = lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
            if (isWithinIndia) {
              const nearbyBounds = [
                [lat - 0.15, lng - 0.15],
                [lat + 0.15, lng + 0.15]
              ];
              setBounds(nearbyBounds);
              setBreadcrumbs([{ name: "Nearby Location", level: "state", bounds: nearbyBounds }]);
            }
          },
          (geoErr) => {
            console.warn("Browser Geolocation failed:", geoErr);
          }
        );
      }
    };

    detectLocation();
  }, []);

  // Drill down function on click
  const handleFeatureClick = (feature, layer) => {
    const props = feature.properties;
    const layerBounds = layer.getBounds();
    
    if (level === "state") {
      setLevel("district");
      setStateCode(props.stateCode);
      setBounds(layerBounds);
      
      // Update breadcrumbs
      const newCrumbs = [
        ...breadcrumbs,
        { name: props.name, level: "district", stateCode: props.stateCode, bounds: layerBounds }
      ];
      setBreadcrumbs(newCrumbs);
      setSelectedArea(props);
      fetchData("district", props.stateCode);
      
    } else if (level === "district") {
      setLevel("locality");
      setDistrict(props.name);
      setBounds(layerBounds);
      
      const newCrumbs = [
        ...breadcrumbs,
        { name: props.name, level: "locality", stateCode: props.stateCode, district: props.name, bounds: layerBounds }
      ];
      setBreadcrumbs(newCrumbs);
      setSelectedArea(props);
      fetchData("locality", props.stateCode, props.name);
    } else {
      setSelectedArea(props);
    }
  };

  // Click on breadcrumb
  const handleBreadcrumbClick = (crumb, index) => {
    if (index === breadcrumbs.length - 1) return; // Ignore clicking current level
    
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    setBounds(crumb.bounds);
    setLevel(crumb.level);
    setSelectedArea(null);
    setHoveredArea(null);

    if (crumb.level === "state") {
      setStateCode("");
      setDistrict("");
      fetchData("state");
    } else if (crumb.level === "district") {
      setDistrict("");
      fetchData("district", crumb.stateCode);
    }
  };

  // Back button handler
  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      handleBreadcrumbClick(breadcrumbs[breadcrumbs.length - 2], breadcrumbs.length - 2);
    }
  };

  // Search handler
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Find matching items from current geojson features
      if (geojsonData && geojsonData.features) {
        const matches = geojsonData.features.filter(f => 
          f.properties.name.toLowerCase().includes(q.toLowerCase())
        ).map(f => f.properties);
        setSearchResults(matches.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Select item from search results
  const selectSearchResult = (item) => {
    setSelectedArea(item);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Leaflet Polygon Styling & Hover triggers
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layerRef = e.target;
        layerRef.setStyle({
          weight: 3,
          color: "#325fec",
          fillOpacity: 0.65
        });
        layerRef.bringToFront();
        setHoveredArea(feature.properties);
      },
      mouseout: (e) => {
        const layerRef = e.target;
        layerRef.setStyle({
          weight: 1.5,
          color: "#0F1629",
          fillOpacity: 0.45
        });
        setHoveredArea(null);
      },
      click: (e) => {
        handleFeatureClick(feature, e.target);
      }
    });
  };

  // Reset styling helper
  const geojsonStyle = (feature) => {
    return {
      fillColor: getColor(feature.properties.circleRate),
      weight: 1.5,
      opacity: 0.7,
      color: "#0F1629",
      fillOpacity: 0.45,
      dashArray: ""
    };
  };

  const activeStats = selectedArea || hoveredArea;

  return (
    <div className="flex flex-col md:flex-row h-[650px] w-full overflow-hidden font-sans rounded-2xl bg-white border border-brand-border shadow-brand">
      
      {/* 1. SIDEBAR STATS & BREADCRUMBS */}
      <div className="w-full md:w-[380px] bg-white border-b md:border-b-0 md:border-r border-brand-border flex flex-col z-10 shadow-sm shrink-0">
        
        {/* Search & Breadcrumbs */}
        <div className="p-4 border-b border-brand-border bg-brand-bg/50">
          <div className="relative mb-3">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-slate-light">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${level}s...`}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm border border-brand-border-mid rounded-xl focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white shadow-xs"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-brand-border rounded-xl shadow-lg z-55 overflow-hidden">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSearchResult(item)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-bg-alt flex flex-col border-b border-brand-border last:border-0"
                  >
                    <span className="font-semibold text-brand-navy">{item.name}</span>
                    <span className="text-[10px] text-brand-slate-light uppercase tracking-wider">{item.district || item.stateCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center flex-wrap gap-1 text-xs">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-brand-slate-light">/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(crumb, idx)}
                  className={`hover:text-brand-blue font-medium transition-colors ${
                    idx === breadcrumbs.length - 1 
                      ? "text-brand-navy font-bold pointer-events-none" 
                      : "text-brand-slate"
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Info Content Section */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-brand-slate">
              <Loader2 className="animate-spin text-brand-blue mb-2" size={32} />
              <span className="text-sm font-semibold">Fetching rates data...</span>
            </div>
          ) : activeStats ? (
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue badge-blue mb-1">
                  {activeStats.level} details
                </span>
                <h2 className="text-2xl font-bold text-brand-navy tracking-tight">{activeStats.name}</h2>
                <p className="text-xs text-brand-slate-light mt-0.5">
                  {activeStats.district ? `${activeStats.district}, ` : ""}{activeStats.stateCode}
                </p>
              </div>

              {/* Main rate display */}
              <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-xs font-semibold text-brand-slate">Average Circle Rate</span>
                <span className="text-3xl font-extrabold text-brand-navy mt-1 tracking-tight">
                  {activeStats.circleRate ? `₹${activeStats.circleRate.toLocaleString()}` : "N/A"}
                </span>
                <span className="text-[10px] font-bold text-brand-slate-light uppercase mt-0.5">per Sq. Ft.</span>
              </div>

              {/* Grid Rates by Category */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Rates by property type</h3>
                
                {/* Residential */}
                <div className="border border-brand-border rounded-xl p-3 flex justify-between items-center hover:bg-brand-bg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-sm font-semibold text-brand-navy">Residential</span>
                  </div>
                  <span className="text-sm font-bold text-brand-navy">
                    {activeStats.residentialRate ? `₹${activeStats.residentialRate.toLocaleString()}/sqft` : "N/A"}
                  </span>
                </div>

                {/* Commercial */}
                <div className="border border-brand-border rounded-xl p-3 flex justify-between items-center hover:bg-brand-bg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue-bg border border-brand-blue-border flex items-center justify-center text-brand-blue">
                      <Building size={16} />
                    </div>
                    <span className="text-sm font-semibold text-brand-navy">Commercial</span>
                  </div>
                  <span className="text-sm font-bold text-brand-navy">
                    {activeStats.commercialRate ? `₹${activeStats.commercialRate.toLocaleString()}/sqft` : "N/A"}
                  </span>
                </div>

                {/* Agricultural */}
                {activeStats.agriculturalRate !== undefined && activeStats.agriculturalRate !== null && (
                  <div className="border border-brand-border rounded-xl p-3 flex justify-between items-center hover:bg-brand-bg transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-brand-amber-border flex items-center justify-center text-brand-amber">
                        <MapPin size={16} />
                      </div>
                      <span className="text-sm font-semibold text-brand-navy">Agricultural</span>
                    </div>
                    <span className="text-sm font-bold text-brand-navy">
                      {activeStats.agriculturalRate ? `₹${activeStats.agriculturalRate.toLocaleString()}/sqft` : "N/A"}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructions / Interactions */}
              {level !== "locality" && (
                <div className="bg-brand-blue-bg border border-brand-blue-border rounded-xl p-3 flex gap-2.5 items-start text-xs text-brand-blue-dark">
                  <Navigation className="shrink-0 mt-0.5 animate-bounce-slow" size={14} />
                  <span>Click on this region on the map to zoom in and see its sub-districts or sectors!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-brand-slate gap-3 py-10">
              <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-slate-light shadow-inner">
                <Info size={22} />
              </div>
              <h3 className="font-bold text-brand-navy">Circle Rates Map</h3>
              <p className="text-xs text-brand-slate max-w-[240px] leading-relaxed">
                Hover over any state or district polygon on the map to see local circle rate intelligence. Click to zoom in.
              </p>
            </div>
          )}
        </div>

        {/* Back Button (Drawer bottom) */}
        {breadcrumbs.length > 1 && (
          <div className="p-4 border-t border-brand-border bg-white shrink-0">
            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-navy hover:text-white bg-brand-bg hover:bg-brand-navy border border-brand-border-mid rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft size={14} />
              Go Back One Level
            </button>
          </div>
        )}
      </div>

      {/* 2. MAP COMPONENT DISPLAY */}
      <div className="flex-1 h-full w-full relative z-0 bg-brand-bg-alt">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center z-100 transition-opacity">
            <div className="bg-white border border-brand-border shadow-brand-lg px-6 py-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="animate-spin text-brand-blue" size={20} />
              <span className="text-sm font-bold text-brand-navy">Loading map geometries...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4">
            <div className="bg-red-50 border border-brand-red-border text-brand-red px-4 py-3 rounded-xl flex items-center gap-3 shadow-md">
              <Info size={16} className="shrink-0" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          </div>
        )}

        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={9}
          className="h-full w-full"
          zoomControl={true}
          style={{ background: "#F4F3EF" }}
        >
          <ChangeMapView bounds={bounds} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geojsonData && (
            <GeoJSON
              key={`${level}-${stateCode}-${district}-${geojsonData.features.length}`}
              data={geojsonData}
              style={geojsonStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Floating Legends */}
        <div className="absolute bottom-4 right-4 bg-white/94 backdrop-blur-md border border-brand-border rounded-xl p-3.5 shadow-brand-md z-45 text-xs w-[180px]">
          <h4 className="font-bold text-brand-navy mb-2 uppercase tracking-wider text-[9px]">Rate Bracket / sqft</h4>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#DC2626]" />
              <span className="font-medium text-brand-slate text-[11px]">&gt; ₹50,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#EA580C]" />
              <span className="font-medium text-brand-slate text-[11px]">₹20,000 - ₹50,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#D97706]" />
              <span className="font-medium text-brand-slate text-[11px]">₹10,000 - ₹20,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#2563EB]" />
              <span className="font-medium text-brand-slate text-[11px]">₹5,000 - ₹10,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#059669]" />
              <span className="font-medium text-brand-slate text-[11px]">&lt; ₹5,000</span>
            </div>
            <div className="flex items-center gap-2 border-t border-brand-border mt-1 pt-1">
              <div className="w-3.5 h-3.5 rounded border border-dashed border-brand-slate-light bg-[#E2E8F0]" />
              <span className="font-medium text-brand-slate text-[11px]">No data / Coming soon</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
