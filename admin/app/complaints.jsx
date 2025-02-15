import React from 'react';
import { View, Text, Button, FlatList, StyleSheet ,ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import backg from "@/assets/images/homeback.avif";

const complaints = ["Delayed service", "Poor maintenance", "Billing issue"]; // Example complaints

export default function ComplaintsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <ImageBackground 
                source={backg}
                resizeMode='cover'
                style={styles.image}>
        </ImageBackground>
      <Text style={styles.title}>Complaints</Text>
      {complaints.length > 0 ? (
        <FlatList
          data={complaints}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
        />
      ) : (
        <Text style={styles.empty}>Empty</Text>
      )}
      <Button title="Go Back" onPress={() => router.back()} />
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    // color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    // color: 'white',
    fontSize: 28,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  empty: {
    fontSize: 18,
    color: 'gray',
  },
  image: {
    width: '120%',
    height: '120%',
    position: 'absolute', 
    top: 1, 
  }
});

