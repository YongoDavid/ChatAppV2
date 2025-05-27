import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://chatappv2-erkt.onrender.com" : "http://localhost:5001/api",
  withCredentials: true,
});
// export const axiosInstance = axios.creates({
//   baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
//   withCredentials: true,
// });
