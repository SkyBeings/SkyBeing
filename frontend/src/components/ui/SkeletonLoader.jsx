import React from 'react';

const SkeletonLoader = ({ text = "Loading...", className = "", type = "default" }) => {
    // Determine the skeleton structure based on the type (if we want to add more later)
    return (
        <div className={`w-full py-16 px-4 flex flex-col items-center justify-center ${className}`}>
            <div className="w-full max-w-6xl mx-auto space-y-8">
                
                {/* Simulated Header/Title Area */}
                <div className="flex flex-col items-center justify-center space-y-4 mb-12">
                     <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                     <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Simulated Content Grid (e.g., Cards, Gallery, or Blog items) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col border border-gray-100 rounded-lg p-4 shadow-sm space-y-4">
                            {/* Image Placeholder */}
                            <div className="w-full h-48 bg-gray-200 rounded-md animate-pulse"></div>
                            
                            {/* Text Placeholders */}
                            <div className="space-y-3">
                                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            
                            {/* Button Placeholder */}
                            <div className="mt-auto pt-4">
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Text identifier that was passed in */}
                {text && (
                    <div className="mt-12 flex flex-col items-center justify-center">
                        <p className="text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase transition-all">
                            {text}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkeletonLoader;
