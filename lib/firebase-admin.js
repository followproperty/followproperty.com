import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
    let credential;

    // 1. Try to load service account from environment variable as JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(sa);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e);
        }
    } 
    // 2. Try individual environment variables
    else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Support either NEXT_PUBLIC_FIREBASE_PROJECT_ID or FIREBASE_PROJECT_ID or cloud default envs
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
                          process.env.FIREBASE_PROJECT_ID || 
                          process.env.GOOGLE_CLOUD_PROJECT || 
                          process.env.GCLOUD_PROJECT;

        // Clean Vercel private key format (covers literal \n and standard newline strings)
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        if (!projectId) {
            console.error("Firebase Initialization Error: Client email and private key are provided, but no Firebase Project ID was detected.");
        }

        credential = admin.credential.cert({
            projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        });
    } 
    // 3. Try to read local serviceAccountKey.json if it exists (using fs to avoid static import compiler crashes)
    else {
        const keyPath = path.join(process.cwd(), "lib", "serviceAccountKey.json");
        if (fs.existsSync(keyPath)) {
            try {
                const keyData = JSON.parse(fs.readFileSync(keyPath, "utf8"));
                credential = admin.credential.cert(keyData);
            } catch (e) {
                console.error("Failed to read local serviceAccountKey.json:", e);
            }
        }
    }

    // Fallback to application default credentials (useful in Google Cloud environments)
    if (!credential) {
        try {
            credential = admin.credential.applicationDefault();
        } catch (e) {
            console.warn("No Firebase Admin credentials configured. Server verification may fail.");
        }
    }

    admin.initializeApp({
        credential,
    });
}

export const adminAuth = admin.auth();
export default admin;