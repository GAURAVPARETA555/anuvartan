import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "../theme/colors";

interface BackButtonProps {
    fallbackRoute?: string;
}

export const BackButton = ({ fallbackRoute = "/(tabs)/patient" }: BackButtonProps) => {
    const handlePress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Need to type assert because router.replace is strict sometimes
            router.replace(fallbackRoute as any);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
            <Text style={styles.text}>← Back</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 8,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    text: {
        color: colors.primary,
        fontWeight: "bold",
        fontSize: 16,
    }
});
