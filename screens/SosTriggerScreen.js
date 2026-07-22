import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SosTriggerScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Emergency</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Pulsing Concentric Circles Radar Icon */}
        <View style={styles.radarOuter}>
          <View style={styles.radarMiddle}>
            <TouchableOpacity 
              style={styles.sosButton} 
              activeOpacity={0.8}
              onLongPress={() => onNavigate('LiveLocation')}
            >
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.instructions}>Tap and hold to send SOS</Text>
        <Text style={styles.subInstructions}>Your location will be shared with your emergency contacts</Text>

        {/* Location Info Card */}
        <View style={styles.locationCard}>
          <Ionicons name="location-outline" size={24} color="#111827" style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.locationTitle}>Your Location</Text>
            <Text style={styles.locationAddress}>East Legon, Accra{'\n'}Ghana</Text>
            <Text style={styles.accuracyText}>Accuracy: 10m</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => onNavigate('Home')}>
          <Text style={styles.cancelButtonText}>Cancel SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  radarOuter: { width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(220, 38, 38, 0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  radarMiddle: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(220, 38, 38, 0.15)', justifyContent: 'center', alignItems: 'center' },
  sosButton: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  sosButtonText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  instructions: { fontSize: 18, fontWeight: '800', color: '#DC2626', marginBottom: 8 },
  subInstructions: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, width: '100%', marginBottom: 30 },
  locationTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  locationAddress: { fontSize: 13, color: '#4B5563', marginVertical: 2 },
  accuracyText: { fontSize: 12, color: '#6B7280' },
  cancelButton: { width: '100%', backgroundColor: '#DC2626', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
