import { ShieldAlert } from "lucide-react";

export default function MaintenancePage({ message }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 font-sans">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-skyGreen/10 text-skyGreen rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Under Maintenance</h1>
                <p className="text-gray-500 leading-relaxed font-medium">
                    {message || "We're currently upgrading our store to serve you better. We will be back online shortly!"}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-100 w-full text-sm text-gray-400 font-medium">
                    Thank you for your patience!
                </div>
            </div>
        </div>
    );
}
