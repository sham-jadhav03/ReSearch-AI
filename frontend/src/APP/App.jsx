import { RouterProvider } from "react-router";
import { router } from "./routes/AppRoutes.jsx";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
