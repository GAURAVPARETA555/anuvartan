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

            // handle both res and res.data
            const data = res?.data || res;

            setCaseData(data);

            console.log("CASE DATA:", data);
            console.log("AI SUMMARY:", data?.ai_summary);
            console.log("SYMPTOMS:", data?.symptoms);
            console.log("STATUS:", data?.status);
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
            const errorMsg =
                error.response?.data?.error || "Failed to escalate case";
            Alert.alert("Error", errorMsg);
        }
    };

    // Helper: Safely converts any value (string, number, array, object) into a printable string
    const renderSafeText = (val: any, fallback: string = ""): string => {
        if (val === null || val === undefined || val === "") return fallback;
        if (
            typeof val === "string" ||
            typeof val === "number" ||
            typeof val === "boolean"
        ) {
            return String(val);
        }
        if (Array.isArray(val)) {
            if (val.length === 0) return fallback;
            return val
                .map((item) =>
                    typeof item === "object"
                        ? JSON.stringify(item)
                        : String(item)
                )
                .join(", ");
        }
        if (typeof val === "object") {
            try {
                return JSON.stringify(val);
            } catch {
                return fallback;
            }
        }
        return String(val);
    };

    // Helper: Safely renders an array or string as bullet points, or displays fallback text
    const renderSafeList = (items: any, fallback: string) => {
        if (Array.isArray(items) && items.length > 0) {
            return (
                <View style={styles.listContainer}>
                    {items.map((item: any, idx: number) => (
                        <Text key={idx} style={styles.bulletItem}>
                            • {renderSafeText(item)}
                        </Text>
                    ))}
                </View>
            );
        }
        if (typeof items === "string" && items.trim().length > 0) {
            return (
                <View style={styles.listContainer}>
                    <Text style={styles.bulletItem}>• {items}</Text>
                </View>
            );
        }
        return <Text style={styles.subText}>{fallback}</Text>;
    };

    // Helper: Safely parses ai_summary whether it's an object or JSON string
    const getParsedAiSummary = (aiSummaryRaw: any) => {
        if (!aiSummaryRaw) return null;
        if (typeof aiSummaryRaw === "object") return aiSummaryRaw;
        if (typeof aiSummaryRaw === "string") {
            try {
                return JSON.parse(aiSummaryRaw);
            } catch {
                return null;
            }
        }
        return null;
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

    const status = caseData.status ? String(caseData.status).toUpperCase() : "";

    return (
        <ScrollView 
            style={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.card}>
                <Text style={styles.title}>
                    {renderSafeText(caseData.title, "Untitled Case")}
                </Text>

                <View style={styles.row}>
                    <Text style={styles.tag}>
                        Status: {renderSafeText(status, "UNKNOWN")}
                    </Text>
                    <Text style={styles.tag}>
                        Severity:{" "}
                        {renderSafeText(caseData.severity, "Unspecified")}
                    </Text>
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
                    <Text style={styles.escalatedText}>
                        ⚠️ Already escalated to doctor
                    </Text>
                </View>
            )}

            {/* Symptoms / Description */}
            <View style={styles.card}>
                <Text style={styles.section}>Symptoms</Text>
                <Text style={styles.text}>
                    {renderSafeText(
                        caseData.symptoms || caseData.description,
                        "No symptoms or description provided"
                    )}
                </Text>
            </View>

            {/* AI Summary */}
            <View style={styles.card}>
                <Text style={styles.section}>AI Summary</Text>
                {(() => {
                    const aiSummary = getParsedAiSummary(caseData.ai_summary);
                    if (
                        !aiSummary ||
                        (typeof aiSummary === "object" &&
                            Object.keys(aiSummary).length === 0)
                    ) {
                        return (
                            <Text style={styles.subText}>
                                No AI summary available
                            </Text>
                        );
                    }

                    return (
                        <View style={styles.summaryContainer}>
                            <Text style={styles.label}>Chief Complaint</Text>
                            <Text style={styles.text}>
                                {renderSafeText(
                                    aiSummary.chief_complaint,
                                    "None reported"
                                )}
                            </Text>

                            <Text style={styles.label}>Duration</Text>
                            <Text style={styles.text}>
                                {renderSafeText(
                                    aiSummary.duration,
                                    "Not specified"
                                )}
                            </Text>

                            <Text style={styles.label}>
                                Severity Assessment
                            </Text>
                            <Text style={styles.text}>
                                {renderSafeText(
                                    aiSummary.severity_assessment,
                                    "Unspecified"
                                )}
                            </Text>

                            <Text style={styles.label}>
                                AI Identified Symptoms
                            </Text>
                            {renderSafeList(
                                aiSummary.symptoms,
                                "No symptoms listed"
                            )}

                            <Text style={styles.label}>Red Flags</Text>
                            {renderSafeList(
                                aiSummary.red_flags,
                                "No red flags identified"
                            )}

                            <Text style={styles.label}>Summary</Text>
                            <Text style={styles.text}>
                                {renderSafeText(
                                    aiSummary.summary_text,
                                    "No detailed summary provided"
                                )}
                            </Text>

                            {Array.isArray(aiSummary.new_updates) && aiSummary.new_updates.length > 0 && (
                                <>
                                    <Text style={styles.label}>Recent Updates</Text>
                                    {renderSafeList(aiSummary.new_updates, "No updates")}
                                </>
                            )}
                        </View>
                    );
                })()}
            </View>

            {/* Image */}
            {typeof caseData.image === "string" && caseData.image.trim() !== "" && (
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

    label: {
        fontWeight: "bold",
        marginTop: 10,
        fontSize: 14,
        color: "#333",
    },

    text: {
        marginTop: 2,
        color: "#444",
        fontSize: 14,
    },

    subText: {
        marginTop: 4,
        color: "#777",
        fontStyle: "italic",
        fontSize: 14,
    },

    listContainer: {
        marginTop: 4,
    },

    bulletItem: {
        marginTop: 2,
        color: "#444",
        fontSize: 14,
        paddingLeft: 4,
    },

    summaryContainer: {
        marginTop: 4,
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