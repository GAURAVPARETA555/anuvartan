import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCaseDetail, getCaseMessages, sendMessage } from "../../src/api/casesApi";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { Loader } from "../../src/components/Loader";
import { useAuth } from "../../src/context/AuthContext";
import { handleApiError } from "../../src/utils/apiErrorHandler";
import { colors } from "../../src/theme/colors";

export default function CaseDetail() {
    const { id } = useLocalSearchParams();
    const [caseData, setCaseData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    const { user } = useAuth();
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (id) {
            fetchCaseDetailsAndMessages();
        }
    }, [id]);

    const fetchCaseDetailsAndMessages = async () => {
        try {
            const [detailRes, msgsRes] = await Promise.all([
                getCaseDetail(id),
                getCaseMessages(id as any)
            ]);
            setCaseData(detailRes.data);
            setMessages(msgsRes || []);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (error) {
            console.log("Error fetching case details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;
        setSending(true);
        try {
            await sendMessage(id as any, messageInput);
            setMessageInput("");
            const msgsRes = await getCaseMessages(id as any);
            setMessages(msgsRes || []);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (error) {
            handleApiError(error, "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Loader message="Loading Case Details..." />;
    if (!caseData) return <View style={styles.center}><Text>Error Loading Case Data.</Text></View>;

    const isClosed = caseData.status?.toLowerCase() === "closed";

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListHeaderComponent={
                        <Card style={{ marginBottom: 16 }}>
                            <View style={styles.headerRow}>
                                <Text style={styles.title}>{caseData.title}</Text>
                                <StatusBadge status={caseData.status} />
                            </View>
                            <Text style={styles.dateText}>Created On: {new Date(caseData.created_at).toLocaleDateString()}</Text>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.description}>{caseData.description}</Text>
                            </View>

                            {caseData.diagnosis && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Diagnosis</Text>
                                    <Text style={styles.description}>{caseData.diagnosis}</Text>
                                </View>
                            )}

                            {caseData.prescription && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Prescription</Text>
                                    <Text style={styles.description}>{caseData.prescription}</Text>
                                </View>
                            )}
                        </Card>
                    }
                    renderItem={({ item }) => {
                        const isMe = item.sender === caseData.patient?.username || item.sender === "patient" && user === caseData.patient?.username; 
                        // Note: Backend might send sender string value or User object, assuming simple string matching for now based on plans
                        const bubbleAlign = item.sender === 'patient' || item.sender === user ? 'flex-end' : 'flex-start';
                        const bubbleBg = item.sender === 'patient' || item.sender === user ? colors.primary : '#E5E5EA';
                        const textColor = item.sender === 'patient' || item.sender === user ? colors.white : colors.textPrimary;

                        return (
                            <View style={[styles.bubbleWrapper, { alignSelf: bubbleAlign }]}>
                                <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 2 }}>{item.sender}</Text>
                                <View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
                                    <Text style={{ color: textColor }}>{item.message}</Text>
                                </View>
                            </View>
                        );
                    }}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.chatInput}
                        placeholder={isClosed ? "Case is closed" : "Type a message..."}
                        value={messageInput}
                        onChangeText={setMessageInput}
                        editable={!isClosed}
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, (isClosed || !messageInput.trim()) && { opacity: 0.5 }]} 
                        onPress={handleSendMessage}
                        disabled={isClosed || !messageInput.trim() || sending}
                    >
                        <Text style={{ color: colors.white, fontWeight: "bold" }}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary, flex: 1 },
    dateText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
    section: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border },
    sectionTitle: { fontWeight: "bold", fontSize: 16, color: colors.textPrimary, marginBottom: 8 },
    description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    
    bubbleWrapper: { maxWidth: "80%", marginVertical: 6 },
    bubble: { padding: 12, borderRadius: 16 },
    
    inputContainer: { flexDirection: "row", padding: 12, backgroundColor: colors.white, borderTopWidth: 1, borderColor: colors.border, alignItems: "center" },
    chatInput: { flex: 1, backgroundColor: "#f4f6f8", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16 },
    sendBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 10 }
});
