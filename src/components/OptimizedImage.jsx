import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const OptimizedImage = ({ 
    src, 
    alt, 
    className = "", 
    containerClassName = "", 
    priority = false, 
    objectFit = "cover",
    onClick,
    ...props 
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // If no source is provided, treat as error
    if (!src) return (
        <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 ${containerClassName || className}`}>
            <ImageIcon size={24} />
        </div>
    );

    return (
        <div className={`relative overflow-hidden ${containerClassName || className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center z-10">
                    {/* Optional: Add a subtle logo or icon here */}
                </div>
            )}
            
            {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                    <ImageIcon size={24} />
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setIsLoading(false); setHasError(true); }}
                    onClick={onClick}
                    className={`transition-opacity duration-500 ease-in-out block h-full w-full ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
                    style={{ objectFit }}
                    {...props}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
