import React from "react";
import { View, StyleSheet, ScrollView, ViewProps } from "react-native";
import { colors } from "../theme/colors";

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    scrollable?: boolean;
}

export const ScreenWrapper = ({ children, scrollable = false, style, ...props }: ScreenWrapperProps) => {
    if (scrollable) {
        return (
            <ScrollView 
                contentContainerStyle={[styles.container, style]} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" 
                {...(props as any)}
            >
                {children}
            </ScrollView>
        );
    }
    
    return (
        <View style={[styles.container, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 16,
        backgroundColor: colors.background,
    }
});
