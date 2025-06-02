import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkLoginStatus } from './api/auth';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { loginImageToServer } from './flaskServer';

// mqtt
import { initMqttClient, getMqttClient } from './MqttContext';

// Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';
import ProfileScreen from './screens/ProfileScreen';
import ExerciseDetail from './screens/ExerciseDetail';
import { AppState } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack({ onLogin }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}>
      <Stack.Screen name="Home" component={MainScreen} />
      <Stack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecognized, setIsRecognized] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (event) => {
      const handleAppStateChange = async () => {
        if (event === 'background' || event === 'inactive') {
          const client = getMqttClient();
          if (!client) 
            return;

          try {
            const data = await AsyncStorage.getItem('token');
            if (!data) 
              return;

            const userId = JSON.parse(data)._id;
            client.publish("status/offline", userId, 0, false);
            console.log('App is in the background or inactive');
            console.log('User ID:', userId);
          } catch (error) {
            console.error('Error handling app state change:', error);
          }
        } else if (event === 'active') {
          console.log('App is active');
        }
      };

      handleAppStateChange();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ 
      allowsEditing: false,
      quality: 1, 
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log('Captured Image URI:', imageUri);
      const result1 = await loginImageToServer(imageUri);
      setSuccess(result1);
    } else {
      console.log('Camera cancelled');
    }
  };

  async function getData() {
    try {    
      const data = await AsyncStorage.getItem('token');
      console.log('Token:', data);
      setIsAuthenticated(!!data);

      if (data) {
        const parsedData = JSON.parse(data);
        const userId = parsedData._id;

        initMqttClient(userId);

        const client = getMqttClient();
        client.removeAllListeners('message');
        client.subscribe(`app/twofactor/send/${userId}`, (err) => {
          if (err) {
            console.error('MQTT subscribe error:', err);
          } else {
            console.log(`Subscribed to app/twofactor/send/${userId}`);
          }
        });

        client.on('message', (topic, messageBuffer) => {
          if (topic === `app/twofactor/send/${userId}`) {
            const message = JSON.parse(messageBuffer.toString());

            Alert.alert('Login Attempt', message.message || 'Approve login?', [
              {
                text: 'Deny',
                onPress: () => {
                  const jsonfile = JSON.stringify({status:'denied', success});
                  console.log('Publishing to app/twofactor/verify:', jsonfile);
                  client.publish(`app/twofactor/verify/${userId}`,jsonfile , { qos: 2 });
                },
                style: 'cancel',
              },
              {
                text: 'Approve',
                onPress: () =>{
                  openCamera();
                  const jsonfile = JSON.stringify({status:'approved', success});
                  console.log('Publishing to app/twofactor/verify:', jsonfile);
                  client.publish(`app/twofactor/verify/${userId}`,jsonfile , { qos: 2 });
                },
              },
            ], { cancelable: false });
          }
        });
      }
    } catch (error) {
      console.error('Error getting login data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  if (isLoading)
    return null;
  
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        {isAuthenticated ? (
          <AppStack onLogout={() => setIsAuthenticated(false)}/>
        ) : (
          <AuthStack onLogin={() => setIsAuthenticated(true)} />
        )}
      </NavigationContainer>
    </>
  );
}