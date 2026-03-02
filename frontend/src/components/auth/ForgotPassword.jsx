import React, { useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../ui/Toast';
import { KeyRound, Mail, Lock, ArrowRight, X } from 'lucide-react';

const ForgotPassword = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [recoveryKey, setRecoveryKey] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/users/reset-password', {
                email,
                recoveryKey,
                newPassword
            });
            if (response.data.success) {
                toast.success('Password updated successfully');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <KeyRound className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
                    <p className="text-gray-500 text-center text-sm mb-8">
                        Enter your email and one of the two recovery phone numbers as a "key" to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <KeyRound className="h-4 w-4" /> Recovery Key (Phone Number)
                            </label>
                            <input
                                type="text"
                                required
                                value={recoveryKey}
                                onChange={(e) => setRecoveryKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter recovery phone number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock className="h-4 w-4" /> New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#DB4444] text-white py-4 rounded-xl font-bold hover:bg-[#DB4444]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Reset Password <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
