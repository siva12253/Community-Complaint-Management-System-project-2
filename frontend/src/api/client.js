import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

let refreshPromise;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");
    if (
      error.response?.status !== 401 ||
      !refreshToken ||
      !originalRequest ||
      originalRequest._retried ||
      originalRequest.url?.includes("/auth/token/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;
    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh: refreshToken })
        .then(({ data }) => {
          localStorage.setItem("accessToken", data.access);
          return data.access;
        })
        .catch((refreshError) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.dispatchEvent(new Event("auth:expired"));
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      originalRequest.headers.Authorization = `Bearer ${await refreshPromise}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export function errorMessage(error) {
  const data = error?.response?.data?.error || error?.response?.data;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => `${key === "non_field_errors" ? "" : `${key}: `}${Array.isArray(value) ? value.join(", ") : value}`)
      .join(" ");
  }
  return error?.message || "Something went wrong. Please try again.";
}

export default api;
