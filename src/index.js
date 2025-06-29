const functions = require("firebase-functions");
const axios = require("axios"); // A popular library for making HTTP requests

// Initialize NIDA API configuration from secure environment variables
const NIDA_API_URL = "https://api.nida.go.tz/v1/verify/"; // This is an assumed URL. Use the official one.
const NIDA_API_KEY = functions.config().nida.apikey;

exports.verifyNidaDetails = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated before calling
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to perform this action."
    );
  }

  const nin = data.nin;
  if (!nin || nin.length < 10) { // Add validation for the NIN format
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid National Identification Number (NIN) is required."
    );
  }

  try {
    const response = await axios.get(`${NIDA_API_URL}${nin}`, {
      headers: {
        "Authorization": `Bearer ${NIDA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Check if NIDA API returned a successful response
    if (response.status === 200 && response.data) {
      // Return only the necessary data to the client
      // e.g., fullName, dateOfBirth, etc.
      return {
        fullName: response.data.fullName,
        dateOfBirth: response.data.dateOfBirth,
        photo: response.data.photo_base64, // Example field
        //... other details you need
      };
    } else {
      // Handle cases where NIDA returns an error (e.g., NIN not found)
      throw new functions.https.HttpsError("not-found", "NIN not found or invalid.");
    }
  } catch (error) {
    console.error("NIDA API Call Failed:", error);
    // Return a generic error to the client without exposing internal details
    throw new functions.https.HttpsError(
      "internal",
      "The NIDA verification service could not be reached. Please try again later."
    );
  }
});