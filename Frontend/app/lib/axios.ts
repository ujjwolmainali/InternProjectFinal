import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // DO NOT refresh if refresh-token itself failed
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    //  Retry once for other endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh-token", {}, { withCredentials: true });
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
