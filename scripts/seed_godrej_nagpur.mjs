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
    const { default: UpcomingProject } = await import('../models/UpcomingProject.js');
    const { default: User } = await import('../models/User.js');

    await connectToDatabase();
    console.log("Database connected successfully.");

    // Retrieve or create an admin user for the createdBy / createdByEmail fields
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    
    if (!adminUser) {
      console.log("No users found in database. Creating a placeholder system admin...");
      adminUser = await User.create({
        firebaseUid: "system-seeder-admin-uid-12345",
        firstName: "System",
        lastName: "Seeder",
        email: "admin@followproperty.com",
        role: "admin",
        isOnboarded: true,
        onboardingCompleted: true
      });
      console.log(`Created system admin with ID: ${adminUser._id}`);
    } else {
      console.log(`Using existing user for audit: ${adminUser.email} (ID: ${adminUser._id})`);
    }

    // Check if Godrej Nagpur project already exists
    const existingProject = await UpcomingProject.findOne({
      projectName: "Godrej Nagpur",
      builderName: "Godrej Properties Ltd.",
      city: "Nagpur"
    });

    if (existingProject) {
      console.log("Project 'Godrej Nagpur' already exists in the database. Updating it with current fields...");
      
      existingProject.propertyType = "Plot";
      existingProject.status = "Under Construction";
      existingProject.locality = "MIHAN";
      existingProject.location = "MIHAN SEZ – Nagpur IT Hub";
      existingProject.bhk = [];
      existingProject.minPrice = 7650000;
      existingProject.maxPrice = 18000000;
      existingProject.minArea = 1500;
      existingProject.maxArea = 3000;
      existingProject.possessionYear = 2027;
      existingProject.launchingPrice = "₹5,500/sq.ft.";
      existingProject.units = "~1,000 plots";
      existingProject.totalArea = "75 Acres";
      existingProject.perSqftRate = "₹5,500/sq.ft.";
      existingProject.unitSize = "1,500 - 3,000 sq.ft.";
      existingProject.configuration = "Twin Bungalow & SCO Plots";
      existingProject.marketPrice = "₹76.5 Lakh - ₹1.80 Cr";
      existingProject.superArea = "1,500 - 3,000";
      existingProject.images = [];
      
      await existingProject.save();
      console.log(`Successfully updated existing project (ID: ${existingProject._id})`);
    } else {
      console.log("Creating new Godrej Nagpur project...");
      const newProject = await UpcomingProject.create({
        projectName: "Godrej Nagpur",
        builderName: "Godrej Properties Ltd.",
        propertyType: "Plot",
        status: "Under Construction",
        city: "Nagpur",
        state: "Maharashtra",
        locality: "MIHAN",
        location: "MIHAN SEZ – Nagpur IT Hub",
        bhk: [],
        minPrice: 7650000,
        maxPrice: 18000000,
        minArea: 1500,
        maxArea: 3000,
        possessionYear: 2027,
        launchingPrice: "₹5,500/sq.ft.",
        units: "~1,000 plots",
        totalArea: "75 Acres",
        perSqftRate: "₹5,500/sq.ft.",
        unitSize: "1,500 - 3,000 sq.ft.",
        configuration: "Twin Bungalow & SCO Plots",
        marketPrice: "₹76.5 Lakh - ₹1.80 Cr",
        superArea: "1,500 - 3,000",
        projectPdf: "",
        images: [],
        videos: [],
        projectSource: "upcoming",
        createdBy: adminUser._id,
        createdByEmail: adminUser.email
      });
      console.log(`Successfully created new project (ID: ${newProject._id})`);
    }

    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Critical error seeding project:", err);
    process.exit(1);
  }
}

run();
