import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { zipSync } from 'fflate';
import { decode as atob } from 'base-64';
import { registerFileToServer } from '../flaskServer';

const Capture = ({ username, onDone }) => {
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const [frames, setFrames] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();
  const CAPTURE_LIMIT = 50;
  const INTERVAL_MS = 200;

    useEffect(() => {
        if (!permission) 
            requestPermission();
    }, [permission]);

    useEffect(() => {
    if (!isCapturing) 
        return;

    let isActive = true;

    const captureFrames = async () => {
        setCapturedCount(0);
        setFrames([]);

        for (let i = 0; i < CAPTURE_LIMIT && isActive; i++) {
        try {
            if (!cameraRef.current) 
                throw new Error('Camera not available');

            const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

            if (!isActive) 
                break;

            setFrames(arr => [...arr, photo.uri]);
            setCapturedCount(i + 1);
            await new Promise(res => setTimeout(res, INTERVAL_MS));
        } catch (err) {
            console.error('Capture error:', err);
            Alert.alert('Error', err.message || 'Camera capture failed');
            break;
        }
        }

        if (isActive) {
        setIsCapturing(false);
        processAndUpload();
        }
    };

    captureFrames();

    return () => { isActive = false; };

    }, [isCapturing]);

const processAndUpload = async () => {
  try {
    const files = {};
    for (let i = 0; i < frames.length; i++) {
      const uri = frames[i];
      const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 224, height: 224 } }], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      files[`frame_${i + 1}.jpg`] = binary;
    }

    const zipped = zipSync(files);
    let binaryStr = '';
    for (let i = 0; i < zipped.length; i += 10000) {
      binaryStr += String.fromCharCode.apply(null, zipped.subarray(i, i + 10000));
    }

    const base64Zip = btoa(binaryStr);

    const zipPath = `${FileSystem.cacheDirectory}frames_${Date.now()}.zip`;

    await FileSystem.writeAsStringAsync(zipPath, base64Zip, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const response = await registerFileToServer(zipPath, username);

    if (response.success) {
      Alert.alert('Success', 'Frames uploaded successfully');
      await FileSystem.deleteAsync(zipPath, { idempotent: true });
      onDone && onDone();
    } else {
      Alert.alert('Upload failed', response.message || 'Unknown error');
      await FileSystem.deleteAsync(zipPath, { idempotent: true });
    }
  } catch (e) {
    console.error('Processing/upload error:', e);
    Alert.alert('Error', 'Failed to process and upload frames');
  }
};

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Camera permission not granted</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />
      <TouchableOpacity
        style={[styles.button, isCapturing && styles.buttonDisabled]}
        onPress={() => setIsCapturing(true)}
        disabled={isCapturing}
      >
        <Text style={styles.buttonText}>
          {isCapturing
            ? `Capturing ${Math.min(capturedCount, CAPTURE_LIMIT)}/${CAPTURE_LIMIT}`
            : 'Start Capture'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  button: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  buttonDisabled: { backgroundColor: '#555' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red' },
});

export default Capture;