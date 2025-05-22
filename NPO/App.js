import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkLoginStatus } from './api/auth';

//mqtt
import { initMqttClient, getMqttClient  } from './MqttContext';

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

  AppState.addEventListener('change', (event) => {
    if (event === 'background' || event === 'inactive') {
      const client = getMqttClient();
      const data = AsyncStorage.getItem('token');
      if(!client || !data) return;
      const userId = data ? JSON.parse(data)._id : null;
      client.publish("status/offline", userId, 0, false);
      console.log('App is in the background or inactive');
      console.log('User ID:', userId);
    } else if (event === 'active') {
      console.log('App is active');
    }
  });

  async function getData() {
    try {    
      const data = await AsyncStorage.getItem('token');
      console.log('Token:', data);
      setIsAuthenticated(!!data);
      if (data){
        initMqttClient(data ? JSON.parse(data)._id : null);
      }
    }
    catch (error) {
      console.error('Error getting login data:', error);
      setIsAuthenticated(false);
    }
    finally {
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