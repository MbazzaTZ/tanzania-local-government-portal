// Firebase v10 Modular SDK
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Global variables provided by the sandbox environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Function to handle initial authentication
export const initializeAuth = async () => {
  try {
    if (typeof __initial_auth_token !== 'undefined') {
      await signInWithCustomToken(auth, __initial_auth_token);
      console.log("Signed in with custom token.");
    } else {
      await signInAnonymously(auth);
      console.log("Signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase authentication error:", error);
  }
};

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check for admin role
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      // A user can create their own document (e.g., on registration)
      allow create: if request.auth.uid == userId;
      
      // A user can read their own document. An admin can read any user document.
      allow read: if request.auth.uid == userId || isAdmin();
      
      // Only admins can update user roles or delete user documents
      allow update, delete: if isAdmin();
    }
    
    // Add rules for other collections as your application grows
  }
}

// In firebase-config.js
import { getStorage } from "firebase/storage";
// ... other imports

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Add this line

import { db } from '../firebase-config';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

// --- ADD THIS NEW FUNCTION ---
// Fetches all users with a 'pending_review' status
export const fetchPendingUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef, 
      where("verificationStatus", "==", "pending_review"),
      orderBy("createdAt", "asc") // Oldest first
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching pending users:", error);
    throw new Error("Could not fetch pending users.");
  }
};

// --- ADD THIS NEW FUNCTION ---
// Updates a user's status and sends a notification
export const updateUserVerificationStatus = async (userId, newStatus, reason = "") => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { verificationStatus: newStatus });
    
    // Send a notification based on the new status
    let message = "";
    if (newStatus === "approved") {
      message = "Congratulations! Your account has been verified and approved.";
    } else if (newStatus === "rejected") {
      message = `Your application was rejected. Reason: ${reason || "No reason provided."}`;
    }

    if (message) {
      await createNotification(userId, message);
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Could not update user verification status.");
  }
};

// This function should already exist from our previous discussion
const createNotification = async (userId, message, link = null) => {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      link,
      status: 'unread',
      createdAt: serverTimestamp(),
    });
};

// Your other service functions (fetchUsers, etc.) would also be in this file...

import { db, storage } from '../firebase-config'; // Make sure storage is exported
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- ADD THIS NEW FUNCTION ---
export const submitResidenceLetterRequest = async (userId, idMethod, formData, documentFile) => {
  try {
    let documentUrl = '';

    // Step 1: Upload the document if it exists
    if (documentFile) {
      const storageRef = ref(storage, `residence_requests/${userId}/${Date.now()}_${documentFile.name}`);
      await uploadBytes(storageRef, documentFile);
      documentUrl = await getDownloadURL(storageRef);
    }
    
    // Step 2: Construct the data object based on the ID Method
    const requestData = {
      userId: userId,
      status: 'pending_review', // Default status for all new applications
      createdAt: serverTimestamp(),
      escalation: { status: 'none', notes: '' }, // Default escalation state
      verification: {
        method: idMethod,
        documentUrl: documentUrl,
        // Dynamically add identifier and details from the form
        identifier: formData.nin || formData.necNumber || formData.passportNumber || formData.birthCertNumber || formData.examNumber,
        details: {
            // Add method-specific details
            ...(idMethod === 'PASSPORT' && { countryOfIssue: formData.countryOfIssue }),
            ...(idMethod === 'STUDENT' && { 
                level: formData.studentLevel, 
                schoolName: formData.schoolName 
            }),
        }
      }
    };
    
    // Step 3: Save the request to the 'letter_requests' collection in Firestore
    await addDoc(collection(db, 'letter_requests'), requestData);

  } catch (error) {
    console.error("Error submitting residence letter request:", error);
    // Re-throw the error to be caught by the component
    throw error;
  }
};