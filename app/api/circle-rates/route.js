import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Geometry from '@/models/Geometry';
import CircleRate from '@/models/CircleRate';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    // Global search query
    if (q) {
      const queryStr = q.trim();
      if (!queryStr) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }

      // 1. Search matching local geometries across all levels
      const matchedGeometries = await Geometry.find({
        name: { $regex: new RegExp(queryStr, 'i') }
      }).limit(8);

      // Fetch all rates for supported states to map against search results in-memory
      const rates = await CircleRate.find({
        stateCode: { $in: ['DL', 'HR', 'UP'] }
      });

      // Build rateMap standardizing Gurgaon/Gurugram names
      const rateMap = {};
      rates.forEach(r => {
        const stateKey = `state-${r.stateCode.toLowerCase()}`;
        
        const rawDistrict = r.district || '';
        const distName = (rawDistrict.toLowerCase() === 'gurgaon' || rawDistrict.toLowerCase() === 'gurugram') ? 'gurugram' : rawDistrict.toLowerCase();
        const distKey = `district-${distName}`;
        
        const rawLocality = r.locality || '';
        const locKey = `locality-${distName}-${rawLocality.toLowerCase()}`;

        if (!rateMap[stateKey]) rateMap[stateKey] = { residential: [], commercial: [], agricultural: [], all: [], confidences: [] };
        if (!rateMap[distKey]) rateMap[distKey] = { residential: [], commercial: [], agricultural: [], all: [], confidences: [] };
        if (!rateMap[locKey]) rateMap[locKey] = { residential: [], commercial: [], agricultural: [], all: [], confidences: [] };

        rateMap[stateKey].all.push(r.circleRate);
        rateMap[distKey].all.push(r.circleRate);
        rateMap[locKey].all.push(r.circleRate);

        const confVal = r.confidence || 'high';
        rateMap[stateKey].confidences.push(confVal);
        rateMap[distKey].confidences.push(confVal);
        rateMap[locKey].confidences.push(confVal);

        if (r.landUse === 'Residential') {
          rateMap[stateKey].residential.push(r.circleRate);
          rateMap[distKey].residential.push(r.circleRate);
          rateMap[locKey].residential.push(r.circleRate);
        } else if (r.landUse === 'Commercial') {
          rateMap[stateKey].commercial.push(r.circleRate);
          rateMap[distKey].commercial.push(r.circleRate);
          rateMap[locKey].commercial.push(r.circleRate);
        } else if (r.landUse === 'Agricultural') {
          rateMap[stateKey].agricultural.push(r.circleRate);
          rateMap[distKey].agricultural.push(r.circleRate);
          rateMap[locKey].agricultural.push(r.circleRate);
        }
      });

      // Compile matches from local geometries
      const results = matchedGeometries.map(geo => {
        let name = geo.name;
        if (name.toLowerCase() === 'gurgaon' || name.toLowerCase() === 'gurugram') {
          name = 'Gurugram';
        }

        let key = '';
        if (geo.level === 'state') key = `state-${geo.stateCode.toLowerCase()}`;
        else if (geo.level === 'district') key = `district-${name.toLowerCase()}`;
        else key = `locality-${(geo.district || '').toLowerCase()}-${name.toLowerCase()}`;

        const areaMap = rateMap[key] || { residential: [], commercial: [], agricultural: [], all: [], confidences: [] };
        const avg = areaMap.all.length ? Math.round(areaMap.all.reduce((a, b) => a + b, 0) / areaMap.all.length) : null;
        const res = areaMap.residential.length ? Math.round(areaMap.residential.reduce((a, b) => a + b, 0) / areaMap.residential.length) : null;
        const com = areaMap.commercial.length ? Math.round(areaMap.commercial.reduce((a, b) => a + b, 0) / areaMap.commercial.length) : null;
        const agr = areaMap.agricultural.length ? Math.round(areaMap.agricultural.reduce((a, b) => a + b, 0) / areaMap.agricultural.length) : null;

        const confs = areaMap.confidences || [];
        const confidence = confs.includes('low') ? 'low' : confs.includes('medium') ? 'medium' : 'high';

        return {
          name,
          level: geo.level,
          stateCode: geo.stateCode,
          district: geo.district || '',
          circleRate: avg,
          residentialRate: res,
          commercialRate: com,
          agriculturalRate: agr,
          confidence,
          geometry: {
            type: geo.geometry.type,
            coordinates: geo.geometry.coordinates
          }
        };
      });

      // 2. Fallback to OpenStreetMap Nominatim Geocoder if local database returns insufficient results
      if (results.length < 5) {
        try {
          const queryEncoded = encodeURIComponent(queryStr);
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${queryEncoded}&format=json&countrycodes=in&limit=5&polygon_geojson=1`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 seconds timeout
          
          const response = await fetch(nominatimUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'FollowPropertyCircleRates/1.0 (contact@followproperty.com)'
            }
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            data.forEach(item => {
              // Standardize name mapping
              let name = item.name;
              if (name.toLowerCase() === 'gurgaon' || name.toLowerCase() === 'gurugram') {
                name = 'Gurugram';
              }

              // Deduplicate results against already found local matches
              const nameLower = name.toLowerCase();
              const isDuplicate = results.some(r => r.name.toLowerCase().includes(nameLower) || nameLower.includes(r.name.toLowerCase()));
              
              if (!isDuplicate && item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')) {
                // Determine appropriate state code from display_name (e.g. "Ballia, Uttar Pradesh, India" -> "UP")
                const displayName = item.display_name || '';
                let stateCode = 'IN'; // National fallback default
                if (displayName.includes('Uttar Pradesh')) stateCode = 'UP';
                else if (displayName.includes('Delhi')) stateCode = 'DL';
                else if (displayName.includes('Haryana')) stateCode = 'HR';
                
                // Determine level (boundary class -> district / administrative city)
                const isDistrict = item.class === 'boundary' && (item.type === 'administrative' || item.type === 'political');
                const level = isDistrict ? 'district' : 'locality';
                
                // Determine standardized district name
                let district = item.display_name.split(',')[1]?.trim() || '';
                if (district.toLowerCase() === 'gurgaon' || district.toLowerCase() === 'gurugram') {
                  district = 'Gurugram';
                }

                // Check for circle rate matches in our memory map
                let key = '';
                if (level === 'state') key = `state-${stateCode.toLowerCase()}`;
                else if (level === 'district') key = `district-${name.toLowerCase()}`;
                else key = `locality-${district.toLowerCase()}-${name.toLowerCase()}`;

                const areaMap = rateMap[key] || { residential: [], commercial: [], agricultural: [], all: [], confidences: [] };
                const avg = areaMap.all.length ? Math.round(areaMap.all.reduce((a, b) => a + b, 0) / areaMap.all.length) : null;
                const res = areaMap.residential.length ? Math.round(areaMap.residential.reduce((a, b) => a + b, 0) / areaMap.residential.length) : null;
                const com = areaMap.commercial.length ? Math.round(areaMap.commercial.reduce((a, b) => a + b, 0) / areaMap.commercial.length) : null;
                const agr = areaMap.agricultural.length ? Math.round(areaMap.agricultural.reduce((a, b) => a + b, 0) / areaMap.agricultural.length) : null;

                const confs = areaMap.confidences || [];
                const confidence = confs.includes('low') ? 'low' : confs.includes('medium') ? 'medium' : 'high';

                results.push({
                  name,
                  level,
                  stateCode,
                  district,
                  circleRate: avg,
                  residentialRate: res,
                  commercialRate: com,
                  agriculturalRate: agr,
                  confidence,
                  geometry: {
                    type: item.geojson.type,
                    coordinates: item.geojson.coordinates
                  }
                });
              }
            });
          }
        } catch (nErr) {
          console.error("OSM Nominatim geocoding failed or timed out:", nErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        data: results
      }, { status: 200 });
    }

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
          all: [],
          confidences: []
        };
      }
      rateMap[key].all.push(r.circleRate);
      rateMap[key].confidences.push(r.confidence || 'high');
      
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
      
      const confs = val.confidences || [];
      const confidence = confs.includes('low') ? 'low' : confs.includes('medium') ? 'medium' : 'high';
      
      rateAverages[key] = { avg, residential: res, commercial: com, agricultural: agr, confidence };
    }
    
    // 3. Construct GeoJSON features list
    const features = geometries.map(geo => {
      const nameKey = (level === 'state' ? geo.stateCode : geo.name).toLowerCase().trim();
      const ratesInfo = rateAverages[nameKey] || { avg: null, residential: null, commercial: null, agricultural: null, confidence: 'high' };
      
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
          confidence: ratesInfo.confidence || 'high'
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
