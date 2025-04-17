import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://192.168.1.16:5000/get-complaints')
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Complaints</Text>
      <ScrollView style={styles.list}>
        {loading ? <ActivityIndicator size="large" color="blue" /> :
          complaints.length > 0 ? complaints.map((complaint, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.userName}>{complaint.username}</Text>
              <Text style={styles.complaint}>{complaint.complaint}</Text>
              <Text style={styles.timestamp}>
                {new String(complaint.id)}
              </Text>

            </View>
          )) : <Text style={styles.empty}>No complaints found.</Text>
        }
      </ScrollView>
      <Text style={styles.backButton} onPress={() => router.back()}>🔙 Back</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  list: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 5, elevation: 3 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  message: { fontSize: 14, marginTop: 5 },
  timestamp: { fontSize: 12, color: 'gray', marginTop: 5 },
  empty: { textAlign: 'center', fontSize: 16, color: 'gray' },
  backButton: { textAlign: 'center', color: 'blue', fontSize: 18, marginTop: 20 },
});
