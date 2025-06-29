import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // <-- 1. Import toast
// ... other imports

export default function VerificationQueue() {
  // ... state variables ...

  const handleApprove = async () => {
    if (!selectedUser) return;
    
    // 2. Use toast for success and error messages
    const promise = updateUserVerificationStatus(selectedUser.id, 'approved');

    toast.promise(promise, {
       loading: 'Approving...',
       success: <b>Application Approved!</b>,
       error: <b>Could not approve.</b>,
     });
    
    promise
        .then(() => {
            handleCloseModal();
            // The real-time listener will update the UI, no need to manually filter
        })
        .catch(err => {
            setError(err.message); // You can still set local error state if needed
        });
  };

  // ... rest of the component ...
}

{
  pendingRequests.length === 0 ? (
    <p className="text-gray-500">No pending applications found.</p>
  ) : (
    // Your table with the data goes here
  )
}

{
  isLoading ? (
    <Spinner />
  ) : error ? (
    <p className="text-red-500">Error: {error}</p>
  ) : items.length === 0 ? (
    <p className="text-gray-500">No items to display.</p>
  ) : (
    // Component to render your list of items
  )
}