import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HomeLoanApplication from "@/models/HomeLoanApplication";
import { verifyAuthRequest } from "@/lib/auth-guards";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();

    // Check if the user is authenticated to link their userId
    let userId = null;
    try {
      const authResult = await verifyAuthRequest();
      if (authResult.authenticated && authResult.user) {
        userId = authResult.user._id;
      }
    } catch (err) {
      console.log("[HomeLoanApplications API] Guest session detected, proceeding without User reference:", err.message);
    }

    const {
      fullName,
      emailAddress,
      mobileNumber,
      city,
      state,
      propertyPurpose,
      propertyType,
      builder,
      project,
      propertyValue,
      propertyStatus,
      requiredLoanAmount,
      downPaymentAvailable,
      preferredLoanTenure,
      preferredBank,
      preferredInterestRate,
      employmentType,
      monthlyNetIncome,
      totalWorkExperience,
      employerOrBusinessName,
      employerBusinessVintage,
      existingMonthlyEmi,
      existingHomeLoan,
      existingHomeLoanDetails,
      existingHomeLoanOutstanding,
      existingHomeLoanBank,
      coApplicant,
      coApplicantMonthlyIncome,
      approximateCreditScore,
      source
    } = body;

    const finalEmployerName = (employerOrBusinessName || employerBusinessVintage || "").trim();

    // Validate required fields (existingMonthlyEmi is now optional and will default to 0 if left blank)
    if (
      !fullName || 
      !emailAddress || 
      !mobileNumber || 
      !city || 
      !propertyPurpose || 
      !propertyType || 
      propertyValue === undefined || propertyValue === null ||
      requiredLoanAmount === undefined || requiredLoanAmount === null ||
      !employmentType || 
      monthlyNetIncome === undefined || monthlyNetIncome === null ||
      !totalWorkExperience || 
      !finalEmployerName || 
      existingHomeLoan === undefined || existingHomeLoan === null ||
      coApplicant === undefined || coApplicant === null ||
      !approximateCreditScore
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for loan application" },
        { status: 400 }
      );
    }

    // Check for duplicate application to avoid double submission for the same phone number under this source
    const duplicateQuery = {
      mobileNumber: mobileNumber.trim(),
      source: source || "homeloanswithcashback"
    };

    const existingApplication = await HomeLoanApplication.findOne(duplicateQuery);
    if (existingApplication) {
      return NextResponse.json(
        { success: true, data: existingApplication, message: "Application already registered." },
        { status: 200 }
      );
    }

    // Parse and clean numeric inputs
    const parsedPropertyValue = Number(String(propertyValue).replace(/\D/g, ""));
    const parsedRequiredLoanAmount = Number(String(requiredLoanAmount).replace(/\D/g, ""));
    const parsedDownPaymentAvailable = downPaymentAvailable ? Number(String(downPaymentAvailable).replace(/\D/g, "")) : 0;
    const parsedMonthlyNetIncome = Number(String(monthlyNetIncome).replace(/\D/g, ""));
    
    // Default EMI to 0 if left blank
    const parsedExistingMonthlyEmi = existingMonthlyEmi !== undefined && existingMonthlyEmi !== null && String(existingMonthlyEmi).trim() !== ""
      ? Number(String(existingMonthlyEmi).replace(/\D/g, ""))
      : 0;

    // Convert existingHomeLoan and coApplicant to native booleans
    const isExistingHomeLoan = existingHomeLoan === true || String(existingHomeLoan).toLowerCase() === "yes" || String(existingHomeLoan).toLowerCase() === "true";
    const isCoApplicant = coApplicant === true || String(coApplicant).toLowerCase() === "yes" || String(coApplicant).toLowerCase() === "true";

    // Handle null constraints for conditional fields
    const finalExistingHomeLoanDetails = isExistingHomeLoan && existingHomeLoanDetails ? existingHomeLoanDetails.trim() : null;
    const finalExistingHomeLoanBank = isExistingHomeLoan && existingHomeLoanBank ? existingHomeLoanBank.trim() : null;
    
    let parsedExistingHomeLoanOutstanding = null;
    if (isExistingHomeLoan && existingHomeLoanOutstanding !== undefined && existingHomeLoanOutstanding !== null && String(existingHomeLoanOutstanding).trim() !== "") {
      parsedExistingHomeLoanOutstanding = Number(String(existingHomeLoanOutstanding).replace(/\D/g, ""));
    }

    let finalCoApplicantMonthlyIncome = null;
    if (isCoApplicant && coApplicantMonthlyIncome !== undefined && coApplicantMonthlyIncome !== null && coApplicantMonthlyIncome !== "") {
      finalCoApplicantMonthlyIncome = Number(String(coApplicantMonthlyIncome).replace(/\D/g, ""));
    }

    // Parse tenure to a clean number (e.g. "20 Years" -> 20, or 20 -> 20)
    let parsedPreferredLoanTenure = null;
    if (preferredLoanTenure !== undefined && preferredLoanTenure !== null && preferredLoanTenure !== "") {
      const tenureStr = String(preferredLoanTenure).replace(/\D/g, "");
      if (tenureStr) {
        parsedPreferredLoanTenure = Number(tenureStr);
      }
    }

    // Parse interest rate to a number
    let parsedPreferredInterestRate = null;
    if (preferredInterestRate !== undefined && preferredInterestRate !== null && preferredInterestRate !== "") {
      const cleanedRate = String(preferredInterestRate).replace(/[^\d.]/g, "");
      if (cleanedRate) {
        parsedPreferredInterestRate = Number(cleanedRate);
      }
    }

    // Map credit score string ranges to schema enums
    const creditScoreMap = {
      "Excellent (750+)": "750+",
      "Good (700 - 749)": "700-749",
      "Fair (650 - 699)": "650-699",
      "Needs Work (Below 650)": "UNDER_650",
      "Don't Know / No Credit History": "UNKNOWN"
    };
    const standardizedCreditScore = creditScoreMap[approximateCreditScore] || approximateCreditScore || "UNKNOWN";

    // Generate unique human-readable leadId reference
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randPart = Math.floor(100000 + Math.random() * 900000); // 6 random digits
    const leadId = `HL-${datePart}-${randPart}`;

    // User-Agent analytics detection
    const userAgent = req.headers.get("user-agent") || "";
    let device = "desktop";
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      device = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = "tablet";
    }

    let browser = "unknown";
    if (/chrome|crios/i.test(userAgent)) {
      browser = "Chrome";
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = "Safari";
    } else if (/firefox|iceweasel/i.test(userAgent)) {
      browser = "Firefox";
    } else if (/edge|edg/i.test(userAgent)) {
      browser = "Edge";
    }

    // Create Home Loan Application entry
    const application = await HomeLoanApplication.create({
      leadId,
      fullName: fullName.trim(),
      emailAddress: emailAddress.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      city: city.trim(),
      state: state ? state.trim() : "",
      propertyPurpose: propertyPurpose.trim(),
      propertyType: propertyType.trim(),
      builder: builder ? builder.trim() : "",
      project: project ? project.trim() : "",
      propertyValue: parsedPropertyValue,
      propertyStatus: propertyStatus ? propertyStatus.trim() : "",
      requiredLoanAmount: parsedRequiredLoanAmount,
      downPaymentAvailable: parsedDownPaymentAvailable,
      preferredLoanTenure: parsedPreferredLoanTenure,
      preferredBank: preferredBank ? preferredBank.trim() : "",
      preferredInterestRate: parsedPreferredInterestRate,
      employmentType: employmentType.trim(),
      monthlyNetIncome: parsedMonthlyNetIncome,
      totalWorkExperience: totalWorkExperience.trim(),
      employerOrBusinessName: finalEmployerName,
      existingMonthlyEmi: parsedExistingMonthlyEmi,
      existingHomeLoan: isExistingHomeLoan,
      existingHomeLoanDetails: finalExistingHomeLoanDetails,
      existingHomeLoanOutstanding: parsedExistingHomeLoanOutstanding,
      existingHomeLoanBank: finalExistingHomeLoanBank,
      coApplicant: isCoApplicant,
      coApplicantMonthlyIncome: finalCoApplicantMonthlyIncome,
      approximateCreditScore: standardizedCreditScore,
      status: "NEW",
      assignedTo: null,
      notes: "",
      userId,
      source: source || "homeloanswithcashback",
      metadata: {
        device,
        browser,
        submittedFrom: "/homeloanswithcashback"
      }
    });

    return NextResponse.json(
      { success: true, data: application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/homeloanapplications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
