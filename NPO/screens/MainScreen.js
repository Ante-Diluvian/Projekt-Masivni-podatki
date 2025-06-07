import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Excercise components
import Exercises from '../components/Exercises';
import {Window2FA} from '../components/Enable2Fa';

const MainScreen = ({ navigation }) => {
  const [user, setUser] = useState({ username: '', email: '', password: ''  });
  const [show2FA, setShow2FA] = useState(false);

  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('token');
            if(userData)
                setUser(JSON.parse(userData));
                console.log(userData);
        } catch (error) {
                console.error('Failed to load user data', error);
            }
        };
        fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ marginTop:12 }}>
          <Text style={styles.title}>READY TO</Text>
          <Text style={styles.subtitle}>WORKOUT</Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../assets/images/auth-background.jpg')} style={styles.avatar}/>
          </TouchableOpacity>

           <TouchableOpacity onPress={() => {
             if (!user?.twoFactor?.web) {
               setShow2FA(true);
             }
             }} style={[ styles.bellWrapper, !user.twoFactor?.web && styles.bellWrapperRed ]}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Exercises/>
      </View>

      {show2FA && (
        <View style={StyleSheet.absoluteFill}>
          <Window2FA user={user} onClose={() => setShow2FA(false)} onUserUpdate={setUser}/>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF3B3F',
  },
  rightSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bellWrapper: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 25,
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  bellWrapperRed: {
    backgroundColor: '#FF3B3F',
  },
});

export default MainScreen;