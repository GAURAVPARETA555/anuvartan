import API from "./axios";

export const loginUser = async (username: string, password: string) => {

    const response = await API.post("/api/users/login/", {
        username,
        password,
    });

    console.log("LOGIN RESPONSE:", response.data);

    const { access, refresh, role, user_id } = response.data;

    // Let AuthContext handle local storage instead to avoid duplicate saves and context misses
    return response.data;
};

export const registerUser = async (data: any) => {
    const response = await API.post("/api/users/register/", data);
    return response.data;
};
