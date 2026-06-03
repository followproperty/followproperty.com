import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/db';
import Watchlist from '@/models/Watchlist';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get authenticated user from session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Find MongoDB User
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found in database." },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate budget (strictly greater than zero)
    if (!body.budget || isNaN(Number(body.budget)) || Number(body.budget) <= 0) {
      return NextResponse.json(
        { success: false, error: "Budget must be a positive number greater than zero." },
        { status: 400 }
      );
    }
    
    // Automatically inject user ownership mapping parameters
    const watchlist = await Watchlist.create({
      ...body,
      userId: user._id,
      firebaseUid
    });
    
    return NextResponse.json(
      { success: true, message: 'Watchlist created successfully', data: watchlist },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/watchlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    // Get authenticated user from session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Retrieve only watchlist configurations belonging to this user
    const watchlists = await Watchlist.find({ firebaseUid }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: watchlists }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
