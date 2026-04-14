import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
const API = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.10.86:8000",
    timeout: 10000,
});
 
// ✅ REQUEST INTERCEPTOR
API.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// ✅ RESPONSE INTERCEPTOR
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Token expired
        if (error.response?.status === 401) {
            console.log("Session expired. Logging out...");
            await AsyncStorage.removeItem("access_token");
            await AsyncStorage.removeItem("refresh_token");

            // Later we redirect to login screen
        }
        return Promise.reject(error);
    }
)

export default API;