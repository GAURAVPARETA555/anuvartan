import React from "react";
import { View, TextInput, StyleSheet, Text, TextInputProps } from "react-native";
import { colors } from "../theme/colors";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style
                ]}
                placeholderTextColor={colors.textSecondary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        width: "100%",
    },
    label: {
        marginBottom: 6,
        fontWeight: "600",
        color: colors.textPrimary,
        fontSize: 14,
        letterSpacing: 0.2,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 16,
        backgroundColor: colors.inputBg,
        fontSize: 16,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.danger,
    },
    errorText: {
        color: colors.danger,
        fontSize: 12,
        marginTop: 4,
    }
});
