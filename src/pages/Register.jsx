import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db, storage } from "../firebase-config"; // Ensure storage is exported from firebase-config

export default function Register() {
  const navigate = useNavigate();

  // State for different UI flows
  const [registrationMode, setRegistrationMode] = useState('NIDA'); // 'NIDA', 'MANUAL', 'PARENT'

  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nin, setNin] = useState("");
  const [parentNin, setParentNin] = useState("");
  const [manualFullName, setManualFullName] = useState("");
  const [manualDob, setManualDob] = useState("");
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);

  // State for API data and UI feedback
  const [nidaData, setNidaData] = useState(null);
  const [parentNidaData, setParentNidaData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Function to clear messages
  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // --- NIDA Verification Handler ---
  const handleNidaVerify = async (nidaNumber, type) => {
    if (!nidaNumber) {
      setError(`Please enter a ${type} NIDA number.`);
      return;
    }
    setIsLoading(true);
    clearMessages();

    try {
      const functions = getFunctions();
      const verifyNidaDetails = httpsCallable(functions, 'verifyNidaDetails');
      const result = await verifyNidaDetails({ nin: nidaNumber });

      if (type === 'user') {
        setNidaData(result.data);
        setMessage("Your NIDA details have been verified successfully!");
      } else if (type === 'parent') {
        setParentNidaData(result.data);
        setMessage("Parent/Guardian NIDA details verified successfully!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- File Input Handler ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Please upload a file smaller than 5MB.");
        return;
    }
    if(file){
        setSupportingDocument(file);
    }
  };

  // --- Main Registration Handler ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      // Step 1: Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let userData = {
        email: user.email,
        role: "mwananchi",
        createdAt: serverTimestamp(),
      };

      // Step 2: Prepare user data based on registration mode
      if (registrationMode === 'NIDA') {
        if (!nidaData) throw new Error("Please verify your NIDA number before registering.");
        userData = { ...userData, ...nidaData, verificationStatus: 'approved_nida' };
      } 
      else {
        // For both MANUAL and PARENT, we need to upload a document
        if (!supportingDocument) throw new Error("A supporting document is required for manual registration.");
        
        const storageRef = ref(storage, `supporting_documents/${user.uid}/${supportingDocument.name}`);
        await uploadBytes(storageRef, supportingDocument);
        const downloadURL = await getDownloadURL(storageRef);

        if (registrationMode === 'MANUAL') {
            userData = {
                ...userData,
                verificationStatus: 'pending_review',
                manualData: { fullName: manualFullName, dob: manualDob },
                supportingDocumentUrl: downloadURL,
            };
        } else if (registrationMode === 'PARENT') {
            if (!parentNidaData) throw new Error("Parent/Guardian NIDA must be verified.");
            if (!consentChecked) throw new Error("Parent/Guardian must provide consent.");
            
            userData = {
                ...userData,
                verificationStatus: 'pending_review',
                manualData: { fullName: manualFullName, dob: manualDob },
                supportingDocumentUrl: downloadURL,
                onBehalfOfData: {
                    parentName: parentNidaData.fullName,
                    parentNin: parentNin,
                    consentGiven: true,
                },
            };
        }
      }

      // Step 3: Save the prepared user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      
      setMessage("Registration successful! An administrator will review your application if required.");
      // Redirect after a short delay to allow the user to read the message
      setTimeout(() => navigate("/login"), 3000);

    } catch (err) {
      setError("Registration failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX to render the UI ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register Account</h2>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6 rounded-lg bg-gray-200 p-1">
            <button onClick={() => setRegistrationMode('NIDA')} className={`p-2 rounded-md font-semibold text-sm ${registrationMode === 'NIDA' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}>With NIDA</button>
            <button onClick={() => setRegistrationMode('MANUAL')} className={`p-2 rounded-md font-semibold text-sm ${registrationMode === 'MANUAL' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}>Manual Entry</button>
            <button onClick={() => setRegistrationMode('PARENT')} className={`p-2 rounded-md font-semibold text-sm ${registrationMode === 'PARENT' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}>Parent/Guardian</button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
            
            {/* NIDA Flow */}
            {registrationMode === 'NIDA' && (
                 <div>
                    <label htmlFor="nin" className="block text-gray-700 text-sm font-medium">Your NIDA Number (NIN)</label>
                    <div className="flex gap-2 mt-1">
                        <input type="text" id="nin" placeholder="Enter your 20-digit NIN" onChange={(e) => setNin(e.target.value)} disabled={!!nidaData} className="w-full px-4 py-2 border rounded-lg"/>
                        <button type="button" onClick={() => handleNidaVerify(nin, 'user')} disabled={isLoading || !!nidaData} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400">Verify</button>
                    </div>
                </div>
            )}

            {/* Manual Entry Flow */}
            {registrationMode === 'MANUAL' && (
                <div className="space-y-4 p-4 border rounded-lg">
                    <input type="text" placeholder="Your Full Name" onChange={(e) => setManualFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                    <input type="date" placeholder="Your Date of Birth" onChange={(e) => setManualDob(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Supporting Document (Birth Cert.)</label>
                        <input type="file" onChange={handleFileChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                </div>
            )}
            
            {/* Parent/Guardian Flow */}
            {registrationMode === 'PARENT' && (
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <h3 className="font-bold text-center">Applicant's Details</h3>
                        <input type="text" placeholder="Applicant's Full Name" onChange={(e) => setManualFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                        <input type="date" placeholder="Applicant's Date of Birth" onChange={(e) => setManualDob(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upload Applicant's Document (Birth Cert.)</label>
                            <input type="file" onChange={handleFileChange} required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg space-y-4">
                        <h3 className="font-bold text-center">Parent/Guardian's Verification</h3>
                        <div className="flex gap-2">
                             <input type="text" placeholder="Parent/Guardian NIDA Number" onChange={(e) => setParentNin(e.target.value)} disabled={!!parentNidaData} className="w-full px-4 py-2 border rounded-lg"/>
                             <button type="button" onClick={() => handleNidaVerify(parentNin, 'parent')} disabled={isLoading || !!parentNidaData} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400">Verify</button>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="consent" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} required className="h-4 w-4 rounded"/>
                            <label htmlFor="consent" className="ml-2 block text-sm text-gray-900">I declare I am the legal parent/guardian and provide consent.</label>
                        </div>
                    </div>
                </div>
            )}

            <hr/>

            {/* Common Fields */}
            <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
            <input type="password" placeholder="Create a password" onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
            
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md disabled:bg-gray-400">
              {isLoading ? 'Processing...' : 'Register'}
            </button>
        </form>

        {/* Messages and Errors */}
        {message && <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>}
        {error && <p className="mt-4 text-center text-red-600 font-semibold">{error}</p>}
      </div>
    </div>
  );
}