import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-6 mt-auto">
      <p>&copy; {new Date().getFullYear()} EcoSnap. AI for a greener planet.</p>
      <p className="text-xs text-gray-400 mt-1">
        Recycling information is illustrative. Always check with local authorities.
      </p>
    </footer>
  );
};

export default Footer;
