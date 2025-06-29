import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resolveRequest } from '../../services/firebaseService';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase-config';

export default function EscalatedQueue() {
  const { currentUser } = useAuth();
  const [escalatedRequests, setEscalatedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the resolution modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    const requestsRef = collection(db, "letter_requests");
    const q = query(
      requestsRef, 
      where("status", "==", "escalated"),
      orderBy("escalation.escalatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEscalatedRequests(requests);
      setIsLoading(false);
    }, (err) => {
      setError("Failed to fetch escalated requests.");
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleOpenResolveModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    setResolutionNotes(""); // Reset notes
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleResolve = async (newStatus) => {
    if (!selectedRequest) return;
    if (!resolutionNotes) {
        alert("Please provide resolution notes based on external feedback.");
        return;
    }
    try {
      // In a real app, you would pass the current admin's ID
      await resolveRequest(selectedRequest.id, newStatus, resolutionNotes);
      handleCloseModal(); // The real-time listener will update the UI
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading escalated applications...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Escalated Application Tracker</h2>
      
      {escalatedRequests.length === 0 ? (
        <p className="text-gray-500">No applications are currently escalated.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                <th className="py-3 px-6">Escalated To</th>
                <th className="py-3 px-6">Escalation Date</th>
                <th className="py-3 px-6">Applicant User ID</th>
                <th className="py-3 px-6">Escalated By (Admin)</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {escalatedRequests.map(req => (
                <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {req.escalation.status.replace('pending_', '').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">{new Date(req.escalation.escalatedAt?.toDate()).toLocaleString()}</td>
                  <td className="py-4 px-6 font-mono text-xs">{req.userId}</td>
                  <td className="py-4 px-6 font-mono text-xs">{req.escalation.escalatedBy}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleOpenResolveModal(req)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-xs">
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolution Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Resolve Escalated Application</h3>
            
            <div className="space-y-4 text-sm">
                <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                    <h4 className="font-semibold text-orange-800">Original Escalation Notes</h4>
                    <p className="italic">"{selectedRequest.escalation.notes}"</p>
                </div>
                 <div className="pt-2">
                 <label htmlFor="resolutionNotes" className="font-semibold block mb-1">Resolution Notes</label>
                 <textarea 
                    id="resolutionNotes" 
                    value={resolutionNotes} 
                    onChange={(e) => setResolutionNotes(e.target.value)} 
                    className="w-full p-2 border rounded-md" 
                    rows="3"
                    placeholder="Enter feedback from the external authority (e.g., 'RITA confirmed certificate is valid.')..."
                ></textarea>
               </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 rounded-lg font-semibold">Cancel</button>
              <button onClick={() => handleResolve('rejected')} className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Reject Application</button>
              <button onClick={() => handleResolve('approved')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Approve Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}