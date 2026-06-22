import { NextResponse } from 'next/server';
import { verifyAuthRequest } from '@/lib/auth-guards';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // 1. Verify user authentication
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

    const { searchParams } = new URL(request.url);
    const state = (searchParams.get("state") || "HR").toUpperCase(); // Default to Haryana
    const district = searchParams.get("district") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const validStates = ["GJ", "DL", "KA", "HR", "TN", "AP", "UP", "MH"];
    if (!validStates.includes(state)) {
      return NextResponse.json(
        { success: false, error: `Invalid or unsupported state code. Supported states are: ${validStates.join(", ")}` },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const client = mongoose.connection.client;
    const db = client.db('rera');
    const collectionName = `rera.${state.toLowerCase()}`;

    // Build filters
    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { project_name: searchRegex },
        { promoter_name: searchRegex },
        { registration_no: searchRegex }
      ];
    }

    if (district) {
      const escapedDistrict = district.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.district = { $regex: new RegExp(escapedDistrict, 'i') };
    }

    const skip = (page - 1) * limit;

    const total = await db.collection(collectionName).countDocuments(filter);
    
    const items = await db.collection(collectionName)
      .find(filter)
      .sort({ created_at: -1, last_scraped_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/rera:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
