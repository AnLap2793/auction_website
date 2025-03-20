import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page and save the location they tried to access
        return <Navigate to='/signin' state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
