import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
    if (!message) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fbecec", // soft red
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    text: {
        color: colors.danger,
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    }
});
