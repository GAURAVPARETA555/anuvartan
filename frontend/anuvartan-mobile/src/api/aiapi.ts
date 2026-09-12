import axios from "./axios";
import API from "./axios";

export const explainCase = async (caseId: number) => {
    const response = await axios.post(`/api/triage/case/${caseId}/ai-explain/`);
    return response.data;
};

// chatWithAI sends one patient message to the AI intake chat endpoint.
//
// The backend saves the message, rebuilds the full conversation history,
// calls Groq with tool calling, then returns:
//   { reply: string, summary_ready: boolean }
//
// When summary_ready is true, the AI has gathered enough information and
// saved a structured triage summary to case.ai_summary -- show the patient
// a confirmation and disable the chat input.
export const chatWithAI = async (
    caseId: number,
    message: string
): Promise<{ reply: string; summary_ready: boolean }> => {
    const response = await API.post(`/api/triage/case/${caseId}/ai-chat/`, {
        message,
    });
    return response.data;
};