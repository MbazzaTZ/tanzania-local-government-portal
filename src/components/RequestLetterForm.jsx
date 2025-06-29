import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming you have this from previous steps
import { submitResidenceLetterRequest } from '../services/firebaseService'; // We will create this function next

export default function RequestLetterForm() {
  const { currentUser } = useAuth();
  
  // State to manage the selected ID method and form inputs
  const [idMethod, setIdMethod] = useState('NIDA'); // Default to NIDA
  const [formData, setFormData] = useState({});
  const [documentFile, setDocumentFile] = useState(null);
  
  // UI feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (idMethod !== 'NIDA' && !documentFile) {
      setError('A supporting document is required for this identification method.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // The service function will handle file upload and data submission
      await submitResidenceLetterRequest(currentUser.uid, idMethod, formData, documentFile);
      setMessage('Your application has been submitted successfully. An officer will review it shortly.');
      // Optionally reset form state here
      e.target.reset();
      setDocumentFile(null);
      
    } catch (err) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (idMethod) {
      case 'NIDA':
        return (
          <input type="text" name="nin" placeholder="Enter your 20-digit NIDA NIN" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
        );
      case 'NEC':
        return (
          <>
            <input type="text" name="necNumber" placeholder="Enter your NEC Number" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <FileUploadInput onChange={handleFileChange} label="Upload NEC Card Scan" />
          </>
        );
      case 'PASSPORT':
        return (
          <>
            <input type="text" name="passportNumber" placeholder="Enter your Passport Number" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <input type="text" name="countryOfIssue" placeholder="Country of Issue" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <FileUploadInput onChange={handleFileChange} label="Upload Passport Bio-Page Scan" />
          </>
        );
      case 'BIRTH_CERTIFICATE':
        return (
          <>
            <input type="text" name="birthCertNumber" placeholder="Enter your Birth Certificate Number" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <FileUploadInput onChange={handleFileChange} label="Upload Birth Certificate Scan" />
          </>
        );
      case 'STUDENT':
        return (
          <>
            <select name="studentLevel" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg">
              <option value="">-- Select Level --</option>
              <option value="STANDARD_7">Standard 7</option>
              <option value="FORM_4">Form 4</option>
              <option value="FORM_6">Form 6</option>
            </select>
            <input type="text" name="schoolName" placeholder="School Name" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <input type="text" name="examNumber" placeholder="Exam / Registration Number" onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg"/>
            <FileUploadInput onChange={handleFileChange} label="Upload Student ID / Certificate Scan" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ombi la Barua ya Utambulisho wa Makazi</h2>
      <p className="text-gray-600 mb-6">Jaza fomu hii ili kupata barua ya utambulisho wa makazi.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="idMethod" className="block text-sm font-medium text-gray-700 mb-1">Chagua Aina ya Utambulisho (Select ID Type)</label>
          <select id="idMethod" value={idMethod} onChange={(e) => setIdMethod(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-gray-50">
            <option value="NIDA">NIDA (National ID)</option>
            <option value="NEC">NEC (Voter's ID)</option>
            <option value="PASSPORT">Passport</option>
            <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
            <option value="STUDENT">Student ID</option>
          </select>
        </div>

        {renderFormFields()}

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md disabled:bg-gray-400">
          {isLoading ? 'Inatuma...' : 'Tuma Ombi (Submit Application)'}
        </button>

        {message && <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>}
        {error && <p className="mt-4 text-center text-red-600 font-semibold">{error}</p>}
      </form>
    </div>
  );
}

// A helper component for consistent file input styling
const FileUploadInput = ({ onChange, label }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            type="file" 
            onChange={onChange} 
            required 
            className="w-full text-sm text-gray-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
    </div>
);