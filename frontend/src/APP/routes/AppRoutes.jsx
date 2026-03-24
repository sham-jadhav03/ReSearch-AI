import {createBrowserRouter } from 'react-router'
import Login from '../../features/auth/pages/Login'
import Register from '../../features/auth/pages/Register'
import DashBoard from '../../features/chat/pages/DashBoard'


export const router = createBrowserRouter([
    {
        path:'/login',
        element: <Login /> 
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/',
        element: <DashBoard />
    }
])