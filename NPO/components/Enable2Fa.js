import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../api/api';
import Capture from './Capture';


export const Window2FA = ({ user, onClose, onUserUpdate}) => { 
  const [showCapture, setShowCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    showAlert();
  }, []);

  async function onSubmit() {
    try {
      console.log("Updating user ID:", user._id);
      await api.put(`/users/${user._id}`, {
        user_on_site: 0,
      });
      const updatedUser = { ...user, user_on_site: 0 };
      await AsyncStorage.setItem('token', JSON.stringify(updatedUser)); 
      onUserUpdate(updatedUser);

    } catch (err) {
      console.error("Error", err);

    }
  }

  const showAlert = () => {
    Alert.alert(
      'Enable 2FA',
      "Enable 2FA for more security",
      [{
          text: 'Deny',
          style: 'cancel',
          onPress: () => onClose(),
        },{
          text: 'Approve',
          onPress: () => {
            setShowCapture(true);
          }},
      ],
      { cancelable: false }
    );
  };

  if (showCapture) {
    return (
      <View style={styles.fullScreen}>
        <Capture username={user.username} onDone={()=> {
            Alert.alert('Done', 'Face registration complete');
            onClose();
            onSubmit(); 
        }}/>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'black',
  },
});