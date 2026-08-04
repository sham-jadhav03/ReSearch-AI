/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router";
import { useSelector } from "react-redux";
import { lazy, Suspense } from "react";
import Protected from "../../features/auth/components/Protected";

const Login = lazy(() => import("../../features/auth/pages/Login"));
const Register = lazy(() => import("../../features/auth/pages/Register"));
const DashBoard = lazy(() => import("../../features/chat/pages/DashBoard"));
const Landing = lazy(() => import("../../features/chat/pages/Landing"));
const Profile = lazy(() => import("../../features/chat/pages/Profile"));

const LoadingFallback = () => (
  <div className="flex h-screen bg-[#0f0f10] items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#34d399]/20 border-t-[#34d399] rounded-full animate-spin" />
  </div>
);

const RootComponent = () => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <LoadingFallback />;
  }

  return user ? <Protected><DashBoard /></Protected> : <Landing />;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RootComponent />
      </Suspense>
    ),
  },
  {
    path: "/landing",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/profile",
    element: (
      <Protected>
        <Suspense fallback={<LoadingFallback />}>
          <Profile />
        </Suspense>
      </Protected>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
