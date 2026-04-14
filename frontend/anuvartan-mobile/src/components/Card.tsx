import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors } from "../theme/colors";

interface CardProps extends ViewProps {
    children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    }
});
