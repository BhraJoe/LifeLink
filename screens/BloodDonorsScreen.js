import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function BloodDonorsScreen({ onNavigate }) {
  const donors = [
    { id: '1', name: 'Esi A.', bloodGroup: 'O+', distance: '2.3 km away', status: 'Available', avatar: 'https://i.pravatar.cc/100?img=26' },
    { id: '2', name: 'Kofi B.', bloodGroup: 'A+', distance: '3.1 km away', status: 'Available', avatar: 'https://i.pravatar.cc/100?img=11' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Donors</Text>
        <TouchableOpacity><Feather name="filter" size={20} color="#000" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View style={styles.dropCircle}>
              <Ionicons name="water" size={24} color="#DC2626" />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Donate Blood</Text>
              <Text style={styles.bannerSub}>Save a life today.</Text>
            </View>
          </View>
        </View>

        {/* Find Donors Form Section */}
        <Text style={styles.sectionTitle}>Find Donors</Text>
        
        <Text style={styles.fieldLabel}>Blood Group</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownPlaceholder}>Select blood group</Text>
          <Feather name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Location</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownPlaceholder}>Select location</Text>
          <Ionicons name="location-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search Donors</Text>
        </TouchableOpacity>

        {/* Nearby Donors Cards */}
        <Text style={styles.sectionTitle}>Nearby Donors</Text>
        {donors.map(donor => (
          <View key={donor.id} style={styles.donorCard}>
            <Image source={{ uri: donor.avatar }} style={styles.avatar} />
            <View style={styles.donorInfo}>
              <Text style={styles.donorName}>{donor.name}</Text>
              <View style={styles.groupRow}>
                <Ionicons name="water" size={14} color="#DC2626" />
                <Text style={styles.groupText}>{donor.bloodGroup}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.distance}>{donor.distance}</Text>
              </View>
              <Text style={styles.statusText}>{donor.status}</Text>
            </View>
            <TouchableOpacity style={styles.callCircle}>
              <Feather name="phone" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  banner: { backgroundColor: '#007A43', borderRadius: 14, padding: 18, marginVertical: 16 },
  bannerLeft: { flexDirection: 'row', alignItems: 'center' },
  dropCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 48, paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#FAFAFA' },
  dropdownPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  searchButton: { backgroundColor: '#007A43', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 6, marginBottom: 20 },
  searchButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  donorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', padding: 14, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  donorInfo: { flex: 1 },
  donorName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  groupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  groupText: { fontSize: 13, fontWeight: '700', color: '#DC2626', marginLeft: 2 },
  dot: { marginHorizontal: 6, color: '#9CA3AF' },
  distance: { fontSize: 12, color: '#6B7280' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#16A34A', marginTop: 4 },
  callCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007A43', justifyContent: 'center', alignItems: 'center' },
});
