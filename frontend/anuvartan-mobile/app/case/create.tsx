import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { getHospitals } from "../../src/api/hospitalApi";
import { createCase } from "../../src/api/casesApi";

export default function CreateCase() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("medium");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const data = await getHospitals();
            setHospitals(data);
        } catch (error) {
            console.log("Hospital fetch error:", error);
        }
    };

    const handleCreate = async () => {
        if (!selectedHospital) {
            Alert.alert("Error", "Please select hospital");
            return;
        }

        if (!title || !description) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            await createCase({
                hospital: selectedHospital,
                title,
                description,
                severity,
            });

            Alert.alert("Success", "Case created successfully");

            // Reset form
            setTitle("");
            setDescription("");
            setSelectedHospital(null);
            setSeverity("medium");

            router.back(); // go back to patient dashboard

        } catch (error: any) {
            console.log(error.response?.data || error);
            Alert.alert("Error", "Failed to create case");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Create Case</Text>

            <Text style={styles.label}>Select Hospital</Text>
            <Picker
                selectedValue={selectedHospital}
                onValueChange={(itemValue) => setSelectedHospital(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="-- Select Hospital --" value={null} />
                {hospitals.map((hospital) => (
                    <Picker.Item
                        key={hospital.id}
                        label={`${hospital.name} - ${hospital.city}`}
                        value={hospital.id}
                    />
                ))}
            </Picker>

            <TextInput
                placeholder="Case Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />

            <TextInput
                placeholder="Case Description"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 100 }]}
                multiline
            />

            <Text style={styles.label}>Severity</Text>

            <View style={styles.severityRow}>
                {["low", "medium", "high", "critical"].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.severityBtn,
                            severity === level && styles.selectedSeverity,
                        ]}
                        onPress={() => setSeverity(level)}
                    >
                        <Text
                            style={
                                severity === level
                                    ? styles.selectedText
                                    : styles.severityText
                            }
                        >
                            {level.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleCreate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Create Case</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    label: {
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 10,
        borderRadius: 6,
    },
    severityRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    severityBtn: {
        borderWidth: 1,
        borderColor: "#b62828",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedSeverity: {
        backgroundColor: "#b62828",
    },
    severityText: {
        color: "#b62828",
    },
    selectedText: {
        color: "white",
    },
    button: {
        backgroundColor: "#b62828",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});