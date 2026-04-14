import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getPatientCases } from "../../../src/api/casesApi";
import { colors } from "../../../src/theme/colors";
import { Card } from "../../../src/components/Card";
import { StatusBadge } from "../../../src/components/StatusBadge";
import { Button } from "../../../src/components/Button";

export default function PatientScreen() {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchCases();
        }, [])
    );

    const fetchCases = async () => {
        try {
            const data = await getPatientCases();
            setCases(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>My Medical Cases</Text>
            </View>

            <Button 
                title="+ Create New Case" 
                onPress={() => router.push("/case/create")}
                style={{ marginBottom: 20 }}
            />

            {cases.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No cases created yet</Text>
                </View>
            ) : (
                <FlatList
                    data={cases}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => router.push(`/case/${item.id}`)}>
                            <Card style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <StatusBadge status={item.status} />
                                </View>

                                <Text numberOfLines={2} style={styles.description}>
                                    {item.description}
                                </Text>

                                <Text style={styles.date}>
                                    Created: {new Date(item.created_at).toLocaleDateString()}
                                </Text>
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
        marginBottom: 16,
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
    date: {
        fontSize: 12,
        color: colors.neutral,
        fontWeight: "600",
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