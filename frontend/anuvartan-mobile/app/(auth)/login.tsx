import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { loginUser } from "../../src/api/authApi";
import { handleApiError } from "../../src/utils/apiErrorHandler";
import { useAuth } from "../../src/context/AuthContext";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Card } from "../../src/components/Card";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { colors } from "../../src/theme/colors";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            handleApiError("Please enter username and password");
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(username, password);
            const { access, role } = data;
            
            await login(access, role, username);

            const normalizedRole = role?.toLowerCase();
            if (normalizedRole === "patient") {
                router.replace("/(tabs)/patient");
            } else if (normalizedRole === "nurse") {
                router.replace("/(tabs)/nurse/nurse");
            } else if (normalizedRole === "doctor") {
                router.replace("/(tabs)/doctor");
            } else {
                handleApiError(`Unknown user role: ${role}`);
            }

        } catch (error: any) {
            handleApiError(error, "Invalid credentials or server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Image 
                    source={require("../../assets/logo.png")} 
                    style={{ width: 80, height: 80, borderRadius: 20 }} 
                />
            </View>
            <Card style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your medical account</Text>

                <Input
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Button 
                    title="Sign In" 
                    onPress={handleLogin} 
                    loading={loading} 
                    style={{ marginTop: 18 }} 
                />
                
                <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Register</Text></Text>
                </TouchableOpacity>
            </Card>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        backgroundColor: colors.background,
    },
    card: {
        padding: 28,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
        textAlign: "center",
        color: colors.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: 32,
    },
    linkContainer: {
        marginTop: 24,
        alignItems: "center",
    },
    linkText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    linkTextBold: {
        color: colors.primary,
        fontWeight: "bold",
    }
});
