import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          &copy; {currentYear} Tanzania Local Government Portal. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}