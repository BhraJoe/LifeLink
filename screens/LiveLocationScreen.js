import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function LiveLocationScreen({ navigation }) {
  const contacts = [
    { id: '1', name: 'Ama', image: 'https://i.pravatar.cc/100?img=32' },
    { id: '2', name: 'Kwaku', image: 'https://i.pravatar.cc/100?img=12' },
    { id: '3', name: 'Mama', image: 'https://i.pravatar.cc/100?img=47' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Simulated Map Container */}
      <View style={styles.mapView}>
        {/* Banner Overlay */}
        <View style={styles.statusBanner}>
          <View style={styles.statusLeft}>
            <View style={styles.radarIconBox}>
              <Ionicons name="radio" size={20} color="#007A43" />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Sharing live location</Text>
              <Text style={styles.timerText}>00:25:30</Text>
            </View>
          </View>
          <TouchableOpacity><Text style={styles.stopText}>Stop</Text></TouchableOpacity>
        </View>

        {/* Map Visual Elements Placeholder */}
        <View style={styles.mapOverlayCenter}>
          <View style={styles.pulseOuter}>
            <View style={styles.pulseDot} />
          </View>
        </View>
      </View>

      {/* Bottom Panel: Shared Contacts */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Sharing with</Text>
        <View style={styles.avatarRow}>
          {contacts.map(person => (
            <View key={person.id} style={styles.avatarItem}>
              <Image source={{ uri: person.image }} style={styles.avatar} />
              <Text style={styles.avatarName}>{person.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreButton}>
            <Feather name="plus" size={24} color="#6B7280" />
            <Text style={styles.addText}>Add More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  mapView: { flex: 1, backgroundColor: '#E5E7EB', position: 'relative' },
  statusBanner: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  radarIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  timerText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  stopText: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  mapOverlayCenter: { position: 'absolute', top: '40%', left: '42%' },
  pulseOuter: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(22, 163, 74, 0.2)', justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#16A34A' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarItem: { alignItems: 'center', marginRight: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginBottom: 6 },
  avatarName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  addMoreButton: { alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
