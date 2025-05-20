import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkLoginStatus } from './api/auth';

// Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}>
      <Stack.Screen name="Home" component={MainScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

const tabBarOptions = {
  tabBarActiveTintColor: '#000000',
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: {
    backgroundColor: '#f8f8f8',
    height: 60,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const verifySession = async () => {
        const user = await checkLoginStatus();
        setIsAuthenticated(!!user);
        setIsLoading(false);
      };
      verifySession();
  }, []);

  if (isLoading) 
    return null;

  return (
    <>
    <StatusBar style="dark" />
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: () => null, //Brez ikon
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tab.Screen name="HomeTab" component={MainScreen} />
        </Tab.Navigator>
      ) : (
        <LoginStack />
      )}
    </NavigationContainer>
    </>
  );
}