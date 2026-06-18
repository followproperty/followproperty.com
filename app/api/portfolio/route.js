import { NextResponse } from 'next/server';
import { verifyAuthRequest } from '@/lib/auth-guards';
import connectToDatabase from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { calculateValuationForProperty } from '@/services/valuation/valuationEngine';
import { saveValuationSnapshot } from '@/services/valuation/saveValuationSnapshot';

export async function POST(request) {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
      response.cookies.set("token", "", { expires: new Date(0), path: "/" });
      response.cookies.set("user_role", "", { expires: new Date(0), path: "/" });
      response.cookies.set("builder_status", "", { expires: new Date(0), path: "/" });
      return response;
    }

    const { user, decodedToken } = authResult;
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const body = await request.json();
    
    // Validate parkingSpots is not negative
    if (body.parkingSpots !== undefined && body.parkingSpots !== null && body.parkingSpots !== "") {
      const parking = Number(body.parkingSpots);
      if (isNaN(parking) || parking < 0) {
        return NextResponse.json(
          { success: false, error: "Parking spots count cannot be negative." },
          { status: 400 }
        );
      }
    }
    
    // Calculate live circle rate/comparable valuation
    let valuation = {};
    try {
      valuation = await calculateValuationForProperty(body);
    } catch (valErr) {
      console.error("[Portfolio API] Valuation calculation failed:", valErr);
    }
    
    // Automatically inject user ownership mapping parameters
    const portfolio = await Portfolio.create({
      ...body,
      userId: user._id,
      firebaseUid,
      valuation
    });

    // Save valuation snapshot to history
    try {
      if (portfolio.valuation) {
        await saveValuationSnapshot(portfolio, portfolio.valuation);
      }
    } catch (histErr) {
      console.error("[Portfolio API] Failed to save valuation history snapshot:", histErr);
    }
    
    return NextResponse.json(
      { success: true, message: 'Portfolio property added successfully', data: portfolio },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
      response.cookies.set("token", "", { expires: new Date(0), path: "/" });
      response.cookies.set("user_role", "", { expires: new Date(0), path: "/" });
      response.cookies.set("builder_status", "", { expires: new Date(0), path: "/" });
      return response;
    }

    const { decodedToken } = authResult;
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();

    // Retrieve only portfolio properties belonging to this user
    const portfolios = await Portfolio.find({ firebaseUid }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: portfolios }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
