import React from "react";

const DevCredits = () => {
  const devImage =
    "https://res.cloudinary.com/dn4trwbmw/image/upload/v1771316215/personal/pfhhdmvt8zjqv13woew4.jpg";

  return (
    <div className="fixed bottom-6 right-6 z-[999999]">
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
    </div>
  );
};

export default DevCredits;