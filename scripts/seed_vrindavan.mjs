import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Node script to seed Vrindavan project
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

// Let's load env
const envPath = `${__dirname}/../.env`;
if (fs.existsSync(envPath)) {
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

    // Check if Vrindavan project already exists
    const existingProject = await UpcomingProject.findOne({
      projectName: "Vrindavan Plotting Project",
      builderName: "Follow Property",
      city: "Vrindavan"
    });

    const projectData = {
      projectName: "Vrindavan Plotting Project",
      builderName: "Follow Property",
      propertyType: "Plot",
      status: "Under Construction",
      city: "Vrindavan",
      state: "Uttar Pradesh",
      locality: "Vrindavan Gateway",
      location: "Vrindavan Integrated Township, Uttar Pradesh",
      bhk: [],
      minPrice: 4500000, // 100 Sq Yd * 45k
      maxPrice: 11250000, // 250 Sq Yd * 45k
      minArea: 900, // Sqft (100 Sq Yd)
      maxArea: 2250, // Sqft (250 Sq Yd)
      possessionYear: 2028,
      launchingPrice: "₹45,000/sq.yd.",
      units: "200 Acres Township",
      totalArea: "200 Acres",
      perSqftRate: "₹5,000/sq.ft.",
      unitSize: "100 - 250 sq.yd.",
      configuration: "Plots (100 - 250 Sq. Yd.)",
      marketPrice: "₹45 Lakh - ₹1.12 Cr",
      superArea: "100 - 250",
      projectPdf: "/Vrindavan_Project_Follow_Property.pdf",
      images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200"],
      videos: [],
      projectSource: "upcoming",
      createdBy: adminUser._id,
      createdByEmail: adminUser.email
    };

    if (existingProject) {
      console.log("Project 'Vrindavan Plotting Project' already exists in the database. Updating...");
      Object.assign(existingProject, projectData);
      await existingProject.save();
      console.log(`Successfully updated existing project (ID: ${existingProject._id})`);
    } else {
      console.log("Creating new Vrindavan Plotting Project...");
      const newProject = await UpcomingProject.create(projectData);
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
