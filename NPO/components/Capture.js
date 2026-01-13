import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { zipSync } from 'fflate';
import { decode as atob } from 'base-64';
import { registerFileToServer } from '../flaskServer';

export function DCT_RLE(rgba) {
    const W = 224;
    const H = 224;
    const BS = 8;

    const Q = new Int16Array([
        16,11,10,16,24,40,51,61,
        12,12,14,19,26,58,60,55,
        14,13,16,24,40,57,69,56,
        14,17,22,29,51,87,80,62,
        18,22,37,56,68,109,103,77,
        24,35,55,64,81,104,113,92,
        49,64,78,87,103,121,120,101,
        72,92,95,98,112,100,103,99
    ]);

    const COS = new Float32Array(64);
    for (let u = 0; u < 8; u++)
        for (let x = 0; x < 8; x++)
            COS[u * 8 + x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);

    const C = new Float32Array([0.70710678,1,1,1,1,1,1,1]);

    const tmp = new Float32Array(64);
    const block = new Float32Array(64);
    const dctOut = new Int16Array((W >> 3) * (H >> 3) * 64);

    let dctIdx = 0;

    for (let by = 0; by < H; by += BS) {
        for (let bx = 0; bx < W; bx += BS) {
            let k = 0;

            for (let y = 0; y < 8; y++) {
                let p = ((by + y) * W + bx) * 4;
                for (let x = 0; x < 8; x++) {
                    block[k++] = (0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2]) - 128;
                    p += 4;
                }
            }

        for (let y = 0; y < 8; y++) {
            const row = y * 8;
            for (let u = 0; u < 8; u++) {
                let sum = 0;
                const c = COS.subarray(u * 8, u * 8 + 8);

                for (let x = 0; x < 8; x++) 
                    sum += block[row + x] * c[x];

                tmp[row + u] = 0.5 * C[u] * sum;
            }
        }

        for (let u = 0; u < 8; u++) {
            for (let v = 0; v < 8; v++) {
                let sum = 0;
                const c = COS.subarray(v * 8, v * 8 + 8);

                for (let y = 0; y < 8; y++) 
                    sum += tmp[y * 8 + u] * c[y];

                dctOut[dctIdx++] = (0.5 * C[v] * sum / Q[u * 8 + v]) | 0;
            }
        }
        }
    }

    const rle = [];
    let prev = dctOut[0];
    let count = 1;

    for (let i = 1; i < dctOut.length; i++) {
        const v = dctOut[i];
        if (v === prev && count < 32767) {
            count++;
        } else {
            rle.push(count, prev);
            prev = v;
            count = 1;
        }
    }
    rle.push(count, prev);

    return Int16Array.from(rle);
}

const Capture = ({ username, onDone }) => {
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
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
    const capturedUris = []; 

    const captureFrames = async () => {
      setCapturedCount(0);

      for (let i = 0; i < CAPTURE_LIMIT && isActive; i++) {
        try {
          if (!cameraRef.current)
            throw new Error('Camera not available');

          const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

          if (!isActive)
            break;

          capturedUris.push(photo.uri);
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
        processAndUpload(capturedUris);
      }
    };

    captureFrames();

    return () => { isActive = false; };

  }, [isCapturing]);

  const processAndUpload = async (framesToProcess) => {
    try {
      console.log('Captured frames:', framesToProcess); 

      const files = {};
      for (let i = 0; i < framesToProcess.length; i++) {
        const uri = framesToProcess[i];
        const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 224, height: 224 } }], {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        });

        const base64 = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const rgba = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const dctRle = DCT_RLE(rgba);
        files[`frame_${i + 1}.dctrle`] = new Uint8Array(dctRle.buffer);
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

      if (response) {
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});


export default Capture;