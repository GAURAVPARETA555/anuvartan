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
import { getNurseCases } from "../../../src/api/casesApi";
import { colors } from "../../../src/theme/colors";
import { Card } from "../../../src/components/Card";
import { StatusBadge } from "../../../src/components/StatusBadge";

export default function NurseScreen() {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchCases();
        }, [])
    );

    const fetchCases = async () => {
        try {
            const data = await getNurseCases();
            setCases(data || []);
        } catch (error) {
            console.log("Fetch Error:", error);
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
                <Text style={styles.heading}>Nurse Dashboard</Text>
            </View>

            {cases.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No cases assigned yet</Text>
                </View>
            ) : (
                <FlatList
                    data={cases}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => router.push(`/nurse/case/${item.id}` as any)}>
                            <Card style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>
                                        Patient: {item.patient_name || "Unknown"}
                                    </Text>
                                    <StatusBadge status={item.status} />
                                </View>

                                <Text numberOfLines={2} style={styles.description}>
                                    {item.symptoms || "No symptoms listed."}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.date}>
                                        Created: {new Date(item.created_at).toLocaleDateString()}
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
    title: {
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
        color: colors.textPrimary,
        marginRight: 10,
    },
    description: {
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