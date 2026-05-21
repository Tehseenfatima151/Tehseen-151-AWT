import { useState, useEffect } from "react";

/**
 * A robust image component with:
 * 1. Skeleton loader while loading
 * 2. Fallback to a professional placeholder on error
 * 3. Smooth fade-in transition
 */
const SafeImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholder = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&h=300&fit=crop", // Safe generic food fallback
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, loaded, error

  useEffect(() => {
    if (!src) {
      setImgSrc(placeholder);
      setStatus("loaded");
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setStatus("loaded");
    };
    
    img.onerror = () => {
      setImgSrc(placeholder);
      setStatus("error");
    };
  }, [src, placeholder]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Shimmer */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <i className="fa-solid fa-utensils text-gray-300 text-2xl" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={imgSrc || ""}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
          status === "loaded" || status === "error" ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
      
      {/* Subtle overlay for error state if desired */}
      {status === "error" && (
        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
          Foodify Preview
        </div>
      )}
    </div>
  );
};

export default SafeImage;
