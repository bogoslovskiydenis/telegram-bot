import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from "./routes/PrivateRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";

const App = () => {
    // Function to check if the user is authenticated
    const isAuthenticated = () => {
        // Check for authToken in localStorage
        return localStorage.getItem('authToken') !== null;
    };

    return (
        <Router>
            <Routes>
                {/* Home page */}
                <Route path="/" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                } />

                {/* Login page */}
                <Route path="/login" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
                } />

                {/* Register page */}
                <Route path="/register" element={<Register />} />

                {/* Protected route for dashboard */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />

                {/* Redirect to home page for all other routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
