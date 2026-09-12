import React from "react";
import { Modal, View, Text, StyleSheet, ActivityIndicator, } from "react-native";

interface Props{
    visible: boolean;
}
export default function ProcessingModal({ visible }: Props) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <ActivityIndicator size="large" color="#2C7BE5" />
                    <Text style={styles.title}>Processing...</Text>
                    <Text style={styles.subtitle}>AI is explaining your prescription </Text>
                </View>
            </View>
        </Modal>);
}
const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },

    box: {
        width: "75%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        alignItems: "center"
    },

    title: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: "bold"
    },

    subtitle: {
        marginTop: 10,
        color: "gray",
        textAlign: "center"
    }

});