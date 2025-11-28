import axios from "axios";
import { getToken, removeToken } from "./tokenManager";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api",
});

// Add a request interceptor to add token to every request
instance.interceptors.request.use(
  function (config) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Transform error for easier handling in components
    let errorMessage = "Đã xảy ra lỗi, vui lòng thử lại sau";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      // Handle 401 Unauthorized errors (token expired)
      if (error.response.status === 401) {
        removeToken();
        errorMessage = "Email hoặc mật khẩu không đúng, vui lòng đăng nhập lại";

        // Only redirect to login page if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối";
    }

    // Add the error message to the error object for easy access
    error.displayMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default instance;
