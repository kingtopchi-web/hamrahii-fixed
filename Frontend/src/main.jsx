import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import routes from "./routes/routes.jsx";
import { store } from "./store/store.js";
import { GoogleMapsProvider } from "./components/maps/GoogleMapsProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <GoogleMapsProvider>

    <RouterProvider router={routes} />
    </GoogleMapsProvider>
  </Provider>
);
