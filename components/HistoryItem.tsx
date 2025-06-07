import React from 'react';
import { Classification } from '../types';
import { getWasteCategoryStyle } from '../constants';

interface HistoryItemProps {
  item: Classification;
  onDelete: (id: string) => void;
  onView: (item: Classification) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDelete, onView }) => {
  const { id, imageUrl, category, timestamp } = item;
  const style = getWasteCategoryStyle(category);

  return (
    <div className={`p-3.5 rounded-lg shadow-md flex items-center justify-between transition-all duration-150 hover:shadow-lg ${style.bg.replace('-100','-50')} border ${style.border.replace('500','300')} hover:border-${style.border.split('-')[1]}-400`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <img src={imageUrl} alt="Waste item" className="w-14 h-14 rounded-md object-cover border-2 border-white shadow-sm" />
        <div className="overflow-hidden">
          <p className={`font-semibold text-md truncate ${style.text}`}>
             <i className={`${style.icon} mr-1.5 text-sm`}></i>
            {category}
          </p>
          <p className={`text-xs ${style.text.replace('700','500')}`}>{new Date(timestamp).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex space-x-1.5 sm:space-x-2 flex-shrink-0">
        <button
            onClick={() => onView(item)}
            className={`p-2 rounded-md text-sm ${style.text.replace('700', '600')} hover:${style.text} hover:bg-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-${style.border.split('-')[1]}-400`}
            title="View Details"
            aria-label={`View details for ${category} item from ${new Date(timestamp).toLocaleDateString()}`}
        >
            <i className="fas fa-eye fa-fw"></i>
        </button>
        <button
            onClick={() => onDelete(id)}
            className="p-2 rounded-md text-sm text-red-500 hover:text-red-700 hover:bg-red-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            title="Delete Item"
            aria-label={`Delete ${category} item from ${new Date(timestamp).toLocaleDateString()}`}
        >
            <i className="fas fa-trash-alt fa-fw"></i>
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
