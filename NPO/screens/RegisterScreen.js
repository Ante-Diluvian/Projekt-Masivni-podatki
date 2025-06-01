import React, { useState } from 'react';
import { Image, Alert, View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { register } from '../api/auth';

import Capture from  '../components/Capture';

const RegisterScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);

    //Step 1
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //Step 2
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState('');

    const validateStepOne = () => {
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStepTwo = () => {
        if (!age.trim() || !weight.trim() || !height.trim() || !gender.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }
        if (isNaN(age) || isNaN(weight) || isNaN(height)) {
            Alert.alert('Error', 'Age, weight, and height must be numbers!');
            return false;
        }
        if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
            Alert.alert('Error', 'Gender must be male, female or other');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateStepTwo()) 
            return;

        try {
            const data = await register({
                username,
                email,
                password,
                age: Number(age),
                weight: Number(weight),
                height: Number(height),
                gender: gender.toLowerCase(),
            });
            setStep(3);
        } catch (error) {
            console.error('Registration Error Details:', error);
            Alert.alert('Registration failed', error.response?.data?.message || 'Unknown error');
        }
    };

    const handleNext = () => {
        if (validateStepOne()) 
            setStep(2);
    }; 

      if (step === 3) {
        return (
            <Capture
                username={username}
                onDone={() => {
                    Alert.alert('Done', 'Face registration complete');
                    navigation.goBack();
                }}
            />
        );
    }

    return (
        <>
        {!imageLoaded && (
            <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
            </View>
        )}

        <ImageBackground
            source={require('../assets/images/auth-background.jpg')}
            style={styles.background}
            resizeMode="cover"
            onLoadEnd={() => setImageLoaded(true)}
        >
        <StatusBar style="light" />
        <View style={styles.overlay} />
        <View style={styles.container}>
            {step === 1 && (
            <>
                <Text style={styles.title}>Register - Step 1</Text>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholderTextColor="#666"
                />
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
                <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry
                    placeholderTextColor="#666"
                />

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.textLink}>Already have an account? Login here</Text>
                </TouchableOpacity>
            </>
            )}
            {step === 2 && (
            <>
                <Text style={styles.title}>Register - Step 2</Text>

                <TextInput
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                />
                <TextInput
                    placeholder="Weight (kg)"
                    value={weight}
                    onChangeText={setWeight}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                />
                <TextInput
                    placeholder="Height (cm)"
                    value={height}
                    onChangeText={setHeight}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                />
                <TextInput
                    placeholder="Gender (male, female, other)"
                    value={gender}
                    onChangeText={setGender}
                    style={styles.input}
                    placeholderTextColor="#666"
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.textLink}>Back to Step 1</Text>
                </TouchableOpacity>
            </>
            )}
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        width: '85%',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.85)',
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
        color: '#000',
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
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 10,
    }
});

export default RegisterScreen;