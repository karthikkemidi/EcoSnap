
import React, { useState, useEffect, useCallback } from 'react';
// import { GoogleGenAI } from "@google/genai"; // In geminiService

import Header from './components/Header';
import Footer from './components/Footer';
import ImageInput from './components/ImageInput';
import ClassificationResult from './components/ClassificationResult';
import HistoryList from './components/HistoryList';
import LoadingSpinner from './components/LoadingSpinner';
import { Classification, WasteCategory, UserLocation } from './types';
import { classifyWaste } from './services/geminiService';
import { getDisposalSuggestions } from './services/recyclingDataService';
import { getCurrentPosition } from './services/geolocationService';
import { loadHistory, saveHistory } from './services/localStorageService';
import { APP_TITLE, getWasteCategoryStyle } from './constants';
import { generateThumbnail } from './utils/imageUtils'; // Import the new utility

// Helper to generate a simple unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [classificationResult, setClassificationResult] = useState<Classification | null>(null);
  const [history, setHistory] = useState<Classification[]>([]);
  const [isResultSaved, setIsResultSaved] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [showHistoryDetailModal, setShowHistoryDetailModal] = useState<boolean>(false);
  const [itemForDetailModal, setItemForDetailModal] = useState<Classification | null>(null);

  useEffect(() => {
    document.title = `${APP_TITLE} - AI Waste Sorter`; // Set document title
    setHistory(loadHistory());

    getCurrentPosition()
      .then(location => {
        setUserLocation(location);
        setAppError(null); 
      })
      .catch(error => {
        console.warn("Geolocation error:", error.message);
      })
      .finally(() => {
        setIsLoadingLocation(false);
      });
  }, []);

  const handleImageSelected = useCallback((imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setClassificationResult(null);
    setIsResultSaved(false);
    setAppError(null);
  }, []);

  const handleClassify = async () => {
    if (!selectedImage) {
      setAppError("Please select an image first.");
      return;
    }

    setIsProcessing(true);
    setAppError(null);
    setClassificationResult(null); 

    try {
      const geminiResponse = await classifyWaste(selectedImage);

      if (geminiResponse.wasteType === WasteCategory.UNKNOWN && geminiResponse.reasoning?.includes("API Key")) {
         setAppError(`Classification failed: ${geminiResponse.reasoning}. Please ensure the API key is correctly configured.`);
         setIsProcessing(false);
         return;
      }
      
      const disposalSuggestions = await getDisposalSuggestions(geminiResponse.wasteType, userLocation);

      const newClassification: Classification = {
        id: generateId(),
        imageUrl: selectedImage, // Full resolution image for current display
        category: geminiResponse.wasteType,
        confidence: geminiResponse.confidence,
        reasoning: geminiResponse.reasoning,
        suggestions: disposalSuggestions,
        timestamp: Date.now(),
        userLocation: userLocation || undefined,
      };
      setClassificationResult(newClassification);
      setIsResultSaved(false);

    } catch (error: any) {
      console.error("Error during classification process:", error);
      setAppError(`Classification failed: ${error.message || "An unexpected error occurred."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveResult = useCallback(async () => {
    if (!classificationResult || isResultSaved) return;

    let historyEntryData = { ...classificationResult };

    if (classificationResult.imageUrl) {
      try {
        // Generate a thumbnail for storage
        const thumbnailUrl = await generateThumbnail(classificationResult.imageUrl); 
        historyEntryData.imageUrl = thumbnailUrl; // Replace imageUrl with thumbnail for history
      } catch (error) {
        console.error("Failed to generate thumbnail for history item:", error);
        // Fallback: store with a placeholder or original if thumbnailing fails critically
        // generateThumbnail is designed to return a placeholder on failure, so this catch might be for other errors.
        // For safety, if it somehow still fails, use a known placeholder.
        historyEntryData.imageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      }
    }
    
    // Prepend new entry and filter out any potential duplicate by ID (if any existed from a weird state)
    const updatedHistory = [historyEntryData, ...history.filter(item => item.id !== historyEntryData.id)];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setIsResultSaved(true);
  }, [classificationResult, history, isResultSaved]);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    if (itemForDetailModal?.id === id) {
        setShowHistoryDetailModal(false);
        setItemForDetailModal(null);
    }
  }, [history, itemForDetailModal]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all classification history? This action cannot be undone.")) {
        setHistory([]);
        saveHistory([]);
        setShowHistoryDetailModal(false);
        setItemForDetailModal(null);
    }
  }, []);

  const handleViewHistoryItem = useCallback((item: Classification) => {
    setItemForDetailModal(item);
    setShowHistoryDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowHistoryDetailModal(false);
    setItemForDetailModal(null);
  }, []);

  const renderHistoryDetailModal = () => {
    if (!showHistoryDetailModal || !itemForDetailModal) return null;
    
    const style = getWasteCategoryStyle(itemForDetailModal.category);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
        onClick={handleCloseDetailModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
      >
        <div 
          className={`bg-white rounded-xl shadow-2xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all ${style.bg.replace('100','50')} border-t-4 ${style.border}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 id="history-detail-title" className={`text-xl sm:text-2xl font-bold ${style.text}`}>
                <i className={`${style.icon} mr-2`}></i>
                Classification Detail
            </h3>
            <button 
              onClick={handleCloseDetailModal} 
              className={`text-2xl ${style.text.replace('700','500')} hover:${style.text} transition-colors`}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
            <div className="flex flex-col items-center">
              {/* Image displayed here will be the thumbnail for history items */}
              <img src={itemForDetailModal.imageUrl} alt="Classified waste" className="max-h-60 w-auto rounded-lg shadow-lg border border-gray-300 mb-3" />
              <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${style.bg.replace('-100', '-500')} ${style.bg.includes('yellow') || style.bg.includes('lime') ? 'text-black': 'text-white'} shadow-md`}>
                Category: {itemForDetailModal.category}
              </div>
              {typeof itemForDetailModal.confidence === 'number' && (
                <p className={`text-xs mt-1.5 ${style.text}`}>Confidence: {(itemForDetailModal.confidence * 100).toFixed(1)}%</p>
              )}
            </div>
            <div className="text-sm">
              {itemForDetailModal.reasoning && (
                <div className={`mb-3 p-3 ${style.bg} rounded-md shadow-sm`}>
                  <p className={`font-semibold ${style.text}`}>AI Reasoning:</p>
                  <p className={`italic ${style.text}`}>{itemForDetailModal.reasoning}</p>
                </div>
              )}
              <p className={`text-xs ${style.text.replace('700', '500')} mb-2`}>
                Saved on: {new Date(itemForDetailModal.timestamp).toLocaleString()}
              </p>
              {itemForDetailModal.userLocation && (
                 <p className={`text-xs ${style.text.replace('700','500')} mb-3`}>
                    Location: Lat {itemForDetailModal.userLocation.lat.toFixed(3)}, Lon {itemForDetailModal.userLocation.lon.toFixed(3)} (approx.)
                 </p>
              )}
            </div>
          </div>

          <div>
            <h4 className={`text-md font-semibold mb-2 ${style.text}`}>Disposal & Recycling Suggestions:</h4>
            <ul className={`list-disc list-inside space-y-1.5 text-sm ${style.text} max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-white/60 p-3 rounded-md border ${style.border.replace('500','200')}`}>
              {itemForDetailModal.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
          
          <button 
              onClick={handleCloseDetailModal} 
              className={`mt-6 w-full sm:w-auto font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out
              ${style.bg.replace('-100', '-600')} hover:${style.bg.replace('-100', '-700')} ${style.bg.includes('yellow') || style.bg.includes('lime') ? 'text-black hover:text-black': 'text-white'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${style.border.split('-[')[1]?.split(']')[0] || 'primary-500'}`}
            >
             Close
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-indigo-100 font-sans">
      <Header />
      <main className="container mx-auto p-3 sm:p-5 flex-grow w-full max-w-4xl pt-20 sm:pt-24">
        <div className="bg-white/90 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-xl">
            {isLoadingLocation && (
              <div className="flex items-center justify-center text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded-md">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Checking for location services...</span>
              </div>
            )}
            
            {appError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 rounded-md shadow" role="alert">
                <div className="flex">
                    <div className="py-1"><i className="fas fa-exclamation-triangle mr-2 text-red-500"></i></div>
                    <div>
                        <p className="font-bold">Error</p>
                        <p className="text-sm">{appError}</p>
                    </div>
                </div>
              </div>
            )}

            <ImageInput 
              onImageSelected={handleImageSelected} 
              isProcessing={isProcessing}
            />
            
            <div className="mt-5 text-center">
              <button
                onClick={handleClassify}
                disabled={!selectedImage || isProcessing}
                className="bg-secondary-DEFAULT hover:bg-secondary-dark text-black font-semibold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-secondary-dark focus:ring-offset-2 flex items-center justify-center mx-auto w-full sm:w-auto"
                aria-live="polite"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cogs mr-2"></i> Classify Waste
                  </>
                )}
              </button>
            </div>
            
            {isProcessing && !classificationResult && <LoadingSpinner message="Analyzing your waste..." size="lg"/>}

            {classificationResult && (
              <ClassificationResult 
                result={classificationResult} 
                onSave={handleSaveResult} 
                isSaved={isResultSaved} 
              />
            )}
        </div>

        {history.length > 0 && (
            <div className="mt-8 bg-white/90 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-xl">
                <HistoryList 
                history={history} 
                onDeleteItem={handleDeleteHistoryItem} 
                onViewItem={handleViewHistoryItem}
                onClearHistory={handleClearHistory}
                />
            </div>
        )}
         {history.length === 0 && !classificationResult && !selectedImage && !isProcessing && (
            <div className="mt-10 text-center text-gray-500 py-8">
                <i className="fas fa-recycle text-5xl sm:text-6xl mb-4 text-primary-light opacity-80"></i>
                <p className="text-lg sm:text-xl font-semibold">Welcome to {APP_TITLE}!</p>
                <p className="text-sm sm:text-base">Upload or snap a photo of waste to get started.</p>
            </div>
        )}

      </main>
      <Footer />
      {renderHistoryDetailModal()}
    </div>
  );
};

export default App;
