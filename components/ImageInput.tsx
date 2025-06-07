
import React, { useState, useRef, useCallback, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageInputProps {
  onImageSelected: (imageDataUrl: string) => void;
  isProcessing: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, isProcessing }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, WebP).');
      setPreview(null);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-primary-DEFAULT');
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary-DEFAULT');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary-DEFAULT');
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const openCamera = useCallback(async () => {
    setShowCamera(true);
    setIsCameraLoading(true);
    setError(null);
    setPreview(null); // Clear previous preview when opening camera
    onImageSelected(""); // Clear selected image in parent

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Autoplay is handled by playsInline and muted attributes on video element
        // videoRef.current.onloadedmetadata = () => {
        //  if (videoRef.current) videoRef.current.play();
        // };
      }
      setIsCameraLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access camera. Please ensure permissions are granted and try again.";
      if (err instanceof Error && err.name === "NotAllowedError") {
        message = "Camera access denied. Please grant permission in your browser settings.";
      }
      setError(message);
      setShowCamera(false);
      setIsCameraLoading(false);
    }
  }, [onImageSelected]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsCameraLoading(false);
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  const takePicture = () => {
    if (videoRef.current && streamRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG with quality for smaller size
        setPreview(dataUrl);
        onImageSelected(dataUrl);
      }
      closeCamera(); // Close camera after taking picture
    } else {
      setError("Camera not ready or stream unavailable. Please try again.");
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    onImageSelected(""); 
  };
  
  useEffect(() => {
    // Ensure video plays when srcObject is set and component is visible
    if (videoRef.current && videoRef.current.srcObject && !isCameraLoading) {
      videoRef.current.play().catch(playError => {
        console.warn("Video play interrupted or failed:", playError);
        // This can happen if the user navigates away quickly or permissions change
      });
    }
  }, [isCameraLoading, showCamera]); // Re-run if camera visibility or loading state changes


  useEffect(() => {
    return () => { // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  if (showCamera) {
    return (
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-xl text-center relative">
        <button
            onClick={closeCamera}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl z-10"
            aria-label="Close camera"
        >
            &times;
        </button>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Camera Capture</h3>
        {isCameraLoading && <LoadingSpinner message="Starting camera..." />}
        <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-md overflow-hidden border border-gray-300">
            <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${isCameraLoading ? 'hidden' : 'block'}`} 
                playsInline 
                muted 
                autoPlay // Added autoPlay
            />
        </div>

        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        
        {!isCameraLoading && ( // Show snap button only when camera is loaded
            <button
                onClick={takePicture}
                disabled={isProcessing || !streamRef.current} // Disable if processing or stream not ready
                className="mt-4 bg-primary-DEFAULT hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
                <i className="fas fa-camera mr-2"></i> Snap Photo
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-light transition-colors duration-150 relative"
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        aria-label="Upload image: Drag and drop or click to select"
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          disabled={isProcessing}
        />
        {preview ? (
          <img src={preview} alt="Selected image preview" className="max-h-60 w-auto mx-auto rounded-md shadow-sm" />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <i className="fas fa-cloud-upload-alt text-4xl sm:text-5xl mb-2 text-primary-light"></i>
            <p className="font-semibold text-base sm:text-lg">Drag & drop an image here</p>
            <p className="text-sm">or click to select a file</p>
            <p className="text-xs mt-1 text-gray-400">(PNG, JPG, GIF, WebP)</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <button
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full bg-secondary-DEFAULT hover:bg-secondary-dark text-black font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Choose image file"
        >
          <i className="fas fa-file-image mr-2"></i> Choose File
        </button>
        <button
          onClick={openCamera}
          disabled={isProcessing}
          className="w-full bg-secondary-DEFAULT hover:bg-secondary-dark text-black font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Use camera to take photo"
        >
          <i className="fas fa-camera-retro mr-2"></i> Use Camera
        </button>
      </div>
      {preview && (
          <div className="mt-3 text-center">
            <button
                onClick={clearPreview}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Clear selected image"
            >
                <i className="fas fa-times mr-2"></i> Clear Image
            </button>
          </div>
        )}
    </div>
  );
};

export default ImageInput;
