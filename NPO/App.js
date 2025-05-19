import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

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
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            ...tabBarOptions,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'LoginTab') {
                iconName = focused ? 'log-in' : 'log-in-outline';
              }
              else if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={MainScreen} options={{ tabBarLabel: 'Home' }} />
          <Tab.Screen name="LoginTab" component={LoginStack} options={{ tabBarLabel: 'Login' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}