import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

interface LoaderProps {
    message?: string;
}

export const Loader = ({ message = "Loading..." }: LoaderProps) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
    }
});
