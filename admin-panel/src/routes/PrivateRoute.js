import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, children }) => {
    if (!user) {
        // Если пользователь не аутентифицирован, перенаправляем на страницу входа
        return <Navigate to="/login" replace />;
    }

    // Если пользователь аутентифицирован, рендерим защищенный компонент
    return children;
};

export default PrivateRoute;