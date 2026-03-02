import React from 'react';

const BirdLoader = ({ text = "Loading...", className = "" }) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div className="relative w-24 h-24 flex items-center justify-center">

                {/* Minimalist Aesthetic Bird */}
                <div className="relative animate-float">
                    <svg
                        viewBox="0 0 100 60"
                        className="w-20 h-12 text-skyGreen fill-none stroke-current stroke-[3] stroke-round"
                    >
                        {/* Body/Head segment */}
                        <path d="M45,30 C48,28 52,28 55,30" />

                        {/* Wings with graceful flap - Left */}
                        <path
                            className="animate-wing-l"
                            d="M45,30 C30,15 10,20 5,35"
                        />

                        {/* Wings with graceful flap - Right */}
                        <path
                            className="animate-wing-r"
                            d="M55,30 C70,15 90,20 95,35"
                        />
                    </svg>

                    {/* Subtle Shadow below */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-skyGreen/10 rounded-[100%] blur-[2px] animate-shadow" />
                </div>
            </div>

            {text && (
                <div className="mt-8 flex flex-col items-center">
                    <p className="text-[10px] font-bold text-skyGreen/60 tracking-[0.5em] uppercase">
                        {text}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <span className="w-1 h-1 bg-skyGreen/40 rounded-full animate-pulse-fade" />
                        <span className="w-1 h-1 bg-skyGreen/40 rounded-full animate-pulse-fade [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-skyGreen/40 rounded-full animate-pulse-fade [animation-delay:0.4s]" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BirdLoader;
