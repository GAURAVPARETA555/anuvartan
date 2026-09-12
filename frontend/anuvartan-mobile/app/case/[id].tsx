import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from "react-native";
import { Button } from "@/src/components/Button";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { getCaseDetail } from "../../src/api/casesApi";
import ProcessingModal from "@/src/components/ProcessingModal";
import AIExplanationModal from "../../src/components/AIExplainationaModal";
import { explainCase } from "../../src/api/aiapi";

export default function CaseDetail() {
    const { id } = useLocalSearchParams();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const fetchCase = async () => {
        try {
            const res = await getCaseDetail(id);
            const data = res?.data || res;
            setCaseData(data);
        } catch (err) {
            console.log("Fetch case detail error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCase();
        }, [id])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCase();
    }, [id]);

    const handelExplain = async () => {
        try {
            setProcessing(true);
            const resource = await explainCase(Number(id));
            setAnalysis(resource.analysis);  
            setProcessing(false);
        } catch (err) {
            setProcessing(false);
            Alert.alert("AI Error", "Failed to get AI explanation.");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!caseData) return null;

    return (
        <>
            <ScrollView 
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.card}>
                    <Text style={styles.title}>{caseData.title}</Text>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.text}>{caseData.description}</Text>

                    <View style={styles.row}>
                        <Text style={styles.tag}>Severity: {caseData.severity}</Text>
                        <Text style={[styles.tag, caseData.status === "CLOSED" ? styles.closedTag : styles.openTag]}>
                            Status: {caseData.status}
                        </Text>
                    </View>
                </View>

                {/* Doctor Diagnosis Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Doctor Diagnosis</Text>
                    <Text style={caseData.diagnosis ? styles.medicalText : styles.placeholderText}>
                        {caseData.diagnosis || "Diagnosis not provided yet"}
                    </Text>
                </View>

                {/* Prescription Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Prescription</Text>
                    <Text style={caseData.prescription ? styles.medicalText : styles.placeholderText}>
                        {caseData.prescription || "Prescription not provided yet"}
                    </Text>
                    {Boolean(caseData.prescription) && (
                        <Button 
                            title="Explain Prescription with AI" 
                            onPress={handelExplain}
                            style={{ marginTop: 14 }}
                        />
                    )}
                </View>

                {caseData.status !== "CLOSED" ? (
                    <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => router.push(`/chat/${caseData.id}`)}
                    >
                        <Text style={styles.chatText}>Open Chat</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.closedBanner}>
                        <Text style={styles.closedBannerText}>
                            Case closed. Chat is disabled.
                        </Text>
                    </View>
                )}
            </ScrollView>
            <ProcessingModal visible={processing} />
            <AIExplanationModal visible={analysis !== null} analysis={analysis} onClose={() => setAnalysis(null)} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f4f6f8",
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#111",
    },
    label: {
        fontWeight: "bold",
        marginTop: 6,
        color: "#333",
    },
    text: {
        marginTop: 4,
        color: "#555",
        fontSize: 14,
        lineHeight: 20,
    },
    medicalText: {
        marginTop: 6,
        color: "#111",
        fontSize: 15,
        lineHeight: 22,
        fontWeight: "500",
    },
    placeholderText: {
        marginTop: 6,
        color: "#888",
        fontSize: 14,
        fontStyle: "italic",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007bff",
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    tag: {
        backgroundColor: "#eee",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: "bold",
    },
    openTag: {
        backgroundColor: "#e3f2fd",
        color: "#1976d2",
    },
    closedTag: {
        backgroundColor: "#ffe5e5",
        color: "#d9534f",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    chatButton: {
        backgroundColor: "#2c7be5",
        padding: 16,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    chatText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    closedBanner: {
        backgroundColor: "#ffe5e5",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    closedBannerText: {
        color: "#d9534f",
        fontWeight: "bold",
    },
});