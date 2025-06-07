import React from 'react';
import { Classification, WasteCategory } from '../types';
import { getWasteCategoryStyle } from '../constants';

interface ClassificationResultProps {
  result: Classification;
  onSave: () => void;
  isSaved: boolean;
}

const ClassificationResult: React.FC<ClassificationResultProps> = ({ result, onSave, isSaved }) => {
  const { imageUrl, category, confidence, reasoning, suggestions, timestamp, userLocation } = result;
  const style = getWasteCategoryStyle(category);

  return (
    <div className={`mt-6 p-4 sm:p-6 rounded-xl shadow-xl border-t-4 ${style.border} ${style.bg.replace('-100','-50')}`}>
      <h3 className={`text-xl sm:text-2xl font-bold mb-4 text-center ${style.text}`}>
        <i className={`${style.icon} mr-2`}></i>
        Classification Result
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="flex flex-col items-center">
          <img src={imageUrl} alt="Classified waste" className="max-h-60 w-auto rounded-lg shadow-lg border-2 border-white mb-3" />
          <div className={`px-4 py-1.5 rounded-full text-md font-semibold ${style.bg.replace('-100', '-500')} ${style.bg.includes('yellow') || style.bg.includes('lime') ? 'text-black': 'text-white'} shadow-md`}>
            Identified as: {category}
          </div>
          {typeof confidence === 'number' && (
            <p className={`text-sm mt-2 font-medium ${style.text}`}>Confidence: {(confidence * 100).toFixed(1)}%</p>
          )}
        </div>

        <div className="space-y-3">
          {reasoning && (
            <div className={`p-3 bg-white/80 rounded-lg shadow-sm border ${style.border.replace('500', '300')}`}>
              <p className={`text-sm font-semibold ${style.text} mb-1`}>AI Reasoning:</p>
              <p className={`text-xs ${style.text} italic`}>{reasoning}</p>
            </div>
          )}

          <div>
            <h4 className={`text-md font-semibold mb-1.5 ${style.text}`}>Disposal & Recycling Suggestions:</h4>
            <ul className={`list-disc list-inside space-y-1 text-sm ${style.text} max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-white/70 p-3 rounded-lg border ${style.border.replace('500','200')}`}>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onSave}
          disabled={isSaved}
          className={`w-full sm:w-auto font-semibold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isSaved 
              ? `bg-gray-400 text-gray-100 cursor-not-allowed` 
              : `${style.bg.replace('-100', '-600')} hover:${style.bg.replace('-100', '-700')} ${style.bg.includes('yellow') || style.bg.includes('lime') ? 'text-black hover:text-black': 'text-white'} focus:ring-${style.border.split('-')[1]}-500`
            }`}
        >
          <i className={`fas ${isSaved ? 'fa-check-circle' : 'fa-save'} mr-2`}></i>
          {isSaved ? 'Saved to History' : 'Save Result'}
        </button>
        <p className={`text-xs ${style.text.replace('700','500')} mt-2`}>Classified on: {new Date(timestamp).toLocaleString()}</p>
        {userLocation && (
            <p className={`text-xs ${style.text.replace('700','500')} mt-1`}>
                (Location context: Lat {userLocation.lat.toFixed(2)}, Lon {userLocation.lon.toFixed(2)})
            </p>
        )}
      </div>
    </div>
  );
};

export default ClassificationResult;
