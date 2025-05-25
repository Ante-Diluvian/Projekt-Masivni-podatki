import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, onLogout }) => {
    const [user, setUser] = useState({ username: '', email: '', password: '', age: '', weight: '', height: '', gender: '', });

    useEffect(() => {
        const fetchUser = async () => {
            try {
            const userData = await AsyncStorage.getItem('token');
            if(userData) 
                setUser(JSON.parse(userData));
            
            } catch (error) {
                console.error('Failed to load user data', error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            onLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    } 

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FF3B3F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil uporabnika</Text>
          </View>

          <View style={styles.content}>
            {/* Osnovni podatki */}
            <Text style={styles.sectionTitle}>Osnovni podatki</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Uporabniško ime:</Text>
              <Text style={styles.value}>{user.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Geslo:</Text>
              <Text style={styles.value}>{user.password}</Text>
            </View>

            {/* Dodatni podatki */}
            <Text style={styles.sectionTitle}>Dodatni podatki</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Starost:</Text>
              <Text style={styles.value}>{user.age || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teža (kg):</Text>
              <Text style={styles.value}>{user.weight || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Višina (cm):</Text>
              <Text style={styles.value}>{user.height || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Spol:</Text>
              <Text style={styles.value}>{user.gender || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B3F',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3B3F',
    marginTop: 20,
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    color: '#bbb',
  },
  value: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  logoutContainer: {
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B3F',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileScreen;