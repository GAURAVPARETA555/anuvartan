import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from "react-native";
import { colors } from "../theme/colors";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    type?: "primary" | "danger" | "success";
}

export const Button = ({ title, loading, type = "primary", style, disabled, ...props }: ButtonProps) => {
    let bgColor = colors.primary;
    if (type === "danger") bgColor = colors.danger;
    if (type === "success") bgColor = colors.success;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: disabled ? colors.neutral : bgColor },
                style
            ]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    text: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.5,
    }
});
