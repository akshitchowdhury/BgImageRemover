import React, { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

const BulkImageRemover = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      src: URL.createObjectURL(file),
      processedSrc: null,
      progress: 0,
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
  };

  const handleBackgroundRemoval = async () => {
    setIsProcessing(true);

    for (let i = 0; i < images.length; i++) {
      if (!images[i].processedSrc) {
        const response = await fetch(images[i].src);
        const blob = await response.blob();

        const config = {
          progress: (key, current, total) => {
            setImages(prevImages => prevImages.map((img, index) => 
              index === i ? { ...img, progress: (current / total) * 100 } : img
            ));
          },
        };

        const resultBlob = await removeBackground(blob, config);
        const resultUrl = URL.createObjectURL(resultBlob);
        
        setImages(prevImages => prevImages.map((img, index) => 
          index === i ? { ...img, processedSrc: resultUrl, progress: 100 } : img
        ));
      }
    }

    setIsProcessing(false);
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Bulk Image Background Remover
        </h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <label className="w-full sm:w-auto flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Select Images</span>
              <input type="file" className="sr-only" onChange={handleImageUpload} multiple />
            </label>
            <button
              onClick={handleBackgroundRemoval}
              disabled={isProcessing || images.length === 0}
              className={`w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isProcessing || images.length === 0
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Remove Backgrounds'}
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="space-y-8">
            {images.map((image, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Image {index + 1}</h2>
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="w-full md:w-1/2">
                      <div className="aspect-w-4 aspect-h-3 mb-4">
                        <img src={image.src} alt={`Original ${index + 1}`} className="object-cover rounded-md" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${image.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      {image.processedSrc ? (
                        <>
                          <div className="aspect-w-4 aspect-h-3 mb-4">
                            <img src={image.processedSrc} alt={`Processed ${index + 1}`} className="object-cover rounded-md" />
                          </div>
                          <button
                            onClick={() => handleDownload(image.processedSrc, `background-removed-${index + 1}.png`)}
                            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Download Processed Image
                          </button>
                        </>
                      ) : (
                        <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-md flex items-center justify-center">
                          <p className="text-gray-500">Processing...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImageRemover;