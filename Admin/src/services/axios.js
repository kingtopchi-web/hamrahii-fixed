import axios from "axios";

const getDefaultBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();
  if (envUrl) return envUrl;
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://server.humrahii.com/api";
  }
  return "http://localhost:9898/api";
};

const Axios = axios.create({
  baseURL: getDefaultBaseUrl(),
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default Axios;
