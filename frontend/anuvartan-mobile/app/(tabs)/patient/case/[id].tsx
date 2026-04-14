import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getCaseDetail } from "../../../../src/api/casesApi";

export default function CaseDetail() {
    const { id } = useLocalSearchParams();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCase();
    }, []);

    const fetchCase = async () => {
        try {
            const res = await getCaseDetail(id);
            setCaseData(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!caseData) return null;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{caseData.title}</Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.text}>{caseData.description}</Text>

            <Text style={styles.label}>Severity</Text>
            <Text style={styles.text}>{caseData.severity}</Text>

            <Text style={styles.label}>Status</Text>
            <Text style={styles.text}>{caseData.status}</Text>

            <Text style={styles.section}>Doctor Diagnosis</Text>
            <Text style={styles.text}>
                {caseData.diagnosis || "Diagnosis not provided yet"}
            </Text>

            <Text style={styles.section}>Prescription</Text>
            <Text style={styles.text}>
                {caseData.prescription || "Prescription not provided yet"}
            </Text>
               {caseData.status !== "CLOSED" ? (
                   <TouchableOpacity
                       style={styles.chatButton}
                       onPress={() => router.push(`/chat/${caseData.id}`)}
                   >
                       <Text style={styles.chatText}>Open Chat</Text>
                  </TouchableOpacity>
                ) : (
                    <Text style={{ color: "red", marginTop: 10, textAlign: "center", fontWeight: "bold" }}>
                        Case closed. Chat disabled.
                    </Text>
                )}
                
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f6f8",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
    label: {
        fontWeight: "bold",
        marginTop: 10,
    },
    text: {
        marginTop: 4,
        color: "#444",
    },
    section: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    chatButton: {
        backgroundColor: "#2c7be5",
        padding: 14,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },

    chatText: {
        color: "white",
        fontWeight: "bold",
    }
    
});