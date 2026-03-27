import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import SecurityPrompt from './SecurityPrompt';

const AdminRoute = () => {
    const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);
    const [isVerified, setIsVerified] = useState(sessionStorage.getItem('isAdminVerified') === 'true');

    // Wait for /users/me to resolve before making auth decisions.
    // This prevents a flash-redirect to /login while auth is still in-flight.
    // Public pages are unaffected — they never check isInitialized.
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-skyGreen border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    if (!isVerified) {
        return <SecurityPrompt onVerified={() => setIsVerified(true)} />;
    }

    return <Outlet />;
};

export default AdminRoute;
