import { RouterProvider } from "react-router";
import { router } from "./routes/AppRoutes.jsx";
import { useEffect } from "react";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

function App() {

  const {handleGetMe} =useAuth()

  useEffect(()=>{
    handleGetMe()
  }, [handleGetMe])
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
