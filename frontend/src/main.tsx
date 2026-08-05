import "bootstrap/dist/css/bootstrap.min.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("Application root element is missing.");

const router = createBrowserRouter([{ path: "*", element: <App /> }]);
createRoot(root).render(<RouterProvider router={router} />);
