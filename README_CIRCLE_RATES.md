# Circle Rates Map & Data Pipeline Documentation

This documentation outlines the architecture, database models, and steps to update or add new states to the **Pan-India Circle Rates Map** visualization platform.

---

## 1. Architecture Overview

To provide a fast and scalable visual map that does not crash the client's browser, we use a **Hierarchical Level of Detail (LoD)** approach coupled with a **Unified Database Schema**.

*   **Map Interface**: Access it at `/circle-rates`. Renders interactive, color-coded state and district polygons using Leaflet.
*   **Calculations**: Re-runs automatically via `valuationEngine.js` for portfolio valuations.

---

## 2. Database Models & Schema

All spatial maps and circle rate data are stored in the main MongoDB database under two unified collections:

### A. `circle_rates` (Standardized Price Data)
Contains standard pricing records mapped to `stateCode`, `district`, and `locality`, with all rates converted to **INR per Square Feet**.
```typescript
interface CircleRate {
  stateCode: string;     // e.g. "HR", "DL", "UP"
  district: string;      // e.g. "Gurugram", "Lucknow", "Delhi"
  tehsil?: string;       // e.g. "Wazirabad" (Optional)
  locality: string;      // e.g. "Sector 45", "Aali"
  circleRate: number;    // Rate in INR/sqft (Normalized)
  unit: string;          // 'INR_PER_SQFT'
  originalRate: number;  // Original rate before normalization (Audit)
  originalUnit: string;  // Original unit before normalization (Audit)
  landUse: string;       // 'Residential' | 'Commercial' | 'Agricultural'
  createdAt: Date;
  updatedAt: Date;
}
```

### B. `geometries` (Map Boundary Polygons)
Contains official GIS polygons (coordinates) for rendering borders on Leaflet.
```typescript
interface Geometry {
  level: 'state' | 'district' | 'locality';
  stateCode: string;     // e.g. "HR"
  district?: string;     // e.g. "Gurugram" (for locality levels)
  name: string;          // Name of state/district/locality
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  }
}
```

---

## 3. Dynamic Backend API

### `[GET] /api/circle-rates`
Serves GeoJSON data dynamically on-demand depending on zoom/drill-down level.
*   **Query Parameters**:
    *   `level`: `state` | `district` | `locality` (Default: `state`)
    *   `stateCode`: e.g. `HR` (Optional)
    *   `district`: e.g. `Gurugram` (Optional)
*   **Behavior**: Dynamically joins the boundaries from `geometries` with matching averages from `circle_rates` on the fly, returning a clean GeoJSON FeatureCollection.

---

## 4. How to Add a New State (Step-by-Step)

When the scraper adds a new state (e.g. Maharashtra, `MH`) or you want to update existing data, follow these 5 steps:

### Step 1: Scraper Ingestion
Ensure your scraper writes the raw extracted data directly into the raw `circle_rate` database under the collection `circle_rate.<state_code>` (e.g. `circle_rate.mh`). 
*   *Note: Keeping raw scraper data isolated ensures that any crawler errors do not corrupt the live production database.*

### Step 2: Configure Normalization (ETL)
Open [scripts/normalize_circle_rates.mjs](file:///e:/goan/site/scripts/normalize_circle_rates.mjs). Add a migration block for the new state:
1.  Read records from `circle_rate.<state_code>`.
2.  Define unit conversion factors to standardize rates to **INR/sqft** (e.g., if Maharashtra uses square meters, divide by `10.7639`).
3.  Add names mapping (e.g., standardizing locality and district names).

### Step 3: Run Normalization
Execute the ETL script to clean and populate the unified database:
```bash
node scripts/normalize_circle_rates.mjs
```
Verify the output log showing total migrated records (corrupted entries/outliers $> ₹500,000/\text{sqft}$ are skipped automatically).

### Step 4: Import Official Map Shapes (GeoJSON)
Download the official `.geojson` boundary file for the new state (e.g., districts of Maharashtra). Run the import script:
```bash
# To import district boundaries:
node scripts/import_geojson.mjs data/maharashtra_districts.geojson district MH

# To import locality/sub-district boundaries:
node scripts/import_geojson.mjs data/mumbai_wards.geojson locality MH Mumbai
```
*Note: Make sure that the names in the GeoJSON name properties align with the locality names scraped from the government PDF.*

### Step 5: Update Frontend/API Configurations
*   **Valuation Provider**: If you want the portfolio calculation engine to resolve circle rates for the new state, add it to `resolveStateCode()` inside [governmentRateProvider.js](file:///e:/goan/site/services/valuation/providers/governmentRateProvider.js).
*   **Map API**: Ensure the new state code is added to query mappings. The Leaflet map page will dynamically load the new state immediately!

---

## 5. Cron Job Automation

A cron job can be scheduled to run `node scripts/normalize_circle_rates.mjs` nightly. This automatically picks up any new scraper edits, filters outliers, and pushes them to production.
