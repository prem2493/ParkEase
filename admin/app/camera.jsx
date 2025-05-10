import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import { CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg'; // 👈 QR Code import

export default function CameraScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

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
      const response = await fetch(`http://192.168.0.158:5000/check-and-delete/${data}`);
      const result = await response.json();

      if (result.valid) {
        const entryTime = new Date(result.entrytime);
        const currentTime = new Date();
        const timeDiffHours = Math.max((currentTime - entryTime) / (1000 * 60 * 60), 0);
        const cost = Math.round(timeDiffHours * 10);
        setPaymentAmount(cost);

        setIsValid(true);
        setScannedData(`Please pay ₹${cost}, Thank you.`);
      } else {
        setIsValid(false);
        setScannedData("Invalid");
      }
    } catch (error) {
      console.error(error);
      setScannedData("Error connecting to server");
      setIsValid(false);
    }

    setLoading(false);
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  const upiID = "9390400193-2@ybl"; 
  const upiLink = `upi://pay?pa=${upiID}&pn=SmartParking&am=${paymentAmount}&cu=INR`;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />
      {scanned && (
        <View style={[styles.overlay, { backgroundColor: isValid ? 'green' : 'red' }]}>
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <>
              <Text style={styles.text}>{scannedData}</Text>
              {isValid && paymentAmount > 0 && (
                <View style={styles.qrWrapper}>
                  <QRCode value={upiLink} size={200} />
                  <Text style={{ color: 'white', marginTop: 10 }}>Scan to Pay</Text>
                </View>
              )}
              <Button title="Scan Again" onPress={() => setScanned(false)} />
              <Button title="Go Back" onPress={() => router.back()} />
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  qrWrapper: {
    marginVertical: 20,
    alignItems: 'center',
  },
});
