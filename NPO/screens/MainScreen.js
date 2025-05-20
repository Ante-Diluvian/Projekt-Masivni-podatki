import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MainScreen = () => {
  // Za zdaj samo prikaz placeholderjev za GPS in akselerometer

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home Screen</Text>

      <View style={styles.section}>
        <Text style={styles.title}>GPS Location:</Text>
        <Text style={styles.placeholder}>Latitude: --</Text>
        <Text style={styles.placeholder}>Longitude: --</Text>
        <Text style={styles.placeholder}>Altitude: --</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Accelerometer Data:</Text>
        <Text style={styles.placeholder}>x: --</Text>
        <Text style={styles.placeholder}>y: --</Text>
        <Text style={styles.placeholder}>z: --</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center',
  },
  section: {
    marginBottom: 40,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
});

export default MainScreen;