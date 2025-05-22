import axios from "axios"
import { ACCESS_TOKEN } from "./constants"
const BASE = import.meta.env.VITE_API_URL || "https://grouph-h.onrender.com";
const api = axios.create({
   
    baseURL: BASE,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

export default api;
