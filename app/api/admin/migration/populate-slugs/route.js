import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/admin-guards";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import { generateBuilderSlug, generateProjectSlug } from "@/utils/admin/normalization";

export const dynamic = "force-dynamic";

async function handleMigration(req) {
  try {
    // 1. Verify administrative credentials
    const authResult = await verifyAdminRequest();
    if (!authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get("dryRun") === "true";

    const report = {
      marketProjectsUpdated: 0,
      upcomingProjectsUpdated: 0,
      skipped: 0,
      collisionsResolved: 0,
      missingProjectNameCount: 0,
      missingBuilderNameCount: 0,
      emptyProjectSlugCount: 0,
      emptyBuilderSlugCount: 0,
      errors: []
    };

    // Processor helper for collections
    async function processCollection(Model, collectionName) {
      const projects = await Model.find({});
      
      // Store slugs allocated in the current execution batch to handle dry-run collisions properly
      const allocatedSlugs = new Set();

      for (const project of projects) {
        try {
          const builderName = project.builderName || "";
          const projectName = project.projectName || "";
          const city = project.city || "";

          let validationFailed = false;

          // 1. Missing Name Checks
          if (!projectName.trim()) {
            report.missingProjectNameCount++;
            validationFailed = true;
          }
          if (!builderName.trim()) {
            report.missingBuilderNameCount++;
            validationFailed = true;
          }

          if (validationFailed) {
            console.warn(`[SKIP] Missing metadata for document ID ${project._id} in ${collectionName}`);
            report.skipped++;
            continue;
          }

          const targetBuilderSlug = generateBuilderSlug(builderName);
          const baseProjectSlug = generateProjectSlug(projectName);

          // 2. Empty Slug Checks
          if (!targetBuilderSlug) {
            report.emptyBuilderSlugCount++;
            validationFailed = true;
          }
          if (!baseProjectSlug) {
            report.emptyProjectSlugCount++;
            validationFailed = true;
          }

          if (validationFailed) {
            console.warn(`[SKIP] Empty generated slugs for document ID ${project._id} in ${collectionName}`);
            report.skipped++;
            continue;
          }

          let candidateProjectSlug = baseProjectSlug;
          let attempt = 0;
          let collisionOccurred = false;

          while (true) {
            const compositeKey = `${targetBuilderSlug}/${candidateProjectSlug}`;
            const inBatch = allocatedSlugs.has(compositeKey);

            let inDb = false;
            if (!inBatch) {
              const existing = await Model.findOne({
                builderSlug: targetBuilderSlug,
                projectSlug: candidateProjectSlug,
                _id: { $ne: project._id }
              }).lean();
              if (existing) {
                inDb = true;
              }
            }

            if (!inBatch && !inDb) {
              allocatedSlugs.add(compositeKey);
              break;
            }

            collisionOccurred = true;
            attempt++;
            if (attempt === 1 && city) {
              const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              candidateProjectSlug = `${baseProjectSlug}-${citySlug}`;
            } else if (city) {
              const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              candidateProjectSlug = `${baseProjectSlug}-${citySlug}-${attempt}`;
            } else {
              candidateProjectSlug = `${baseProjectSlug}-${attempt}`;
            }
          }

          const needsUpdate = 
            project.builderSlug !== targetBuilderSlug || 
            project.projectSlug !== candidateProjectSlug;

          if (needsUpdate) {
            if (collisionOccurred) {
              report.collisionsResolved++;
            }

            if (!dryRun) {
              project.builderSlug = targetBuilderSlug;
              project.projectSlug = candidateProjectSlug;
              await project.save({ validateBeforeSave: false });
            }

            if (collectionName === "MarketProject") {
              report.marketProjectsUpdated++;
            } else {
              report.upcomingProjectsUpdated++;
            }
          } else {
            report.skipped++;
            // Re-allocate to prevent duplicates matching already correct entries
            const compositeKey = `${project.builderSlug}/${project.projectSlug}`;
            allocatedSlugs.add(compositeKey);
          }
        } catch (err) {
          console.error(`Error migrating project ${project._id}:`, err);
          report.errors.push(`Project ${project._id} in ${collectionName}: ${err.message}`);
        }
      }
    }

    await processCollection(MarketProject, "MarketProject");
    await processCollection(UpcomingProject, "UpcomingProject");

    return NextResponse.json({
      success: true,
      dryRun,
      data: report
    }, { status: 200 });

  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Migration process failed" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return handleMigration(req);
}

export async function POST(req) {
  return handleMigration(req);
}
