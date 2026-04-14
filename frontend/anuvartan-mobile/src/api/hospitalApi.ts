import API from "./axios";

export const getHospitals = async () => {
    const response = await API.get("/api/hospitals/");
    return response.data;
};
