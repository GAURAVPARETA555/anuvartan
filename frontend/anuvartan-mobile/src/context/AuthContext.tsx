import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AuthContextType {
    user: string | null;
    role: string | null;
    token: string | null;
    login: (token: string, role: string, user: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem("access_token");
            const storedRole = await AsyncStorage.getItem("role");
            const storedUser = await AsyncStorage.getItem("user");
            
            if (storedToken) {
                setToken(storedToken);
                setRole(storedRole);
                setUser(storedUser);
            }
        } catch (error) {
            console.log("Error loading auth data", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (newToken: string, newRole: string, newUser: string) => {
        setToken(newToken);
        setRole(newRole);
        setUser(newUser);
        await AsyncStorage.setItem("access_token", newToken);
        await AsyncStorage.setItem("role", newRole);
        await AsyncStorage.setItem("user", newUser);
    };

    const logout = async () => {
        setToken(null);
        setRole(null);
        setUser(null);
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        await AsyncStorage.removeItem("role");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("user_id");
        router.replace("/(auth)/login");
    };

    return (
        <AuthContext.Provider value={{ user, role, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
