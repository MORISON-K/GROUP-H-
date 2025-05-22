import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "./constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, allowedRoles }) {  // Added allowedRoles prop
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/token/refresh/", {
                refresh: refreshToken,
            });
            
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;  // Return success status
            }
            return false;
        } catch (error) {
            console.error("Refresh token failed:", error);
            return false;
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        // 1. No token case
        if (!token) {
            throw new Error("No token found");
        }

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        // 2. Handle expired token
        if (decoded.exp < now) {
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
                throw new Error("Token refresh failed");
            }
        }

        // 3. Verify token with backend
        try {
            const userResponse = await api.get("/auth/user/");
            
            // 4. Check role authorization if specified
            if (allowedRoles && !allowedRoles.includes(userResponse.data.role)) {
                throw new Error("Unauthorized role");
            }
            
            setIsAuthorized(true);
        } catch (error) {
            console.error("Authentication failed:", error);
            throw error;
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;