import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const mockWorkouts = [
  {
    _id: '1',
    name: 'Jutranji tek',
    duration: 30,
    caloriesBurned: 250,
    distance: 5000,
    image: require('../assets/images/register-background.jpg'),
  },
  {
    _id: '2',
    name: 'Kolesarjenje',
    duration: 45,
    caloriesBurned: 400,
    distance: 15000,
    image: require('../assets/images/register-background.jpg'),
  },
  {
    _id: '3',
    name: 'HIIT trening',
    duration: 20,
    caloriesBurned: 300,
    distance: 0,
    image: require('../assets/images/register-background.jpg'),
  },
  {
    _id: '4',
    name: 'Jokanje pred kolokviji',
    duration: 120,
    caloriesBurned: 3000,
    distance: 0,
    image: require('../assets/images/register-background.jpg'),
  },
];

const screenWidth = Dimensions.get('window').width;
const spacing = 16;
const cardWidth = (screenWidth - spacing * 3.6) / 2;

export default function Exercises() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises</Text>

      <FlatList
        data={mockWorkouts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: spacing }}
        contentContainerStyle={{ paddingBottom: spacing }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <ImageBackground
              source={item.image}
              style={styles.image}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay}>
                <Text style={styles.text}>{item.name}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});