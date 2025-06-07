
import React from 'react';
import { APP_TITLE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-DEFAULT text-gray-800 shadow-lg p-4 sticky top-0 z-50 w-full">
      <div className="container mx-auto flex items-center">
        <i className="fas fa-leaf text-2xl sm:text-3xl mr-2 sm:mr-3"></i>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
      </div>
    </header>
  );
};

export default Header;