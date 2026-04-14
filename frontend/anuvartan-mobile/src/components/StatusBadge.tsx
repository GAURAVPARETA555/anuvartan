import React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";
import { colors } from "../theme/colors";

interface StatusBadgeProps extends ViewProps {
    status: string;
    type?: "status" | "severity";
}

export const StatusBadge = ({ status, type = "status", style, ...props }: StatusBadgeProps) => {
    
    const getColor = (val: string) => {
        const lower = val?.toLowerCase();
        if (lower === "open") return colors.warning;
        if (lower === "escalated" || lower === "high" || lower === "critical") return colors.danger;
        if (lower === "closed" || lower === "low") return colors.success;
        if (lower === "in_progress" || lower === "medium") return colors.primary;
        return colors.neutral;
    };

    const bgColor = getColor(status);

    return (
        <View style={[styles.badge, { backgroundColor: bgColor }, style]} {...props}>
            <Text style={styles.text}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 24,
        alignSelf: "flex-start",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: colors.white,
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    }
});
