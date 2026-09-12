import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";

import { Button } from "./Button";

interface Props {
    visible: boolean;
    analysis: any;
    onClose: () => void;
}

export default function AIExplanationModal({
    visible,
    analysis,
    onClose,
}: Props) {

    if (!analysis) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.overlay}>

                <View style={styles.container}>

                    <Text style={styles.heading}>
                        AI Prescription Explanation
                    </Text>

                    <ScrollView>

                        <Text style={styles.section}>
                            Disease
                        </Text>

                        <Text style={styles.label}>
                            Name
                        </Text>

                        <Text style={styles.value}>
                            {analysis.disease?.name || "Not Provided"}
                        </Text>

                        <Text style={styles.label}>
                            Summary
                        </Text>

                        <Text style={styles.value}>
                            {analysis.disease?.summary || "Not Available"}
                        </Text>


                        <Text style={styles.section}>
                            Medicines
                        </Text>

                        {analysis.medicines?.map((medicine: any, index: number) => (

                            <View
                                key={index}
                                style={styles.card}
                            >

                                <Text style={styles.label}>
                                    Name
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.name}
                                </Text>

                                <Text style={styles.label}>
                                    Purpose
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.purpose}
                                </Text>

                                <Text style={styles.label}>
                                    Dosage
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.dosage || "-"}
                                </Text>

                                <Text style={styles.label}>
                                    Timing
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.timing || "-"}
                                </Text>

                                <Text style={styles.label}>
                                    Food
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.food_instruction || "-"}
                                </Text>

                                <Text style={styles.label}>
                                    Duration
                                </Text>

                                <Text style={styles.value}>
                                    {medicine.duration || "-"}
                                </Text>

                            </View>

                        ))}


                        <Text style={styles.section}>
                            Diet
                        </Text>

                        <Text style={styles.label}>
                            Recommended
                        </Text>

                        {analysis.diet?.recommended?.map((item: string, i: number) => (
                            <Text
                                key={i}
                                style={styles.list}
                            >
                                • {item}
                            </Text>
                        ))}

                        <Text style={styles.label}>
                            Avoid
                        </Text>

                        {analysis.diet?.avoid?.map((item: string, i: number) => (
                            <Text
                                key={i}
                                style={styles.list}
                            >
                                • {item}
                            </Text>
                        ))}


                        <Text style={styles.section}>
                            Lifestyle
                        </Text>

                        {analysis.lifestyle?.map((item: string, i: number) => (
                            <Text
                                key={i}
                                style={styles.list}
                            >
                                • {item}
                            </Text>
                        ))}


                        <Text style={styles.section}>
                            Warning Signs
                        </Text>

                        {analysis.warning_signs?.map((item: string, i: number) => (
                            <Text
                                key={i}
                                style={styles.list}
                            >
                                • {item}
                            </Text>
                        ))}


                        <Text style={styles.section}>
                            Follow Up
                        </Text>

                        <Text style={styles.value}>
                            {analysis.follow_up || "-"}
                        </Text>

                        <Button
                            title="Close"
                            onPress={onClose}
                        />

                    </ScrollView>

                </View>

            </View>

        </Modal>
    );
}

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        width: "90%",
        height: "75%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
    },

    heading: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },

    section: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 8,
    },

    label: {
        fontWeight: "bold",
        marginTop: 8,
    },

    value: {
        color: "#555",
        marginBottom: 5,
    },

    list: {
        marginLeft: 12,
        marginBottom: 4,
    },

    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },

});