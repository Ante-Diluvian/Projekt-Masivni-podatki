// src/pages/RegisterScreen.js
import React, { useState } from 'react';
import { register } from '../api/auth';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //TODO: Logiko za registracijo uporabnika

    return (
        <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Registracija</Text>

        <Text>Uporabniško ime:</Text>
        <TextInput
            value={username}
            //onChangeText={setUsername}
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            autoCapitalize="none"
        />

        <Text>Email:</Text>
        <TextInput
            value={email}
            //onChangeText={setEmail}
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <Text>Geslo:</Text>
        <TextInput
            value={password}
            //onChangeText={setPassword}
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            secureTextEntry
        />

        <Button title="Registriraj se"/>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
            <Text>Že imate račun? Prijavite se</Text>
        </TouchableOpacity>
        </View>
    );
};

export default RegisterScreen;