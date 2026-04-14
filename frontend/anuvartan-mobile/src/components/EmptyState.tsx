import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface EmptyStateProps {
    title?: string;
    message?: string;
}

export const EmptyState = ({ 
    title = "Nothing here yet", 
    message = "No items to display at this moment." 
}: EmptyStateProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        marginTop: 50,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
    }
});
