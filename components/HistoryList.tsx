import React from 'react';
import { Classification } from '../types';
import HistoryItem from './HistoryItem';

interface HistoryListProps {
  history: Classification[];
  onDeleteItem: (id: string) => void;
  onViewItem: (item: Classification) => void;
  onClearHistory: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onDeleteItem, onViewItem, onClearHistory }) => {
  if (history.length === 0) {
    // This message is now handled in App.tsx for better contextual display
    return null; 
  }

  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Classification History</h3>
        {history.length > 0 && (
            <button 
                onClick={onClearHistory}
                className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                title="Clear all history"
            >
                <i className="fas fa-trash-alt mr-1.5"></i> Clear All History
            </button>
        )}
      </div>
      <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar -mr-2">
        {/* history is already newest first if prepended in App.tsx, otherwise use .slice().reverse() */}
        {history.map((item) => ( 
          <HistoryItem key={item.id} item={item} onDelete={onDeleteItem} onView={onViewItem} />
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
