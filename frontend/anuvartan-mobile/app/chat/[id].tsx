import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCaseMessages, sendMessage } from "../../src/api/casesApi";

export default function CaseChat() {
    const { id } = useLocalSearchParams();

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await getCaseMessages(Number(id));
            setMessages(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSend = async () => {
        if (!text.trim()) return;

        await sendMessage( Number(id), text );

        setText("");
        fetchMessages();
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.message,
                            item.sender === "patient"
                                ? styles.patient
                                : styles.other,
                        ]}
                    >
                        <Text style={styles.sender}>{item.sender}</Text>
                        <Text>{item.message}</Text>
                    </View>
                )}
            />

            <View style={styles.inputRow}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Type message..."
                    style={styles.input}
                />

                <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                    <Text style={{ color: "white" }}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f8",
        padding: 10,
    },
    message: {
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        maxWidth: "75%",
    },
    patient: {
        backgroundColor: "#b62828",
        alignSelf: "flex-end",
    },
    other: {
        backgroundColor: "#ddd",
        alignSelf: "flex-start",
    },
    sender: {
        fontSize: 11,
        fontWeight: "bold",
    },
    inputRow: {
        flexDirection: "row",
        marginTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
    },
    sendBtn: {
        backgroundColor: "#b62828",
        marginLeft: 10,
        paddingHorizontal: 15,
        justifyContent: "center",
        borderRadius: 8,
    },
});