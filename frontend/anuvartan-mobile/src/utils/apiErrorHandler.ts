import { Alert } from "react-native";

export const handleApiError = (error: any, fallbackMessage: string = "An unexpected error occurred") => {
    console.log("API Error:", error?.response?.data || error?.message);
    let errorMsg = fallbackMessage;
    
    if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === "string") {
            errorMsg = data;
        } else if (data.detail) {
            errorMsg = data.detail;
        } else if (data.message) {
            errorMsg = data.message;
        } else if (Object.keys(data).length > 0) {
            // grab the first array of validation errors if present
            const firstKey = Object.keys(data)[0];
            const firstError = data[firstKey];
            if (Array.isArray(firstError)) {
                errorMsg = `${firstKey}: ${firstError[0]}`;
            } else if (typeof firstError === "string") {
                errorMsg = `${firstKey}: ${firstError}`;
            }
        }
    }
    
    Alert.alert("Error", errorMsg);
};
