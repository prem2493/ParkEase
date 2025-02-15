import React from 'react';
import { Text, View, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { Link } from 'expo-router';
import backg from "@/assets/images/homeback.avif";

export default function Index() {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={backg}
        resizeMode='cover'
        style={styles.image}>
      </ImageBackground>
      <View style={styles.overlay}>
          <View style={styles.buttonContainer}>
            <Link href="/camera2" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Entry</Text>
              </Pressable>
            </Link>
            <Link href="/camera" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Exit</Text>
              </Pressable>
            </Link>
            <Link href="/complaints" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Check Complaints</Text>
              </Pressable>
            </Link>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 70,
    width: 200,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 19, 43, 0.34)',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute', 
    top: 1, 
  }
});
