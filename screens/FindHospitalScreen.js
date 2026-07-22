import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function FindHospitalScreen({ onNavigate }) {
  const hospitals = [
    { id: '1', name: '37 Military Hospital', distance: '2.3 km away', address: 'Cantonments, Accra', phone: '024 123 4567', iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
    { id: '2', name: 'Ridge Hospital', distance: '3.1 km away', address: 'Ridge, Accra', phone: '020 876 5432', iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
    { id: '3', name: 'Korle Bu Teaching Hospital', distance: '4.7 km away', address: 'Korle Bu, Accra', phone: '030 261 5832', iconBg: '#FEF2F2', iconColor: '#DC2626', is247: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Hospital</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Filter Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput placeholder="Search hospitals..." placeholderTextColor="#9CA3AF" style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Placeholder Header Area */}
        <View style={styles.mapBox}>
          <Ionicons name="map-outline" size={32} color="#9CA3AF" />
          <Text style={styles.mapText}>Interactive map view</Text>
        </View>

        {/* Hospital Cards List */}
        <View style={styles.listContainer}>
          {hospitals.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.hospitalIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons name="local-hospital" size={24} color={item.iconColor} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.hospitalName}>{item.name}</Text>
                  <Text style={styles.distanceText}>{item.distance}</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                  <Text style={styles.phoneText}>{item.phone}</Text>
                  {item.is247 && <Text style={styles.badge247}>Open 24/7</Text>}
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionCircle}><Feather name="phone" size={18} color="#007A43" /></TouchableOpacity>
                <TouchableOpacity style={[styles.actionCircle, { marginTop: 12 }]}><Feather name="navigation" size={18} color="#111827" /></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 14 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: '#F3F4F6' },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filterButton: { width: 46, height: 46, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  mapBox: { height: 120, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  mapText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  cardLeft: { flexDirection: 'row', flex: 1 },
  hospitalIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  hospitalName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  distanceText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addressText: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  phoneText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badge247: { fontSize: 12, fontWeight: '700', color: '#007A43', marginTop: 6 },
  cardActions: { justifyContent: 'center' },
  actionCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
});
