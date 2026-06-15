import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

/**
 * Verifies a Firebase ID token with the Next.js server-side endpoint.
 * Useful for establishing session state or syncing auth data.
 */
export const verifyTokenWithServer = async (idToken) => {
    try {
        const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: idToken }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.message || "Failed to verify token with server",
        };
    }
};

export const signupWithEmail = async (email, password, profileData = {}) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Register user in MongoDB via registration API
        await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firebaseUid: user.uid,
                email,
                firstName: profileData.firstName || "",
                lastName: profileData.lastName || "",
                phoneNumber: profileData.phoneNumber || "",
                city: profileData.city || "",
                state: profileData.state || "",
                isBuilder: profileData.isBuilder || false
            })
        });

        // 1. Immediately sign out the user so they do not hold an active client session
        await signOut(auth);

        return {
            success: true,
            requiresVerification: true,
            message: "Verification email sent. Please verify your email before login.",
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};

export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        // 1. Check if email is verified
        if (!userCredential.user.emailVerified) {
            // Immediately sign out to clear active token/auth session
            await signOut(auth);
            return {
                success: false,
                emailVerified: false,
                message: "Please verify your email before continuing.",
            };
        }

        // Get Firebase ID token
        const token = await userCredential.user.getIdToken();
        
        // Verify token with the server to sync auth session
        const verification = await verifyTokenWithServer(token);

        return {
            success: true,
            user: userCredential.user,
            token,
            verification,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);

        if (typeof window !== "undefined") {
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("isAuthenticated");
        }

        // Clear the secure HTTP-only cookie on the server
        await fetch("/api/auth/logout", { method: "POST" });

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};