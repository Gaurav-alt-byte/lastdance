import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://cracked-tube.onrender.com/api/v1",
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Server Error";
    return Promise.reject(message);
  },
);

export default apiClient;
