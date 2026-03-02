import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import SecurityPrompt from './SecurityPrompt';

const AdminRoute = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isVerified, setIsVerified] = useState(sessionStorage.getItem('isAdminVerified') === 'true');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />; // Or to an unauthorized page
    }

    if (!isVerified) {
        return <SecurityPrompt onVerified={() => setIsVerified(true)} />;
    }

    return <Outlet />;
};

export default AdminRoute;
