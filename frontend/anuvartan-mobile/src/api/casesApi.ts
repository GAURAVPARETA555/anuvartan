import API from "./axios";

// create case
export const createCase = async (data: {
    hospital: number;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
}) => {
    try {
        console.log("Sending case:", data);

        const response = await API.post("/api/triage/create-case/", data);

        console.log("Case created:", response.data);

        return response.data;

    } catch (error: any) {
        console.log("CREATE CASE ERROR:", error.response?.data || error.message);
        throw error;
    }

};

// Nurse: get assigned open cases
export const getNurseCases = async () => {
    const response = await API.get("/api/triage/nurse/cases/");
    return response.data;
};

// get messages
export const getCaseMessages = async (caseId: number) => {
    const response = await API.get(`/api/triage/messages/${caseId}/`);
    return response.data;
};

// send message
export const sendMessage = async (caseId: number, message: string) => {
    const response = await API.post("/api/triage/send-message/", {
        case: caseId,
        message,
    });
    return response.data;
};
export const getPatientCases = async () => {
    const res = await API.get("/api/triage/my-cases/");
    return res.data;
};

// get case by id
export const getCaseById = async (caseId: number | string) => {
    const response = await API.get(`/api/triage/case/${caseId}/`);
    return response.data;
};
export const escalateCase = async (caseId: number) => {
    const res = await API.patch(`/api/triage/case/${caseId}/escalate/`);
    return res.data;
};
export const getDoctorCases = async () => {
    const response = await API.get("/api/triage/doctor/cases/");
    return response.data;
}
export const updateCase = async (caseId: number | string, data: any) => {
    const response = await API.patch(`/api/triage/case/${caseId}/update/`, data);
    return response.data;
};
export const getCaseDetail = (id: any) => {
    return API.get(`/api/triage/case/${id}/`);
};

export const closeCase = async (caseId: number, prescription: string) => {
    const res = await API.patch(`/api/triage/case/${caseId}/close/`, {
        prescription,
    });
    return res.data;
};