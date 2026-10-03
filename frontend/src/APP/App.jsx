import { RouterProvider } from "react-router";
import { router } from "./routes/AppRoutes.jsx";
import { useEffect } from "react";
import { useAuth } from "../features/auth/hooks/useAuth.js";

function App() {

  const {handleGetMe} =useAuth()

  useEffect(()=>{
    handleGetMe()
  }, [handleGetMe])
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
