import React, {  useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { Alert, Linking  } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';

export default function ExerciseDetail({ route, navigation }) {
    const { exercise } = route.params;
    const [status, setStatus] = useState('idle'); // idle, running, paused

    const [{x, y, z},setAccelerometer] = useState({x: 0, y:0, z:0})
    const accelerometerSubscription = useRef(null);

    const [speed, setSpeed] = useState(0);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [location,setLocation] = useState({latitude:null, longitude:null, altitude:null})

    const totalSpeed = useRef(0);
    const readingCount = useRef(0);
    const locationSubscription = useRef(null);
    
    useKeepAwake(status ==='running' ? 'exercise-session' : null);
//#region Speed
    const handleStart = async  () =>{ 
        const granted = await requestAccelerometerPermission();
        const locationPermission = await requestLocationPermission();

        if (!granted || !locationPermission){ 
            setStatus('idle');
            return;
        }
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

            totalSpeed.current += estimatedSpeed;
            readingCount.current += 1;
            const newAvg = totalSpeed.current / readingCount.current;

            setMaxSpeed(prevMax => {
              const newMax = Math.max(prevMax, estimatedSpeed);
              return newMax.toFixed(2);
            });

            setAvgSpeed(newAvg.toFixed(2));
            setAccelerometer(accelData);
        });
        locationSubscription.current = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.High,
            distanceInterval: 1, 
        },
        (newLocation) => {
            const { latitude, longitude, altitude } = newLocation.coords;
            setLocation({ latitude, longitude, altitude });
            if (newLocation.coords.speed) {
                setSpeed(newLocation.coords.speed.toFixed(2));
            }
        });
    }

    const pauseExercise = async () => {
       if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
            accelerometerSubscription.current = null;
        }
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }

    const stopExercise = async () => {
        if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
            accelerometerSubscription.current = null;
        }
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }
//#endregion

//#region Alert
    const alertStop = () => {
        handlePause();

        Alert.alert(
            "STOP EXERCISE",
            "Are you sure you want to stop?",
            [{
                text: "Cancel",
                style: "cancel",
                onPress: handleStart,
            },
            {
                text: "Yes",
                onPress: handleStop,
                style: "destructive",
            }
        ],
            { cancelable: true }
        )
    }
    const requestAccelerometerPermission = async () => {
    const { status, canAskAgain } = await Accelerometer.getPermissionsAsync();

    if (status !== 'granted') {
        const { status: newStatus } = await Accelerometer.requestPermissionsAsync();

        if (newStatus !== 'granted') {
            Alert.alert(
                "Motion Permission Required",
                "Motion sensor permission is needed to track your activity. Please enable it in settings.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Open Settings",
                        onPress: () => Linking.openSettings(),
                    },
                ]
            );
            return false;
        }
    }

    return true;
    };

    const requestLocationPermission = async () => {
         const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

            if (newStatus !== 'granted') {
                Alert.alert(
                    "Location Permission Required",
                    "Location access is required for tracking. Please enable it in settings.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Open Settings",
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
                return false;
            }
        }

        return true;
    };
//#endregion
   
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.infoSection}>
            <Text style={styles.detail}>Duration: {exercise.duration} min</Text>
            <Text style={styles.detail}>Calories: {exercise.caloriesBurned}</Text>
            <Text style={styles.detail}>Distance: {exercise.distance} m</Text>
        </View>
        <View style={styles.speedContainer}>
            <Text>GPS</Text>
            <Text>Logitude {location.longitude ?? '---'}</Text>
            <Text>Lagitude {location.latitude ?? '---'}</Text>
            <Text>Altitude {location.altitude ?? '---'}</Text>
        </View>
        <View style={styles.speedContainer}>
            <Text style={styles.speedTitle}>SPEED METRICS</Text>
            <View style={styles.speedRow}>
                <View style={styles.speedBox}>
                    <Text style={styles.speedLabel}>Current</Text>
                    <Text style={styles.speedValue}>{speed} m/s</Text>
                </View>
                <View style={styles.speedBox}>
                    <Text style={styles.speedLabel}>Average</Text>
                    <Text style={styles.speedValue}>{avgSpeed} m/s</Text>
                </View>
                <View style={styles.speedBox}>
                    <Text style={styles.speedLabel}>Max</Text>
                    <Text style={styles.speedValue}>{maxSpeed} m/s</Text>
                </View>
            </View>
        </View>
    </ScrollView>
        <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleStart} style={[styles.button, status === 'running' && styles.buttonActive]} /* TODO: onPress={handleStart} */ >
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePause} style={[styles.button, status === 'paused' && styles.buttonActive]} /* TODO: onPress={handlePause} */ >
                <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={alertStop} style={[styles.button, status === 'idle' && styles.buttonActive]} /* TODO: onPress={handleStop} */ >
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
    scrollContainer: {
        paddingBottom: 100,  
    },
    speedContainer: {
        backgroundColor: '#FF3B3F',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    speedTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    speedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    speedBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    speedLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    speedValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});