import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
    getCaseById,
    getCaseMessages,
    sendMessage,
    closeCase,
    updateCase,
} from "../../../src/api/casesApi";

export default function DoctorCaseDetail() {
    const { id } = useLocalSearchParams();
    const caseId = Array.isArray(id) ? Number(id[0]) : Number(id);

    const [caseData, setCaseData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescription, setPrescription] = useState("");

    useEffect(() => {
        fetchCase();
        fetchMessages();
    }, []);

    const fetchCase = async () => {
        try {
            const data = await getCaseById(caseId);
            setCaseData(data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        const data = await getCaseMessages(caseId);
        setMessages(data);
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        await sendMessage(caseId, text);
        setText("");
        fetchMessages();
    };

    const handleSavePrescription = async () => {
        if (!prescription.trim() && !diagnosis.trim()) {
            alert("Please enter diagnosis or prescription to save");
            return;
        }

        try {
            await updateCase(caseId, { prescription, diagnosis });
            alert("Prescription saved successfully");
            fetchCase();
        } catch (error) {
            console.log(error);
            alert("Failed to save prescription");
        }
    };

    const handleCloseCase = async () => {
        if (!prescription.trim()) {
            alert("Please enter prescription");
            return;
        }

        try {
            await closeCase(caseId, prescription);
            alert("Case Closed Successfully");
            fetchCase();
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>

                {/* Header */}
                <Text style={styles.title}>Doctor Case Panel</Text>

                {/* Case Info Card */}
                <View style={styles.card}>
                    <Text style={styles.caseTitle}>{caseData.title}</Text>
                    <Text style={styles.desc}>{caseData.description}</Text>

                    <View style={styles.row}>
                        <Text style={[styles.badge, caseData.status === "CLOSED" && styles.closedBadge]}>
                            {caseData.status}
                        </Text>
                        <Text style={[styles.badge, styles.severity]}>
                            {caseData.severity}
                        </Text>
                    </View>
                </View>

                {/* Diagnosis Section */}
                {caseData.status !== "CLOSED" && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Medical Input</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter diagnosis"
                            value={diagnosis}
                            onChangeText={setDiagnosis}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Enter prescription"
                            value={prescription}
                            onChangeText={setPrescription}
                            multiline
                        />

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: "#007bff", flex: 1, marginRight: 5 }]} onPress={handleSavePrescription}>
                                <Text style={styles.btnText}>Save Input</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.closeBtn, { flex: 1, marginLeft: 5 }]} onPress={handleCloseCase}>
                                <Text style={styles.btnText}>Close Case</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Chat Section */}
                <Text style={styles.chatTitle}>Patient Chat</Text>

                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.message,
                                item.sender === "doctor"
                                    ? styles.doctorMsg
                                    : styles.patientMsg,
                            ]}
                        >
                            <Text style={styles.sender}>{item.sender}</Text>
                            <Text style={styles.msgText}>{item.message}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />

                {/* Chat Input */}
                {caseData.status !== "CLOSED" ? (
                    <View style={styles.chatBox}>
                        <TextInput
                            placeholder="Type message..."
                            value={text}
                            onChangeText={setText}
                            style={styles.chatInput}
                        />

                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Text style={{ color: "white" }}>Send</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.closedText}>Case closed. Chat disabled.</Text>
                )}

                {/* Final Prescription */}
                {caseData.status === "CLOSED" && (
                    <View style={styles.closedBanner}>
                        <Text style={styles.closedBannerText}>⚠️ This case is closed</Text>
                    </View>
                )}

                {caseData.status === "CLOSED" && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Final Prescription</Text>
                        <Text>{caseData.prescription}</Text>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f5f7fb",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
    },
    caseTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    desc: {
        marginTop: 5,
        color: "#555",
    },
    row: {
        flexDirection: "row",
        marginTop: 10,
    },
    badge: {
        backgroundColor: "#007bff",
        color: "white",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 10,
    },
    severity: {
        backgroundColor: "#ff6b6b",
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    closeBtn: {
        backgroundColor: "#28a745",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    message: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 4,
        maxWidth: "80%",
    },
    doctorMsg: {
        backgroundColor: "#d1e7dd",
        alignSelf: "flex-end",
    },
    patientMsg: {
        backgroundColor: "#e2e3e5",
        alignSelf: "flex-start",
    },
    sender: {
        fontWeight: "bold",
        fontSize: 12,
    },
    msgText: {
        marginTop: 2,
    },
    chatBox: {
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    chatInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 15,
    },
    sendBtn: {
        marginLeft: 10,
        backgroundColor: "#007bff",
        paddingHorizontal: 15,
        justifyContent: "center",
        borderRadius: 20,
    },
    closedText: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
    closedBanner: {
        backgroundColor: "#ffe5e5",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
    },
    closedBannerText: {
        color: "#d9534f",
        fontWeight: "bold",
    },
    closedBadge: {
        backgroundColor: "#dc3545",
    },
});
