import { createBrowserRouter, Navigate } from "react-router";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import DashBoard from "../../features/chat/pages/DashBoard";
import Protected from "../../features/auth/components/Protected";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <DashBoard />
      </Protected>
    ),
  },
  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
]);
