import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getDoctorCases } from "../../../src/api/casesApi";
import { colors } from "../../../src/theme/colors";
import { Card } from "../../../src/components/Card";
import { StatusBadge } from "../../../src/components/StatusBadge";

export default function DoctorDashboard() {

    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchCases();
        }, [])
    );

    const fetchCases = async () => {
        try {
            const data = await getDoctorCases();
            const activeCases = data.filter(
                (c: any) => c.status !== "CLOSED"
            );
            setCases(activeCases);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading cases...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Doctor Dashboard</Text>
            </View>

            {cases.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No active cases waiting</Text>
                </View>
            ) : (
                <FlatList
                    data={cases}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => router.push(`/doctor/${item.id}` as any)}>
                            <Card style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.caseTitle}>
                                        Patient: {item.patient_name || "Unknown"}
                                    </Text>
                                    <StatusBadge status={item.status} />
                                </View>

                                <Text style={styles.subtitle}>
                                    Condition: {item.title || "Not specified"}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.date}>
                                        Created: {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                    </Text>
                                    <Text style={[styles.severity, { color: item.severity === 'HIGH' ? colors.danger : colors.textSecondary }]}>
                                        Severity: {item.severity}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: colors.background,
    },
    header: {
        marginTop: 16,
        marginBottom: 20,
    },
    heading: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.primary,
        letterSpacing: -0.5,
    },
    card: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    caseTitle: {
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
        color: colors.textPrimary,
        marginRight: 10,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    date: {
        fontSize: 12,
        color: colors.neutral,
        fontWeight: "600",
    },
    severity: {
        fontSize: 12,
        fontWeight: "bold",
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});