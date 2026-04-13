import React, { useState, useEffect } from "react";

const DevCredits = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const devImage =
    "https://res.cloudinary.com/dn4trwbmw/image/upload/v1771316215/personal/pfhhdmvt8zjqv13woew4.jpg";

    useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
  };

  // Don't render if not visible or not mobile
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 ">
      <div className="relative ">
        <a
          href="https://chanakya-das-sahu.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3
            bg-white backdrop-blur-md
            shadow-xl border border-gray-200
            px-4 py-2 rounded-full
            transition-all duration-300
            hover:scale-105 hover:shadow-2xl
            block
          "
        >
          <img
            src={devImage}
            alt="Chanakya Das Sahu"
            className="w-8 h-8 rounded-full object-cover"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">
              Developed by
            </span>

            <span className="text-sm font-bold text-gray-800">
              Chanakya Das Sahu
            </span>
          </div>
        </a>

        {/* Close button - positioned relative to the dialog */}
      {isMobile && <button
          onClick={handleClose}
          className="
            absolute top-0 right-0
            w-6 h-6
          
            text-black
            rounded-full
            flex items-center justify-center
            
            transition-all duration-200
            hover:bg-gray-200 hover:scale-110
            focus:outline-none
            z-10
            
          "
        >
         ✕
        </button>}
      </div>
    </div>
  );
};

export default DevCredits;