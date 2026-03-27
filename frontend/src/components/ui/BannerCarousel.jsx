import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

// ── Module-level request cache ────────────────────────────────────────────────
// Stores in-flight promises and resolved data per page key.
// Prevents duplicate network requests when the same carousel mounts twice
// and lets data be reused across re-renders without a spinner.
const _cache = {};
function fetchBannersFor(page) {
    const key = page || '';
    if (!_cache[key]) {
        _cache[key] = { promise: null, data: null };
    }
    if (_cache[key].data) return Promise.resolve(_cache[key].data);
    if (!_cache[key].promise) {
        _cache[key].promise = api
            .get(`/banners/active${page ? `?page=${page}` : ''}`)
            .then(res => {
                _cache[key].data = res.data?.data || [];
                return _cache[key].data;
            })
            .catch(() => {
                _cache[key].promise = null; // allow retry on error
                return [];
            });
    }
    return _cache[key].promise;
}

/**
 * Reusable banner carousel.
 * Props:
 *   page         – which page to fetch banners for (e.g. "home", "shop")
 *   fallback     – JSX to render when no banners are configured
 */
const BannerCarousel = ({ page, fallback = null }) => {
    const [banners, setBanners] = useState(() => {
        // If data is already cached (e.g. carousel rendered before), use it immediately
        const key = page || '';
        return _cache[key]?.data || [];
    });
    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState(() => !!_cache[page || '']?.data);

    useEffect(() => {
        // fetchBannersFor returns cached promise or creates a new one
        fetchBannersFor(page).then(data => {
            setBanners(data);
            setLoaded(true);
        });
    }, [page]);

    useEffect(() => {
        if (banners.length < 2) return;
        const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 6000);
        return () => clearInterval(t);
    }, [banners]);

    const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
    const next = () => setCurrent(c => (c + 1) % banners.length);

    if (!loaded) {
        // ── CLS fix: aspect-ratio placeholder matches the banner's typical proportions.
        // Using 21:9 on desktop (cinematic wide) and 16:9 on mobile — prevents layout shift
        // when the real image loads and its natural dimensions push the layout.
        return (
            <div
                className="w-full bg-gray-100 animate-pulse"
                style={{ aspectRatio: '21/9' }}
                aria-hidden="true"
            />
        );
    }

    if (banners.length === 0) {
        return fallback;
    }

    return (
        <div className="w-full relative overflow-hidden group bg-white">

            {/* 
               We do NOT use a hardcoded height wrapper.
               The active slide dictates the exact pixel height dynamically via the native image ratio.
            */}
            {banners.map((banner, i) => {
                const hasText = !!(banner.title || banner.subtitle);
                // Only the very first (LCP) image gets eager + high priority.
                // All subsequent carousel slides are offscreen and should be lazy.
                const isLCP = i === 0;

                return (
                    <div key={banner._id}
                        className={`w-full transition-opacity duration-700 ${i === current ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'}`}>

                        {/* 1. The Image */}
                        <img
                            src={banner.imageUrl}
                            alt={banner.title || 'Banner'}
                            className="w-full h-auto min-h-[160px] md:min-h-[300px] xl:max-h-[600px] object-cover object-center bg-gray-50"
                            // ── LCP optimizations ──────────────────────────────────
                            // First image: do NOT lazy-load, tell browser it's high priority
                            // Other images: lazy-load since they're hidden carousel slides
                            loading={isLCP ? 'eager' : 'lazy'}
                            fetchPriority={isLCP ? 'high' : 'low'}
                            // Async decode for non-blocking paint on all images
                            decoding={isLCP ? 'sync' : 'async'}
                        />

                        {/* 2. Absolute Overlay over the natural image */}
                        <div className={`absolute inset-0 flex flex-col justify-end md:justify-center ${hasText ? 'bg-black/30 md:bg-black/0 md:bg-gradient-to-r md:from-black/70 md:via-black/40 md:to-transparent' : ''}`}>
                            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 pb-4 sm:pb-8 md:pb-0 relative z-10 text-center md:text-left">

                                {/* Text Details */}
                                {hasText && (
                                    <div className="w-full md:max-w-xl mb-3 md:mb-5">
                                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 drop-shadow-md">
                                            {banner.title}
                                        </h1>
                                        {banner.subtitle && (
                                            <p className="text-white/95 text-xs sm:text-sm md:text-lg drop-shadow-md">
                                                {banner.subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Floating Button */}
                                {banner.buttonText && (
                                    <div className="w-full">
                                        <Link to={banner.buttonLink || '/shop'}
                                            className={`inline-flex items-center justify-center bg-skyGreen hover:bg-[#0c660b] text-white font-bold px-5 py-2 md:px-8 md:py-3.5 text-[10px] sm:text-sm md:text-base rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 tracking-wider uppercase backdrop-blur-sm ${hasText ? '' : 'ring-2 md:ring-4 ring-white/20'}`}>
                                            {banner.buttonText}
                                        </Link>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Navigation Elements */}
            {banners.length > 1 && (
                <>
                    {/* Desktop Arrows */}
                    <button onClick={prev}
                        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                    <button onClick={next}
                        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-7 h-7" />
                    </button>

                    {/* Modern Dots */}
                    <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)}
                                className={`h-1.5 md:h-2.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 md:w-8 bg-skyGreen' : 'w-1.5 md:w-2.5 bg-white/50 hover:bg-white/80'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerCarousel;
