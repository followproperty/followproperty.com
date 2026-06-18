import { jsPDF } from "jspdf";

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
