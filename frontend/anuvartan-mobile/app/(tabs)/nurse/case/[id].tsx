import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { escalateCase, getCaseById } from "../../../../src/api/casesApi";

export default function CaseDetailScreen() {

    const { id } = useLocalSearchParams();
    const caseId = Array.isArray(id) ? Number(id[0]) : Number(id);

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (caseId) {
            fetchCase();
        }
    }, [caseId]);

    const fetchCase = async () => {
        try {
            const res = await getCaseById(caseId);

            // ✅ FIX: handle both res and res.data
            const data = res?.data || res;

            setCaseData(data);

            console.log("STATUS:", data.status);
        } catch (err) {
            console.log("CASE ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEscalate = async () => {
        try {
            await escalateCase(caseId);
            Alert.alert("Success", "Case escalated to doctor");
            fetchCase();
        } catch (error: any) {
            console.log(error);
            const errorMsg = error.response?.data?.error || "Failed to escalate case";
            Alert.alert("Error", errorMsg);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!caseData) {
        return (
            <View style={styles.center}>
                <Text>No Case Data Found</Text>
            </View>
        );
    }

    const status = caseData.status?.toUpperCase();

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.card}>
                <Text style={styles.title}>{caseData.title}</Text>

                <View style={styles.row}>
                    <Text style={styles.tag}>Status: {status}</Text>
                    <Text style={styles.tag}>Severity: {caseData.severity}</Text>
                </View>
            </View>

            {/* CLOSED / ESCALATED BANNER */}
            {status === "CLOSED" && (
                <View style={styles.closedBanner}>
                    <Text style={styles.closedText}>⚠️ This case is CLOSED</Text>
                </View>
            )}

            {status === "ESCALATED" && (
                <View style={styles.escalatedBanner}>
                    <Text style={styles.escalatedText}>⚠️ Already escalated to doctor</Text>
                </View>
            )}

            {/* Symptoms */}
            <View style={styles.card}>
                <Text style={styles.section}>Symptoms</Text>
                <Text>{caseData.symptoms}</Text>
            </View>

            {/* AI Summary */}
            <View style={styles.card}>
                <Text style={styles.section}>AI Summary</Text>
                <Text>{caseData.ai_summary}</Text>
            </View>

            {/* Image */}
            {caseData.image && (
                <View style={styles.card}>
                    <Text style={styles.section}>Uploaded Image</Text>
                    <Image
                        source={{ uri: caseData.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Chat Button */}
            {status !== "CLOSED" ? (
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => router.push(`/chat/${caseId}`)}
                >
                    <Text style={styles.buttonText}>Open Chat</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.disabledText}>
                    Chat disabled (case closed)
                </Text>
            )}

            {/* ESCALATE BUTTON */}
            {/* Escalate Button */ }
{caseData.status === "OPEN" && (
                <TouchableOpacity
                    style={styles.escalateButton}
                    onPress={handleEscalate}
                >
                    <Text style={styles.buttonText}>⬆️ Escalate to Doctor</Text>
                </TouchableOpacity>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f4f6f8",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },

    section: {
        fontWeight: "bold",
        marginBottom: 6,
        fontSize: 16,
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },

    tag: {
        backgroundColor: "#eee",
        padding: 6,
        borderRadius: 6,
    },

    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },

    chatButton: {
        backgroundColor: "#b62828",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },

    escalateButton: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },

    disabledText: {
        color: "gray",
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

    closedText: {
        color: "#d9534f",
        fontWeight: "bold",
    },

    escalatedBanner: {
        backgroundColor: "#fff3cd",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
    },

    escalatedText: {
        color: "#856404",
        fontWeight: "bold",
    },

});