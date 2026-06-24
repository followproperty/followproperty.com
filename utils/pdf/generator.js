import { jsPDF } from "jspdf";
import { formatCurrency as utilsFormatCurrency, formatPriceRange, formatAreaRange, isEmpty } from "./formatter";

function drawLogoSVG(doc, x, y, w, isWatermark = false) {
  const originalW = 119.3321;
  const originalH = 75.2825;
  const h = w * (originalH / originalW);
  const scaleX = w / originalW;
  const scaleY = h / originalH;

  const polyLeft = [
    [49.0587, 27.034],
    [6.6296, 37.6412],
    [49.0587, 48.2485],
    [55.8136, 75.2825],
    [0, 44.2708],
    [0, 31.0117],
    [55.8136, 0]
  ];

  const polyRight = [
    [119.3321, 31.0117],
    [119.3321, 44.2708],
    [63.5186, 75.2825],
    [70.2734, 48.2485],
    [112.7025, 37.6412],
    [70.2734, 27.034],
    [63.5186, 0]
  ];

  const mappedLeft = polyLeft.map(p => [x + p[0] * scaleX, y + p[1] * scaleY]);
  const mappedRight = polyRight.map(p => [x + p[0] * scaleX, y + p[1] * scaleY]);

  const drawPolygon = (points) => {
    const startX = points[0][0];
    const startY = points[0][1];
    const relative = [];
    let prevX = startX;
    let prevY = startY;
    for (let i = 1; i < points.length; i++) {
      relative.push([points[i][0] - prevX, points[i][1] - prevY]);
      prevX = points[i][0];
      prevY = points[i][1];
    }
    doc.lines(relative, startX, startY, [1, 1], "F", true);
  };

  const hasGState = typeof doc.GState === "function";

  if (isWatermark) {
    if (hasGState) {
      const gState = new doc.GState({ opacity: 0.035 });
      doc.saveGraphicsState();
      doc.setGState(gState);
      
      doc.setFillColor(50, 95, 236);
      drawPolygon(mappedLeft);
      doc.setFillColor(81, 143, 255);
      drawPolygon(mappedRight);
      
      doc.restoreGraphicsState();
    } else {
      doc.setFillColor(242, 245, 253);
      drawPolygon(mappedLeft);
      drawPolygon(mappedRight);
    }
  } else {
    doc.setFillColor(50, 95, 236);
    drawPolygon(mappedLeft);
    doc.setFillColor(81, 143, 255);
    drawPolygon(mappedRight);
  }
}

/**
 * Generates and downloads a branded investor valuation report PDF.
 * This function runs entirely client-side.
 * 
 * @param {Object} property - The MongoDB property document
 * @param {Object} valuation - Calculated valuation results (price, currentMarketValue, gain, gainPct, etc.)
 */
export function generateValuationPDF(property, valuation) {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [15, 22, 41];    // Deep Navy (#0F1629)
  const secondaryColor = [92, 104, 128]; // Slate (#5C6880)
  const accentColor = [50, 95, 236];    // Brand Blue (#325fec)
  const warningColor = [217, 119, 6];    // Amber (#D97706)
  const successColor = [5, 150, 105];    // Emerald (#059669)
  const errorColor = [220, 38, 38];      // Red (#DC2626)

  const formatCurrency = (num) => {
    if (!num) return "INR 0";
    const parsedNum = Number(num);
    if (isNaN(parsedNum)) return "INR 0";
    if (parsedNum >= 10000000) return `INR ${(parsedNum / 10000000).toFixed(2)} Cr`;
    if (parsedNum >= 100000) return `INR ${(parsedNum / 100000).toFixed(2)} L`;
    return `INR ${parsedNum.toLocaleString()}`;
  };

  const getGainColor = (gainVal) => {
    return gainVal >= 0 ? successColor : errorColor;
  };

  const formatRate = (price, area) => {
    const p = Number(price) || 0;
    const a = Number(area) || 1;
    return `INR ${Math.round(p / a).toLocaleString()}/sq.ft`;
  };

  // --- PAGE HEADER ACCENT LINE ---
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 210, 4, "F");

  // --- WATERMARK BACKGROUND LOGO ---
  drawLogoSVG(doc, 45, 110.65, 120, true);

  // --- BRAND HEADER ---
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FollowProperty", 23, 20);

  // Logo Icon
  drawLogoSVG(doc, 12, 13.5, 9);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("REAL ASSET PORTFOLIO & PROPERTY VALUATION REPORT", 20, 24);

  // Generation Date
  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.setFontSize(9);
  doc.text(`Generated: ${reportDate}`, 190, 20, { align: "right" });

  // Divider Line
  doc.setDrawColor(235, 237, 240);
  doc.setLineWidth(0.5);
  doc.line(12, 28, 198, 28);

  // --- SECTION 1: DYNAMIC PROPERTY HERO SUMMARY ---
  doc.setFillColor(250, 250, 248); // Brand BG light (#FAFAF8)
  doc.roundedRect(12, 34, 186, 28, 3, 3, "F");
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(12, 34, 186, 28, 3, 3, "S");

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(property.projectName || "Unnamed Property", 18, 42);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "medium");
  doc.setFontSize(9.5);
  doc.text(`${property.locality}, ${property.city}`, 18, 47.5);

  // Property type badge
  const typeText = (property.projectType || "Residential").toUpperCase();
  doc.setFillColor(244, 243, 239); // Slate light grey (#F4F3EF)
  doc.roundedRect(18, 51, 26, 5, 1, 1, "F");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(typeText, 31, 54.5, { align: "center" });

  // Current use badge
  const useText = (property.currentUse || "Portfolio Asset").toUpperCase();
  doc.setFillColor(50, 95, 236, 0.08); // Brand Blue transparent
  doc.roundedRect(48, 51, 30, 5, 1, 1, "F");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(7.5);
  doc.text(useText, 63, 54.5, { align: "center" });

  // --- SECTION 2: ESTIMATED MARKET VALUE WIDGET (PROMINENT) ---
  doc.setFillColor(250, 250, 248); // Brand BG light
  doc.roundedRect(12, 68, 186, 32, 4, 4, "F");
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(12, 68, 186, 32, 4, 4, "S");

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("CURRENT VALUATION ESTIMATE", 18, 75);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(formatCurrency(valuation.currentMarketValue), 18, 86);

  // Appreciation Badge
  const returnsColor = getGainColor(valuation.gain);
  doc.setFillColor(returnsColor[0], returnsColor[1], returnsColor[2]);
  doc.roundedRect(182, 72, 12, 5, 1, 1, "F"); // Background
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(`${valuation.gain >= 0 ? "+" : ""}${valuation.gainPct}%`, 188, 75.5, { align: "center" });

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Estimated Rate: ${formatCurrency(valuation.medianRate)}/sq.ft`, 18, 93);

  // Profit/Gain text on the right
  doc.setTextColor(returnsColor[0], returnsColor[1], returnsColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const netGainStr = `${valuation.gain >= 0 ? "Estimated Gain: +" : "Estimated Loss: "}${formatCurrency(valuation.gain)}`;
  doc.text(netGainStr, 192, 86, { align: "right" });

  // --- SECTION 3: DETAILED SPECIFICATIONS GRID ---
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Property Summary & Overview", 12, 110);
  doc.setDrawColor(238, 239, 242);
  doc.line(12, 112, 198, 112);

  // Overview Table
  const specs = [
    { label: "Developer/Builder", val: property.builderName },
    { label: "Super Built-up Area", val: `${property.superArea} sq.ft` },
    { label: "Carpet Area", val: `${property.carpetArea} sq.ft` },
    { label: "Purchase Price", val: formatCurrency(valuation.price) },
    { label: "Purchase Rate", val: formatRate(valuation.price, property.superArea) },
    { label: "Possession Status", val: property.possessionStatus },
    { label: "Floor Number", val: property.floorNumber ? `Floor ${property.floorNumber}` : "Not Configured" },
    { label: "Car Parking(s)", val: property.parkingSpots ? `${property.parkingSpots} Spot(s)` : "None" }
  ];

  let y = 118;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  specs.forEach((item, index) => {
    // Clean, thin-line bordered white layout rows
    doc.setDrawColor(238, 239, 242);
    doc.setLineWidth(0.2);
    doc.line(12, y + 2, 198, y + 2);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(item.label, 16, y);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(String(item.val), 90, y);
    doc.setFont("helvetica", "normal");
    
    y += 8;
  });

  // --- SECTION 4: FINANCIALS (LOANS & RENT) ---
  y += 6;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Rentals & Liability Management", 12, y);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  
  // Left: Rent status
  doc.setFillColor(244, 246, 254); // Light blue background
  doc.roundedRect(12, y, 90, 28, 2, 2, "F");
  doc.setDrawColor(220, 227, 251); // Light blue border
  doc.roundedRect(12, y, 90, 28, 2, 2, "S");

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("RENTAL INCOME", 18, y + 6);
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10.5);
  doc.text(property.rentalIncome === "Yes" ? `Generates Active Rent` : "No Rental Income", 18, y + 14);
  
  if (property.rentalIncome === "Yes") {
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(9);
    doc.text(`Monthly Rent: ${formatCurrency(property.monthlyRent)}`, 18, y + 21);
  }

  // Right: Loan status
  doc.setFillColor(244, 246, 254);
  doc.roundedRect(108, y, 90, 28, 2, 2, "F");
  doc.setDrawColor(220, 227, 251);
  doc.roundedRect(108, y, 90, 28, 2, 2, "S");

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OUTSTANDING LIABILITIES", 114, y + 6);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10.5);
  doc.text(property.ongoingLoan === "Yes" ? `Ongoing Active Loan` : "No Debt (Debt Free)", 114, y + 14);

  if (property.ongoingLoan === "Yes") {
    doc.setTextColor(errorColor[0], errorColor[1], errorColor[2]);
    doc.setFontSize(9);
    const emiText = `EMI: ${formatCurrency(property.monthlyEMI)} (${property.bankName || "Unspecified Bank"})`;
    doc.text(emiText, 114, y + 21);
  }

  // --- SECTION 5: ON-REPORT FUTURE ANALYTICS ---
  y += 36;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Future Analytics & Market Intelligence", 12, y);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  doc.setFillColor(244, 246, 254); // Light blue background
  doc.roundedRect(12, y, 186, 26, 3, 3, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, y, 186, 26, 3, 3, "S");

  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("FUTURE REGIONAL MARKET FORECAST", 18, y + 6);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const forecastText = "FollowProperty's upcoming engine will dynamically calculate local market risk scores, automated RERA legal monitoring, localized suburb appreciation projections, and real-time bank line-of-credit collateral eligibility based on historical performance indices.";
  doc.text(doc.splitTextToSize(forecastText, 174), 18, y + 11);

  // --- PAGE FOOTER & DISCLAIMER ---
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(7.5);
  const disclaimerText = "Disclaimer: This valuation report is dynamically compiled for informational tracking purposes based on circle rates and comparable transactions, and does not constitute a formal financial appraisal. Generated on FollowProperty platform.";
  doc.text(doc.splitTextToSize(disclaimerText, 180), 15, 280);

  // Branded Signature with Logo
  const textWidth = doc.getTextWidth("followproperty.com");
  const logoWidth = 6;
  const logoSpacing = 1.5;
  const totalFooterWidth = logoWidth + logoSpacing + textWidth;
  const footerStartX = (210 - totalFooterWidth) / 2;

  drawLogoSVG(doc, footerStartX, 286.5, logoWidth);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("followproperty.com", footerStartX + logoWidth + logoSpacing, 290);

  // Save the PDF
  const filename = `${(property.projectName || "property").toLowerCase().replace(/\s+/g, "_")}_valuation_report.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads a beautiful branded PDF brochure for a project.
 * This runs entirely client-side.
 * 
 * @param {Object} project - The serialized project document
 */
