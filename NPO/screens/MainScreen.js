import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Excercise komponente
import Exercises from '../components/Exercises';

const MainScreen = ({ navigation }) => {
  // Za zdaj samo prikaz placeholderjev za GPS in akselerometer

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ marginTop:12 }}>
          <Text style={styles.title}>READY TO</Text>
          <Text style={styles.subtitle}>WORKOUT</Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={require('../assets/images/auth-background.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}} style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={22} color="#bbb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Glavna vsebina */}
      <View style={styles.content}>
        <Exercises/>
      </View>
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
});

export default MainScreen;