import { createBrowserRouter, Navigate } from "react-router";
import { useSelector } from "react-redux";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import DashBoard from "../../features/chat/pages/DashBoard";
import Protected from "../../features/auth/components/Protected";
import Landing from "../../features/chat/pages/Landing";
import Profile from "../../features/chat/pages/Profile";

const RootComponent = () => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0f0f10] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#34d399]/20 border-t-[#34d399] rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <DashBoard /> : <Landing />;
};

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
    element: <RootComponent />,
  },
  {
    path: "/landing",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/profile",
    element: (
      <Protected>
        <Profile />
      </Protected>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