export function generateProjectPDF(project) {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [15, 22, 41];    // Deep Navy (#0F1629)
  const secondaryColor = [92, 104, 128]; // Slate (#5C6880)
  const accentColor = [50, 95, 236];    // Brand Blue (#325fec)
  const warningColor = [217, 119, 6];    // Amber (#D97706)
  const successColor = [5, 150, 105];    // Emerald (#059669)

  const getBhkString = (bhk) => {
    if (isEmpty(bhk)) return "TBD";
    if (Array.isArray(bhk)) {
      return bhk.join(", ") + " BHK";
    }
    return String(bhk);
  };

  const cleanVal = (val, fallback = "Not Configured") => {
    return isEmpty(val) ? fallback : String(val);
  };

  const getPriceStr = () => {
    return formatPriceRange(project.minPrice, project.maxPrice, "₹");
  };

  // --- PAGE 1: COVER & PRIMARY OVERVIEW ---

  // Top Page Accent Bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 210, 4, "F");

  // Watermark Background Logo
  drawLogoSVG(doc, 45, 110.65, 120, true);

  // Brand Header
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FollowProperty", 23, 18);

  // Logo Icon
  drawLogoSVG(doc, 12, 12.5, 9);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("EXCLUSIVE PROJECT BRIEF & INVESTMENT OVERVIEW", 23, 22);

  // Date Generated
  const genDateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  doc.setFontSize(8.5);
  doc.text(`Generated: ${genDateStr}`, 198, 19, { align: "right" });

  // Divider Line
  doc.setDrawColor(230, 232, 235);
  doc.setLineWidth(0.5);
  doc.line(12, 26, 198, 26);

  // Project Hero Card
  doc.setFillColor(250, 250, 248); // Light grey background
  doc.roundedRect(12, 32, 186, 28, 3, 3, "F");
  doc.setDrawColor(230, 232, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, 32, 186, 28, 3, 3, "S");

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(project.projectName || "Project Brief", 18, 41);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const locStr = `${project.locality ? project.locality + ", " : ""}${project.city || ""}${project.state ? ", " + project.state : ""}`;
  doc.text(locStr, 18, 46.5);

  // Property Type Badge
  const pType = (project.propertyType || "Residential").toUpperCase();
  doc.setFillColor(244, 243, 239); // Sand/slate accent
  doc.roundedRect(18, 50.5, 26, 5.5, 1, 1, "F");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(pType, 31, 54.5, { align: "center" });

  // Construction Status Badge
  const pStatus = (project.status || "Under Construction").toUpperCase();
  doc.setFillColor(50, 95, 236, 0.08); // Light brand blue transparent
  doc.roundedRect(48, 50.5, 36, 5.5, 1, 1, "F");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(7.5);
  doc.text(pStatus, 66, 54.5, { align: "center" });

  // Key Metrics Grid Row (y=66 to y=84)
  const metrics = [
    { label: "INDICATIVE PRICE", val: getPriceStr() },
    { label: "CONFIGURATIONS", val: getBhkString(project.bhk) },
    { label: "POSSESSION", val: project.possessionYear === 0 ? "Ready to Move" : (project.possessionYear || "TBD") },
    { label: "PROJECT AREA", val: formatAreaRange(project.minArea, project.maxArea, project.superArea) || "TBD" }
  ];

  metrics.forEach((m, idx) => {
    const colW = 43.5;
    const gap = 4;
    const startX = 12 + idx * (colW + gap);
    const startY = 66;

    // Metric box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(startX, startY, colW, 18, 2, 2, "F");
    doc.setDrawColor(230, 232, 235);
    doc.roundedRect(startX, startY, colW, 18, 2, 2, "S");

    // Label
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(m.label, startX + 4, startY + 5.5);

    // Value
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    // Auto-fit long metric values (e.g. price range)
    const metricVal = String(m.val);
    const maxValW = colW - 8;
    const textW = doc.getTextWidth(metricVal);
    if (textW > maxValW) {
      doc.setFontSize(8.5);
    }
    doc.text(metricVal, startX + 4, startY + 12);
  });

  // Section: Project Overview (y=92 to y=140)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Project Overview & Location Profile", 12, 92);

  doc.setDrawColor(235, 237, 240);
  doc.setLineWidth(0.3);
  doc.line(12, 94, 198, 94);

  let currentY = 100;
  if (!isEmpty(project.tagline)) {
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    const quoteText = `"${project.tagline}"`;
    const splitQuote = doc.splitTextToSize(quoteText, 180);
    doc.text(splitQuote, 16, currentY);
    currentY += splitQuote.length * 5 + 3;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  const overviewText = `${project.projectName || "This project"} is a premium ${project.propertyType || "residential"} development built by the renowned developer ${project.builderName || "a leading brand"}. Strategically positioned in the high-growth locality of ${project.locality || "Gurgaon"}, ${project.city || "India"}, it is designed to offer a refined and highly connected lifestyle. Featuring configurations in ${getBhkString(project.bhk)}, the layouts boast efficient planning, ample ventilation, and spacious designs. Low-density planning yields greater privacy and spacious open green zones for recreation.`;
  const splitOverview = doc.splitTextToSize(overviewText, 186);
  splitOverview.forEach((line) => {
    doc.text(line, 12, currentY);
    currentY += 5;
  });

  // Section: Key Highlights (y=145 to y=195)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Key Highlights", 12, 145);
  doc.line(12, 147, 198, 147);

  const defaultHighlights = [
    "Prime strategic location with excellent connectivity",
    "Developed by industry-trusted brand builder",
    "Modern infrastructure with premium specifications",
    "Ample open spaces and green landscaping",
    "High value appreciation potential",
    "RERA compliant development project"
  ];
  const highlightsList = !isEmpty(project.highlights) ? project.highlights.slice(0, 6) : defaultHighlights;

  highlightsList.forEach((h, index) => {
    const colIdx = index % 2;
    const rowIdx = Math.floor(index / 2);
    const hX = colIdx === 0 ? 15 : 110;
    const hY = 153 + rowIdx * 8;

    // Bullet Symbol
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("✦", hX, hY);

    // Highlight text
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const cleanHighlight = doc.splitTextToSize(String(h), 80)[0] || ""; // limit to single line
    doc.text(cleanHighlight, hX + 4, hY);
  });

  // Section: Facts & Specifications (y=205 to y=250)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Project Facts & Specifications", 12, 205);
  doc.line(12, 207, 198, 207);

  const specGrid = [
    { label: "Clubhouse Size", val: cleanVal(project.clubhouseSize, "Premium Clubhouse") },
    { label: "Open Green Area", val: cleanVal(project.openGreenArea, "Lush Landscaped Area") },
    { label: "Car Parking", val: project.carParkingPerUnit ? `${project.carParkingPerUnit} per unit` : "Reserved Parking Spots" },
    { label: "Lifts per Core", val: project.liftsPerCore ? `${project.liftsPerCore} Lifts` : "High-speed Elevators" }
  ];

  specGrid.forEach((s, idx) => {
    const colW = 43.5;
    const gap = 4;
    const sX = 12 + idx * (colW + gap);
    const sY = 213;

    doc.setFillColor(250, 250, 248);
    doc.roundedRect(sX, sY, colW, 16, 2, 2, "F");
    doc.setDrawColor(230, 232, 235);
    doc.roundedRect(sX, sY, colW, 16, 2, 2, "S");

    // Title label
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(s.label, sX + 4, sY + 5);

    // Val
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const valText = doc.splitTextToSize(String(s.val), colW - 8);
    doc.text(valText[0] || "", sX + 4, sY + 11);
  });

  // Page 1 Footer
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(8);
  doc.text("Page 1 of 2", 198, 285, { align: "right" });
  doc.text("followproperty.com", 105, 285, { align: "center" });

  // --- PAGE 2: DETAILED DATA & BRAND CONTACT ---
  doc.addPage();

  // Top Page Accent Bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 210, 4, "F");

  // Watermark Background Logo
  drawLogoSVG(doc, 45, 110.65, 120, true);

  // Mini Header
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`FollowProperty | ${project.projectName || "Project Details"}`, 12, 12);
  doc.text(`Generated: ${genDateStr}`, 198, 12, { align: "right" });

  doc.setDrawColor(230, 232, 235);
  doc.setLineWidth(0.5);
  doc.line(12, 15, 198, 15);

  // Section: Configurations & Unit Details (y=22 to y=90)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Configurations & Unit Plan Details", 12, 22);
  doc.setLineWidth(0.3);
  doc.line(12, 24, 198, 24);

  // Row columns labels
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("CONFIGURATION TYPE", 16, 31);
  doc.text("SUPER BUILT-UP AREA", 90, 31);
  doc.text("INDICATIVE BASE PRICE", 192, 31, { align: "right" });

  // Render rows
  let rowY = 38;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const defaultRows = [
    { config: "2 BHK Apartment", area: cleanVal(project.superArea, "1200 - 1450 sq.ft"), price: getPriceStr() },
    { config: "3 BHK Apartment", area: cleanVal(project.superArea, "1650 - 2100 sq.ft"), price: getPriceStr() }
  ];

  let configRows = [];
  if (!isEmpty(project.configurations)) {
    configRows = project.configurations.map(cfg => ({
      config: cfg,
      area: cleanVal(project.superArea, "TBD"),
      price: getPriceStr()
    }));
  } else if (!isEmpty(project.bhk)) {
    configRows = project.bhk.map((b) => ({
      config: `${b} BHK Unit`,
      area: cleanVal(project.superArea, "TBD"),
      price: getPriceStr()
    }));
  } else {
    configRows = defaultRows;
  }

  // Slice to max 5 rows to prevent page overflow
  configRows.slice(0, 5).forEach((row) => {
    // Divider
    doc.setDrawColor(238, 239, 242);
    doc.setLineWidth(0.2);
    doc.line(12, rowY + 2, 198, rowY + 2);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(String(row.config), 16, rowY);

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(String(row.area), 90, rowY);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(String(row.price), 192, rowY, { align: "right" });

    rowY += 8;
  });

  // Section: Amenities & Lifestyle (y=96 to y=150)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Amenities & Lifestyle Facilities", 12, 96);
  doc.setLineWidth(0.3);
  doc.line(12, 98, 198, 98);

  const defaultAmenities = [
    "24/7 Gated Security",
    "Power Backup System",
    "Swimming Pool",
    "Kids Play Zone",
    "Dedicated Car Parking",
    "Equipped Fitness Gym",
    "Clubhouse Lounge",
    "Jogging Track",
    "Lush Landscaped Gardens"
  ];
  const amenitiesList = !isEmpty(project.amenities) ? project.amenities.slice(0, 9) : defaultAmenities;

  amenitiesList.forEach((am, idx) => {
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    const amX = 16 + colIdx * 62;
    const amY = 105 + rowIdx * 8;

    // Bullet
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("✦", amX, amY);

    // Text
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const cleanAm = doc.splitTextToSize(String(am), 56)[0] || "";
    doc.text(cleanAm, amX + 4.5, amY);
  });

  // Section: Developer Profile (y=156 to y=196)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Developer Credentials", 12, 156);
  doc.line(12, 158, 198, 158);

  // Background card for Developer
  doc.setFillColor(250, 250, 248);
  doc.roundedRect(12, 162, 186, 26, 2, 2, "F");
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(12, 162, 186, 26, 2, 2, "S");

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(project.builderName || "Master Builder Partner", 18, 169);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  const devProfileText = `${project.builderName || "The builder partner"} is one of the premier estate builders in India, committed to delivering high-quality spaces, sustainable designs, and strong customer transparency. Known for launching structural icons, they focus on choosing prime locations that guarantee long-term value, connectivity, and outstanding returns.`;
  const splitDevText = doc.splitTextToSize(devProfileText, 174);
  let devTextY = 174;
  splitDevText.slice(0, 3).forEach((line) => {
    doc.text(line, 18, devTextY);
    devTextY += 4.5;
  });

  // Section: Connectivity & Location Advantages (y=202 to y=238)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Location Advantage & Connectivity", 12, 202);
  doc.line(12, 204, 198, 204);

  const defaultConnectivity = [
    "Hospital / Medical Center - 10 Mins Drive",
    "Upcoming Metro Transit Terminal - 5 Mins Walk",
    "Supermarket & Retail Center - 2 Mins Drive",
    "Prestigious Public Schools - 8 Mins Drive",
    "Express Highway Connection - 12 Mins Drive",
    "International Airport - 30 Mins Drive"
  ];
  const connectivityList = !isEmpty(project.connectivity) ? project.connectivity.slice(0, 6) : defaultConnectivity;

  connectivityList.forEach((conn, index) => {
    const colIdx = index % 2;
    const rowIdx = Math.floor(index / 2);
    const cX = colIdx === 0 ? 15 : 110;
    const cY = 210 + rowIdx * 8;

    // Bullet Icon
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("✓", cX, cY);

    // Connectivity text
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const cleanConn = doc.splitTextToSize(String(conn), 80)[0] || "";
    doc.text(cleanConn, cX + 4.5, cY);
  });

  // Branded Advisory Card at Bottom (y=244 to y=280)
  doc.setFillColor(244, 246, 254); // Soft light blue highlight
  doc.roundedRect(12, 244, 186, 34, 3, 3, "F");
  doc.setDrawColor(220, 227, 251); // Light blue border
  doc.roundedRect(12, 244, 186, 34, 3, 3, "S");

  // Advisor Info
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Connect with our Real Estate Advisor desk:", 18, 251);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Call Desk: ", 18, 258);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("+91 87965 08866", 34, 258);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Email: ", 72, 258);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("ifollowproperty@gmail.com", 83, 258);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Office: 11th Floor, Tower A, IT Spaze Park, Sector 49, Gurgaon, India", 18, 264);

  // Logo branding on the right of card
  drawLogoSVG(doc, 146, 249, 7);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("followproperty.com", 154, 254);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Property Intelligence & Advisory", 146, 261);

  // Disclaimer text
  doc.setFontSize(6.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Disclaimer: This document is compiled for informational and intelligence tracking purposes. Area, price, and connectivity indicators are subject to builder updates.", 12, 283);

  // Page 2 Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Page 2 of 2", 198, 289, { align: "right" });
  doc.text("followproperty.com", 105, 289, { align: "center" });

  // Save the PDF
  const filename = `${(project.projectName || "project").toLowerCase().replace(/[^a-z0-9]+/g, "_")}_brochure.pdf`;
  doc.save(filename);
}

