import React from 'react';

export default function Spinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
    </div>
  );
}