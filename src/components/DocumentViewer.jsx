import React from 'react';
import { generateResidenceLetterPDF } from '../services/firebaseService';

export default function DocumentViewer() {
  // This user data would typically come from your component's state or props
  const approvedUserData = {
    name: 'Asha Juma',
    idNumber: '19900101-12345-12345-01',
    address: 'Mtaa wa Amani, Wazo Hill, Dar es Salaam'
  };

  const handleDownload = () => {
    generateResidenceLetterPDF(approvedUserData);
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Residence Letter is Ready</h2>
      <div className="mb-6 p-4 border rounded-md">
        <p><strong>Name:</strong> {approvedUserData.name}</p>
        <p><strong>Address:</strong> {approvedUserData.address}</p>
      </div>
      <button 
        onClick={handleDownload}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md"
      >
        Download as PDF
      </button>
    </div>
  );
}