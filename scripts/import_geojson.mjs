import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables manually from .env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at ${envPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
}

loadEnv();

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Usage: 
  node scripts/import_geojson.mjs <file-path> <level> <state-code> [district-name]

Arguments:
  <file-path>     : Path to the GeoJSON file (e.g. data/haryana_districts.json)
  <level>         : 'state' | 'district' | 'locality'
  <state-code>    : Two-letter state code (e.g. 'HR', 'DL', 'UP')
  [district-name] : (Optional) District name if importing localities/sectors

Example:
  node scripts/import_geojson.mjs data/delhi_wards.geojson locality DL Delhi
    `);
    process.exit(1);
  }

  const [filePath, level, stateCode, district = ''] = args;

  if (!['state', 'district', 'locality'].includes(level)) {
    console.error("Error: level must be 'state', 'district', or 'locality'.");
    process.exit(1);
  }

  // 1. Read and parse GeoJSON file
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  let geojson;
  try {
    const rawData = fs.readFileSync(absolutePath, 'utf8');
    geojson = JSON.parse(rawData);
  } catch (err) {
    console.error("Error: Failed to parse GeoJSON file. Ensure it is valid JSON.", err.message);
    process.exit(1);
  }

  const features = geojson.features;
  if (!Array.isArray(features)) {
    console.error("Error: Input is not a valid GeoJSON FeatureCollection (missing 'features' array).");
    process.exit(1);
  }

  console.log(`Successfully parsed GeoJSON. Found ${features.length} features.`);

  try {
    const { default: connectToDatabase } = await import('../lib/db.js');
    const { default: Geometry } = await import('../models/Geometry.js');

    await connectToDatabase();
    console.log("Connected to MongoDB.");

    const geometriesToInsert = [];

    for (let index = 0; index < features.length; index++) {
      const f = features[index];
      if (!f.geometry || !['Polygon', 'MultiPolygon'].includes(f.geometry.type)) {
        console.warn(`[Skip] Feature #${index} lacks Polygon/MultiPolygon geometry type.`);
        continue;
      }

      // Try to find the name of the feature from properties
      const props = f.properties || {};
      const possibleNameFields = [
        'name', 'NAME', 'Name', 
        'district', 'DISTRICT', 'District',
        'tehsil', 'TEHSIL', 'Tehsil',
        'subdistrict', 'SUBDISTRICT', 
        'state', 'STATE', 'State_Name',
        'ward_name', 'wardname', 'wardNo', 'WARD_NO',
        'colony', 'COLONY', 'locality', 'LOCALITY'
      ];

      let name = '';
      for (const field of possibleNameFields) {
        if (props[field] !== undefined && props[field] !== null && String(props[field]).trim() !== '') {
          name = String(props[field]).trim();
          break;
        }
      }

      if (!name) {
        // Fallback to index if no name property is found
        name = `${level.charAt(0).toUpperCase() + level.slice(1)} #${index + 1}`;
      }

      geometriesToInsert.push({
        level,
        stateCode: stateCode.toUpperCase(),
        district: district || props.district || props.DISTRICT || '',
        name,
        geometry: {
          type: f.geometry.type,
          coordinates: f.geometry.coordinates
        }
      });
    }

    if (geometriesToInsert.length === 0) {
      console.log("No valid geometries found to insert.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Inserting ${geometriesToInsert.length} geometry records...`);
    
    // Optional: Clear existing geometries for this level/state to avoid duplicates
    const clearQuery = { level, stateCode: stateCode.toUpperCase() };
    if (district) clearQuery.district = district;
    await Geometry.deleteMany(clearQuery);
    console.log("Cleared old shapes matching current level & state.");

    await Geometry.insertMany(geometriesToInsert);
    console.log(`Successfully imported ${geometriesToInsert.length} geometries into the database!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical error in GeoJSON import script:", err);
    process.exit(1);
  }
}

run();
