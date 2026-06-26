import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Geometry from '@/models/Geometry';
import CircleRate from '@/models/CircleRate';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'state';
    const stateCode = searchParams.get('stateCode');
    const district = searchParams.get('district');
    
    // 1. Build geometry query
    const geoQuery = { level };
    if (stateCode) geoQuery.stateCode = stateCode.toUpperCase();
    if (district) geoQuery.district = { $regex: new RegExp(district, 'i') };
    
    const geometries = await Geometry.find(geoQuery);
    
    // 2. Build circle rates query
    const rateQuery = {};
    if (stateCode) rateQuery.stateCode = stateCode.toUpperCase();
    if (district) rateQuery.district = { $regex: new RegExp(district, 'i') };
    
    const rates = await CircleRate.find(rateQuery);
    
    // Group rates by locality/district/state for fast join
    const rateMap = {};
    rates.forEach(r => {
      let key = '';
      if (level === 'state') {
        key = r.stateCode.toLowerCase().trim();
      } else if (level === 'district') {
        key = r.district.toLowerCase().trim();
      } else {
        key = r.locality.toLowerCase().trim();
      }
      
      if (!rateMap[key]) {
        rateMap[key] = {
          residential: [],
          commercial: [],
          agricultural: [],
          all: []
        };
      }
      rateMap[key].all.push(r.circleRate);
      if (r.landUse === 'Residential') rateMap[key].residential.push(r.circleRate);
      else if (r.landUse === 'Commercial') rateMap[key].commercial.push(r.circleRate);
      else if (r.landUse === 'Agricultural') rateMap[key].agricultural.push(r.circleRate);
    });
    
    // Compile averages
    const rateAverages = {};
    for (const [key, val] of Object.entries(rateMap)) {
      const avg = val.all.length ? Math.round(val.all.reduce((a, b) => a + b, 0) / val.all.length) : null;
      const res = val.residential.length ? Math.round(val.residential.reduce((a, b) => a + b, 0) / val.residential.length) : null;
      const com = val.commercial.length ? Math.round(val.commercial.reduce((a, b) => a + b, 0) / val.commercial.length) : null;
      const agr = val.agricultural.length ? Math.round(val.agricultural.reduce((a, b) => a + b, 0) / val.agricultural.length) : null;
      rateAverages[key] = { avg, residential: res, commercial: com, agricultural: agr };
    }
    
    // 3. Construct GeoJSON features list
    const features = geometries.map(geo => {
      const nameKey = (level === 'state' ? geo.stateCode : geo.name).toLowerCase().trim();
      const ratesInfo = rateAverages[nameKey] || { avg: null, residential: null, commercial: null, agricultural: null };
      
      return {
        type: 'Feature',
        properties: {
          name: geo.name,
          level: geo.level,
          stateCode: geo.stateCode,
          district: geo.district || '',
          circleRate: ratesInfo.avg,
          residentialRate: ratesInfo.residential,
          commercialRate: ratesInfo.commercial,
          agriculturalRate: ratesInfo.agricultural,
        },
        geometry: {
          type: geo.geometry.type,
          coordinates: geo.geometry.coordinates
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        type: 'FeatureCollection',
        features
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in GET /api/circle-rates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch circle rates map data' }, { status: 500 });
  }
}
