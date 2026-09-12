import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCaseMessages, getCaseById, sendMessage } from "../../src/api/casesApi";
import { chatWithAI } from "../../src/api/aiapi";
import { handleApiError } from "../../src/utils/apiErrorHandler";
import { useAuth } from "../../src/context/AuthContext";

export default function CaseChat() {
    const { id } = useLocalSearchParams();
    const caseId = Array.isArray(id) ? Number(id[0]) : Number(id);
    const { role } = useAuth();

    const [messages, setMessages] = useState<any[]>([]);
    const [caseData, setCaseData] = useState<any>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [summaryReady, setSummaryReady] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (caseId) {
            fetchData();
        }
    }, [caseId]);

    const fetchData = async () => {
        try {
            const [msgRes, cRes] = await Promise.all([
                getCaseMessages(caseId),
                getCaseById(caseId).catch(() => null),
            ]);
            setMessages(msgRes || []);

            const fetchedCase = cRes?.data || cRes;
            if (fetchedCase) {
                setCaseData(fetchedCase);
                if (fetchedCase.ai_summary) {
                    setSummaryReady(true);
                }
            }
        } catch (err) {
            handleApiError(err, "Could not load messages.");
        }
    };

    const handleSend = async () => {
        if (!text.trim() || loading || caseData?.status === "CLOSED") return;

        const userMessage = text.trim();
        setText("");
        setLoading(true);

        try {
            const currentRole = (role || "").toUpperCase();

            // Nurse or Doctor message -> send via human chat endpoint
            if (currentRole === "NURSE" || currentRole === "DOCTOR") {
                const newMsg = await sendMessage(caseId, userMessage);
                setMessages((prev) => [...prev, newMsg]);
            } else {
                // Patient message -> send via AI chat endpoint for continuous AI response & dynamic summary updates
                const optimisticMsg = {
                    id: `temp-${Date.now()}`,
                    sender: "patient",
                    sender_role: "PATIENT",
                    sender_name: "You",
                    message: userMessage,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, optimisticMsg]);

                const result = await chatWithAI(caseId, userMessage);

                // Re-fetch messages from server for authoritative state (includes patient msg + AI response)
                const updatedMsgs = await getCaseMessages(caseId);
                setMessages(updatedMsgs);

                if ((result as any)?.ai_summary || result.summary_ready) {
                    setSummaryReady(true);
                    const updatedCase = await getCaseById(caseId).catch(() => null);
                    if (updatedCase) setCaseData(updatedCase?.data || updatedCase);
                }
            }
        } catch (err) {
            handleApiError(err, "Failed to send message. Please try again.");
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    const isClosed = caseData?.status === "CLOSED";

    const getSenderBadgeStyle = (senderRole: string, sender: string) => {
        const role = (senderRole || sender || "").toLowerCase();
        if (role === "patient") return styles.patientBadge;
        if (role === "nurse") return styles.nurseBadge;
        if (role === "doctor") return styles.doctorBadge;
        if (role === "ai") return styles.aiBadge;
        return styles.defaultBadge;
    };

    const getMessageBubbleStyle = (senderRole: string, sender: string) => {
        const role = (senderRole || sender || "").toLowerCase();
        if (role === "patient") return styles.patientBubble;
        if (role === "nurse") return styles.nurseBubble;
        if (role === "doctor") return styles.doctorBubble;
        if (role === "ai") return styles.aiBubble;
        return styles.otherBubble;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => (item.id || `msg-${Math.random()}`).toString()}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                }
                renderItem={({ item }) => {
                    const senderRole = item.sender_role || (item.sender ? item.sender.toUpperCase() : "UNKNOWN");
                    const senderName = item.sender_name || item.sender;

                    return (
                        <View style={[styles.message, getMessageBubbleStyle(item.sender_role, item.sender)]}>
                            <View style={styles.headerRow}>
                                <Text style={styles.senderName}>{senderName}</Text>
                                <Text style={[styles.roleBadge, getSenderBadgeStyle(item.sender_role, item.sender)]}>
                                    {senderRole}
                                </Text>
                            </View>
                            <Text style={styles.messageText}>{item.message}</Text>
                        </View>
                    );
                }}
            />

            {/* Banners */}
            {summaryReady && !isClosed && (
                <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>
                        💬 Shared Case Chat — Patient, AI Assistant, Nurse & Doctor active.
                    </Text>
                </View>
            )}

            {isClosed && (
                <View style={styles.closedBanner}>
                    <Text style={styles.closedText}>
                        ⚠️ Case is closed. Chat is read-only.
                    </Text>
                </View>
            )}

            {/* Typing Indicator */}
            {loading && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#b62828" />
                    <Text style={styles.loadingText}>Sending...</Text>
                </View>
            )}

            {/* Chat Input */}
            <View style={styles.inputRow}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={
                        isClosed
                            ? "Case is closed."
                            : "Type a message..."
                    }
                    style={[
                        styles.input,
                        (isClosed || loading) && styles.inputDisabled,
                    ]}
                    editable={!isClosed && !loading}
                />

                <TouchableOpacity
                    style={[
                        styles.sendBtn,
                        (isClosed || loading) && styles.sendBtnDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={isClosed || loading}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f8",
        padding: 10,
    },
    message: {
        padding: 12,
        borderRadius: 10,
        marginVertical: 4,
        maxWidth: "80%",
    },
    patientBubble: {
        backgroundColor: "#e3f2fd",
        alignSelf: "flex-end",
    },
    nurseBubble: {
        backgroundColor: "#e8f5e9",
        alignSelf: "flex-start",
    },
    doctorBubble: {
        backgroundColor: "#fff3e0",
        alignSelf: "flex-start",
    },
    aiBubble: {
        backgroundColor: "#f3e5f5",
        alignSelf: "flex-start",
    },
    otherBubble: {
        backgroundColor: "#eee",
        alignSelf: "flex-start",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
        gap: 8,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    messageText: {
        fontSize: 14,
        color: "#222",
    },
    roleBadge: {
        fontSize: 9,
        fontWeight: "bold",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: "hidden",
        color: "#fff",
    },
    patientBadge: {
        backgroundColor: "#1976d2",
    },
    nurseBadge: {
        backgroundColor: "#2e7d32",
    },
    doctorBadge: {
        backgroundColor: "#e65100",
    },
    aiBadge: {
        backgroundColor: "#7b1fa2",
    },
    defaultBadge: {
        backgroundColor: "#666",
    },
    inputRow: {
        flexDirection: "row",
        marginTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
    },
    inputDisabled: {
        backgroundColor: "#eee",
        color: "#999",
    },
    sendBtn: {
        backgroundColor: "#b62828",
        marginLeft: 10,
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 8,
    },
    sendBtnDisabled: {
        backgroundColor: "#ccc",
    },
    infoBanner: {
        backgroundColor: "#e3f2fd",
        borderRadius: 8,
        padding: 10,
        marginVertical: 6,
        borderLeftWidth: 4,
        borderLeftColor: "#1976d2",
    },
    infoText: {
        color: "#1976d2",
        fontWeight: "600",
        fontSize: 13,
    },
    closedBanner: {
        backgroundColor: "#ffe5e5",
        borderRadius: 8,
        padding: 10,
        marginVertical: 6,
        borderLeftWidth: 4,
        borderLeftColor: "#d9534f",
    },
    closedText: {
        color: "#d9534f",
        fontWeight: "600",
        fontSize: 13,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        gap: 8,
    },
    loadingText: {
        color: "#888",
        fontSize: 13,
    },
});
