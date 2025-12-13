

const api = axios.create({
  baseURL: "http://localhost:4000/v1/",
  withCredentials: true });


api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshRes = await api.post("/auth/refresh-token");
      if (refreshRes.status === 200) {
        localStorage.setItem("accessToken", refreshRes.data.accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${refreshRes.data.accessToken}`;
        return api(originalRequest); 
      }
    }

    return Promise.reject(error);
  }
);


