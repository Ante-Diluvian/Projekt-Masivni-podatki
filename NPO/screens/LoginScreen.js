import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { login } from '../api/auth';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    //TODO: Logiko za prijavo uporabnika

    return (
    <ImageBackground source={require('../assets/images/background.jpg')} style={styles.background} resizeMode="cover">
        <StatusBar style="light" />
        <View style={styles.overlay} />
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholderTextColor="#666"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.button} onPress={() => {/* TODO: call login */}}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.textLink}>If you don't have an account, register here</Text>
            </TouchableOpacity>
        </View>
    </ImageBackground>
    );
};

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // zatemnitev ozadja
    },
    container: {
        width: '85%',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        color: '#000',
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    textLink: {
        color: '#000',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;