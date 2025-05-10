import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import { CameraView } from 'expo-camera';

export default function CameraScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);

    try {
      const response = await fetch(`http://192.168.0.158:5000/check-id/${data}`);
      const result = await response.json();

      if (result.valid) {
        setIsValid(true);
        setScannedData(`Entry Time: ${result.entrytime}`);
      } else {
        setIsValid(false);
        setScannedData("Invalid ID");
      }
    } catch (error) {
      console.error(error);
      setScannedData("Error connecting to server");
      setIsValid(false);
    }

    setLoading(false);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={[styles.overlay, { backgroundColor: isValid ? 'green' : 'red' }]}>
          {loading ? <ActivityIndicator size="large" color="white" /> : <Text style={styles.text}>{scannedData}</Text>}
          <Button title="Scan Again" onPress={() => setScanned(false)} />
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
});

