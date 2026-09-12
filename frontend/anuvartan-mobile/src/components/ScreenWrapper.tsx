import React from "react";
import { View, StyleSheet, ScrollView, ViewProps, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "../theme/colors";

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    scrollable?: boolean;
    keyboardOffset?: number;
}

export const ScreenWrapper = ({ 
    children, 
    scrollable = true, 
    style, 
    keyboardOffset,
    ...props 
}: ScreenWrapperProps) => {
    const defaultOffset = keyboardOffset ?? (Platform.OS === "ios" ? 80 : 0);

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={defaultOffset}
        >
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={[styles.contentContainer, style]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    {...(props as any)}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.contentContainer, style]} {...(props as any)}>
                    {children}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: colors.background,
    },
});
