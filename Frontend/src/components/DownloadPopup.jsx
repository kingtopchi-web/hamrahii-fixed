import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, ChevronRight } from 'lucide-react';

const DownloadPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i;
      return mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768;
    };

    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if popup has been shown before and handle popup visibility
  useEffect(() => {
    if (!isMobile) return;

    const hasSeenPopup = localStorage.getItem('downloadPopupSeen');
    const hasInteracted = localStorage.getItem('downloadPopupInteracted');
    const hasDownloaded = localStorage.getItem('appDownloaded');
    
    // If app already downloaded, don't show anything
    if (hasDownloaded === 'true') {
      setIsVisible(false);
      setShowButton(false);
      return;
    }
    
    if (!hasSeenPopup && !hasInteracted) {
      // Show popup after 1 second
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (!hasInteracted) {
      setShowButton(true);
    }
  }, [isMobile]);

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = "/Humrahii.apk";
    link.download = 'Humrahii.apk'; // This will trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mark app as downloaded
    localStorage.setItem('appDownloaded', 'true');
    localStorage.setItem('downloadPopupInteracted', 'true');
    localStorage.setItem('downloadPopupSeen', 'true');
    
    setIsVisible(false);
    setShowButton(false);
  };

  const handleClose = () => {
    localStorage.setItem('downloadPopupSeen', 'true');
    setIsVisible(false);
    setShowButton(true);
  };

  const handleButtonClick = () => {
    setIsVisible(true);
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Popup Modal */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />
            
            {/* Popup Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-[#E10600] to-[#E10600]/80 p-6 text-white text-center">
                  <motion.div
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm"
                  >
                    <Smartphone className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    Get the App!
                  </h3>
                  <p className="text-sm text-white/90">
                    Better experience on mobile
                  </p>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3" style={{ color: '#555555' }}>
                      <div className="w-5 h-5 rounded-full bg-[#E10600]/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E10600' }}></div>
                      </div>
                      <span className="text-sm">Faster loading & smooth experience</span>
                    </div>
                    <div className="flex items-center gap-3" style={{ color: '#555555' }}>
                      <div className="w-5 h-5 rounded-full bg-[#E10600]/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E10600' }}></div>
                      </div>
                      <span className="text-sm">Exclusive app-only features</span>
                    </div>
                    <div className="flex items-center gap-3" style={{ color: '#555555' }}>
                      <div className="w-5 h-5 rounded-full bg-[#E10600]/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E10600' }}></div>
                      </div>
                      <span className="text-sm">Instant ride notifications</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="w-full text-white font-semibold py-3 rounded-xl mb-3 flex items-center justify-center gap-2 shadow-lg"
                    style={{ backgroundColor: '#E10600' }}
                  >
                    <Download className="w-5 h-5" />
                    Download App Now
                  </motion.button>
                  
                  <button
                    onClick={handleClose}
                    className="w-full text-sm py-2 transition-colors"
                    style={{ color: '#555555' }}
                    onMouseEnter={(e) => e.target.style.color = '#111111'}
                    onMouseLeave={(e) => e.target.style.color = '#555555'}
                  >
                    Maybe later
                  </button>
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Fixed Bottom Right Button - Slightly Upper */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(225, 6, 0, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleButtonClick}
            className="fixed bottom-20 right-6 z-40 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 group"
            style={{ backgroundColor: '#E10600' }}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium text-sm">Get App</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            
            {/* Pulsing animation */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: '#E10600' }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default DownloadPopup;