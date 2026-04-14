import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { registerUser } from "../../src/api/authApi";
import API from "../../src/api/axios";
import { handleApiError } from "../../src/utils/apiErrorHandler";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Card } from "../../src/components/Card";
import { BackButton } from "../../src/components/BackButton";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { colors } from "../../src/theme/colors";
import { getHospitals } from "../../src/api/hospitalApi";
export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("PATIENT");
    
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role === "DOCTOR" || role === "NURSE") {
            fetchHospitals();
        }
    }, [role]);

    const fetchHospitals = async () => {
        try {
            const data = await getHospitals();
            console.log("HOSPITAL API RESPONSE:", data);
            if (Array.isArray(data)) {
                setHospitals(data);
            } else if (data?.results) {
                setHospitals(data.results);
            } else {
                setHospitals([]);
            }
        } catch (error) {
            console.log("Failed to load hospitals", error);
        }
    };

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        if ((role === "DOCTOR" || role === "NURSE") && !selectedHospital) {
            Alert.alert("Error", "You must select a hospital for this role.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                username,
                email,
                password,
                role,
                ...(selectedHospital && { hospitals: [selectedHospital] })
            };

            await registerUser(payload);
            Alert.alert("Success", "Registration successful. Please login.");
            router.replace("/(auth)/login");
        } catch (error: any) {
            handleApiError(error, "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper scrollable style={styles.container}>
            <BackButton fallbackRoute="/(auth)/login" />

            <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Image 
                    source={require("../../assets/logo.png")} 
                    style={{ width: 80, height: 80, borderRadius: 20 }} 
                />
            </View>

            <Card style={styles.card}>
                <Text style={styles.title}>Join Anuvartan</Text>
                <Text style={styles.subtitle}>Create your medical profile</Text>

                <View style={styles.roleContainer}>
                    {["PATIENT", "NURSE", "DOCTOR"].map(r => (
                        <TouchableOpacity 
                            key={r} 
                            style={[styles.roleBadge, role === r && styles.roleBadgeActive]}
                            onPress={() => {
                                setRole(r);
                                setSelectedHospital(null);
                                setHospitals([]);
                            }}
                        >
                            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input label="Username" placeholder="Enter username" value={username} onChangeText={setUsername} autoCapitalize="none" />
                <Input label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                <Input label="Password" placeholder="Enter password" secureTextEntry value={password} onChangeText={setPassword} />
                <Input label="Confirm Password" placeholder="Confirm your password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

                {(role === "DOCTOR" || role === "NURSE") && (
                    <View style={styles.hospitalContainer}>
                        <Text style={styles.hospitalLabel}>Select Hospital</Text>

                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedHospital}
                                onValueChange={(itemValue) => setSelectedHospital(itemValue)}
                                dropdownIconColor={colors.primary}
                            >
                                <Picker.Item
                                    label="-- Select Hospital --"
                                    value={null}
                                    color={colors.textSecondary}
                                />

                                {hospitals.length === 0 ? (
                                    <Picker.Item
                                        label="Loading hospitals..."
                                        value={null}
                                        color={colors.textSecondary}
                                    />
                                ) : (
                                    hospitals.map((hospital) => (
                                        <Picker.Item
                                            key={hospital.id.toString()}
                                            label={`${hospital.name} - ${hospital.city || "N/A"}`}
                                            value={hospital.id}
                                            color={colors.textPrimary}
                                        />
                                    ))
                                )}
                            </Picker>
                        </View>

                        {/* Optional helper text */}
                        {selectedHospital === null && (
                            <Text style={styles.helperText}>
                                Please select a hospital to continue
                            </Text>
                        )}
                    </View>
                )}

                <Button title="Register" onPress={handleRegister} loading={loading} style={{ marginTop: 24 }} />

                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Login</Text></Text>
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
        marginBottom: 24,
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    roleBadge: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        marginHorizontal: 4,
        alignItems: "center",
        backgroundColor: colors.inputBg,
    },
    roleBadgeActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    roleText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    roleTextActive: {
        color: colors.white,
    },
    hospitalContainer: {
        marginTop: 10,
    },
    hospitalLabel: {
        fontWeight: "bold",
        marginBottom: 6,
        color: colors.textPrimary,
    },
    hospCard: {
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    hospCardActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    errorText: {
        color: colors.danger,
        fontStyle: "italic",
    },
    linkContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    linkText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    linkTextBold: {
        color: colors.primary,
        fontWeight: "bold",
    },
    pickerWrapper: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        marginTop: 6,
        marginBottom: 10,
        overflow: "hidden", // smooth edges (important)
        backgroundColor: colors.inputBg,
    },

    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
});
