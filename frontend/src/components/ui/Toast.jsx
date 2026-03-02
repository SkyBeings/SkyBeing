import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, ShoppingCart } from 'lucide-react';

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    cart: ShoppingCart,
};

const STYLES = {
    success: {
        bar: 'bg-skyGreen',
        icon: 'text-skyGreen',
        badge: 'bg-green-50 border-green-100',
    },
    error: {
        bar: 'bg-red-500',
        icon: 'text-red-500',
        badge: 'bg-red-50 border-red-100',
    },
    warning: {
        bar: 'bg-amber-400',
        icon: 'text-amber-500',
        badge: 'bg-amber-50 border-amber-100',
    },
    info: {
        bar: 'bg-blue-500',
        icon: 'text-blue-500',
        badge: 'bg-blue-50 border-blue-100',
    },
    cart: {
        bar: 'bg-skyGreen',
        icon: 'text-skyGreen',
        badge: 'bg-green-50 border-green-100',
    },
};

// ── Single Toast ──────────────────────────────────────────────────────────────
const ToastItem = ({ toast, onDismiss }) => {
    const style = STYLES[toast.type] || STYLES.info;
    const Icon = ICONS[toast.type] || Info;

    return (
        <div
            className={`relative flex items-start gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3.5 min-w-[300px] max-w-sm overflow-hidden
                        animate-[slideInRight_0.25s_ease-out]`}
            style={{ animation: 'slideInRight 0.25s ease-out' }}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${style.bar}`} />

            {/* Icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${style.badge} border mt-0.5`}>
                <Icon className={`w-4 h-4 ${style.icon}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
                {toast.title && (
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
                )}
                <p className={`text-sm text-gray-500 leading-snug ${toast.title ? 'mt-0.5' : 'font-medium text-gray-800'}`}>
                    {toast.message}
                </p>
                {/* Product image if provided */}
                {toast.image && (
                    <img
                        src={toast.image}
                        alt=""
                        className="mt-2 w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm"
                    />
                )}
            </div>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-0.5 ${style.bar} opacity-30 rounded-b-2xl`}
                style={{
                    animation: `shrink ${toast.duration || 3000}ms linear forwards`,
                    width: '100%',
                }}
            />
        </div>
    );
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
    }, []);

    const show = useCallback((message, { type = 'info', title, image, duration = 3000 } = {}) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev.slice(-4), { id, message, type, title, image, duration }]);
        timersRef.current[id] = setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    // Convenience helpers
    const toast = {
        success: (msg, opts) => show(msg, { type: 'success', ...opts }),
        error: (msg, opts) => show(msg, { type: 'error', ...opts }),
        warning: (msg, opts) => show(msg, { type: 'warning', ...opts }),
        info: (msg, opts) => show(msg, { type: 'info', ...opts }),
        cart: (msg, opts) => show(msg, { type: 'cart', title: 'Added to Cart', duration: 2500, ...opts }),
        show,
        dismiss,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast container — bottom-right on desktop, bottom-center on mobile */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
