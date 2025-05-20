import React, { useState, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';



export default function ExerciseDetail({ route, navigation }) {
    const { exercise } = route.params;
    const [status, setStatus] = useState('idle'); // idle, running, paused

    const [{x, y, z},setAccelerometer] = useState({x: 0, y:0, z:0})
    const accelerometerSubscription = useRef(null);

    const [speed, setSpeed] = useState(0);

    const velocity = useRef({ x: 0, y: 0, z: 0 });
    const lastTimestamp = useRef(null);

    const handleStart = () =>{ 
        setStatus('running');
        startExercise();
    }
    const handlePause = () => {
        setStatus('paused');
        pauseExercise();
    }
    const handleStop = () => { 
        setStatus('idle');
        stopExercise();
    }
    const startExercise = async () => {
        if (accelerometerSubscription.current) return;
        
        Accelerometer.setUpdateInterval(100);

        accelerometerSubscription.current = Accelerometer.addListener(accelData => {
            const magnitude = Math.sqrt(
            accelData.x ** 2 + accelData.y ** 2 + accelData.z ** 2
        );
    
        const netAccel = Math.abs(magnitude - 1); 
        const estimatedSpeed = netAccel * 3; 
    
        setSpeed(estimatedSpeed.toFixed(2)); 
        setAccelerometer(accelData);
    });
    }

    const pauseExercise = async () => {
       if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
            accelerometerSubscription.current = null;
        }
    }

    const stopExercise = async () => {
        if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
            accelerometerSubscription.current = null;
        }
    }

    return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <ImageBackground
            source={exercise.image}
            style={styles.image}
            imageStyle={styles.imageStyle}
        >
            <View style={styles.overlay}>
            <Text style={styles.title}>{exercise.name}</Text>
            </View>
        </ImageBackground>

        <View style={styles.infoSection}>
            <Text style={styles.detail}>Duration: {exercise.duration} min</Text>
            <Text style={styles.detail}>Calories: {exercise.caloriesBurned}</Text>
            <Text style={styles.detail}>Distance: {exercise.distance} m</Text>
        </View>

        <View style={styles.sensorSection}>
            <Text style={styles.sensorTitle}>Sensors (soon):</Text>
            <Text style={styles.sensorText}>GPS:</Text>
            <Text style={styles.sensorText}>Akcelerometer: ...</Text>
            <Text style={styles.sensorText}>Speed: {speed} m/s</Text>
            <StatusBar style="auto" />
        </View>

        <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleStart} style={[styles.button, status === 'running' && styles.buttonActive]} /* TODO: onPress={handleStart} */ >
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePause} style={[styles.button, status === 'paused' && styles.buttonActive]} /* TODO: onPress={handlePause} */ >
                <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStop} style={[styles.button, status === 'idle' && styles.buttonActive]} /* TODO: onPress={handleStop} */ >
                <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        flex: 1,
        paddingBottom: 100,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#FF3B3F',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    backText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    image: {
        height: 320,
        justifyContent: 'flex-end',
    },
    imageStyle: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        padding: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    infoSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    detail: {
        fontSize: 20,
        color: '#eee',
        marginBottom: 12,
        fontWeight: '600',
    },
    sensorSection: {
        marginTop: 60,
        paddingHorizontal: 20,
    },
    sensorTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sensorText: {
        color: '#aaa',
        fontSize: 14,
    },
    buttonRow: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#333',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonActive: {
        backgroundColor: '#FF3B3F',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});