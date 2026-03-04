import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { useToast } from '../ui/Toast';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const SecurityPrompt = ({ onVerified }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/admin/verify-security', { password });
            if (response.data.success) {
                sessionStorage.setItem('isAdminVerified', 'true');
                toast.success('Security verified');
                onVerified();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid security password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-skyGreen/10 mb-4">
                        <Lock className="h-8 w-8 text-skyGreen" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Security Check</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your password or the master security key to access the panel.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="security-password" name="security-password" className="sr-only">
                                Security Password
                            </label>
                            <input
                                id="security-password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-skyGreen focus:border-skyGreen focus:z-10 sm:text-sm transition-all duration-200"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-skyGreen hover:bg-skyGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyGreen disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Enter Admin Panel
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        This is an additional security layer for SKYBEINGS administrators.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecurityPrompt;
