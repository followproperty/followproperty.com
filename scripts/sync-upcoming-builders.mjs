import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
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
  try {
    const { default: connectToDatabase } = await import('../lib/db.js');
    const { default: Builder } = await import('../models/Builder.js');
    const { default: UpcomingProject } = await import('../models/UpcomingProject.js');
    const { default: MarketProject } = await import('../models/MarketProject.js');
    const { normalizeBuilder, generateBuilderSlug } = await import('../utils/admin/normalization.js');

    await connectToDatabase();
    console.log("Database connected successfully.\n");

    // 1. Get distinct builder names from both collections
    const upcomingBuilders = await UpcomingProject.distinct("builderName");
    const marketBuilders = await MarketProject.distinct("builderName");

    const allRawBuilders = Array.from(new Set([...upcomingBuilders, ...marketBuilders])).filter(Boolean);
    console.log(`Found ${allRawBuilders.length} unique builder names across projects.`);

    // 2. Ensure all builders exist in the Builder collection
    let createdCount = 0;
    let existingCount = 0;

    for (const rawName of allRawBuilders) {
      const canonicalName = normalizeBuilder(rawName);
      if (!canonicalName) continue;

      const slug = generateBuilderSlug(canonicalName);
      if (!slug) continue;

      let builder = await Builder.findOne({
        $or: [{ name: canonicalName }, { slug }]
      });

      if (!builder) {
        builder = await Builder.create({
          name: canonicalName,
          slug,
          status: "active"
        });
        console.log(`[CREATED] Builder profile: "${canonicalName}" | Slug: "${slug}"`);
        createdCount++;
      } else {
        existingCount++;
      }
    }

    console.log(`\nBuilder Sync Completed: Created: ${createdCount}, Existing: ${existingCount}.`);

    // 3. Fetch all builders to create a cache map for quick lookups
    const buildersList = await Builder.find({}).lean();
    const builderSlugToIdMap = {};
    const builderNameToIdMap = {};

    buildersList.forEach(b => {
      builderSlugToIdMap[b.slug] = b._id;
      builderNameToIdMap[b.name.toLowerCase()] = b._id;
    });

    // Helper to resolve builderId for a project
    const resolveBuilderId = (p) => {
      if (p.builderSlug && builderSlugToIdMap[p.builderSlug]) {
        return builderSlugToIdMap[p.builderSlug];
      }
      const normName = normalizeBuilder(p.builderName);
      if (normName && builderNameToIdMap[normName.toLowerCase()]) {
        return builderNameToIdMap[normName.toLowerCase()];
      }
      const rawSlug = generateBuilderSlug(p.builderName);
      if (rawSlug && builderSlugToIdMap[rawSlug]) {
        return builderSlugToIdMap[rawSlug];
      }
      return null;
    };

    // 4. Migrate UpcomingProjects: set builderId if missing
    console.log("\nMigrating UpcomingProject documents...");
    const upcomingProjects = await UpcomingProject.find({}).lean();
    let upcomingUpdated = 0;

    for (const p of upcomingProjects) {
      const bId = resolveBuilderId(p);
      if (bId) {
        // Only update if builderId doesn't match or is missing
        if (!p.builderId || p.builderId.toString() !== bId.toString()) {
          await UpcomingProject.updateOne({ _id: p._id }, { $set: { builderId: bId } });
          upcomingUpdated++;
        }
      } else {
        console.warn(`[WARNING] Could not resolve builderId for UpcomingProject "${p.projectName}" by "${p.builderName}"`);
      }
    }
    console.log(`Updated ${upcomingUpdated} UpcomingProject documents.`);

    // 5. Migrate MarketProjects: set builderId if missing
    console.log("\nMigrating MarketProject documents...");
    const marketProjects = await MarketProject.find({ builderId: null }).lean();
    let marketUpdated = 0;

    for (const p of marketProjects) {
      const bId = resolveBuilderId(p);
      if (bId) {
        await MarketProject.updateOne({ _id: p._id }, { $set: { builderId: bId } });
        marketUpdated++;
      } else {
        console.warn(`[WARNING] Could not resolve builderId for MarketProject "${p.projectName}" by "${p.builderName}"`);
      }
    }
    console.log(`Updated ${marketUpdated} MarketProject documents.`);

    console.log("\nMigration execution finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

run();
