import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, StatusBar, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import HospitalMap from '../components/HospitalMap';

const HOSPITALS = [
  { id: '1', name: '37 Military Hospital', address: 'Cantonments, Accra', phone: '+233302776090', displayPhone: '030 277 6090', latitude: 5.5840, longitude: -0.1738, iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
  { id: '2', name: 'Ridge Hospital', address: 'Ridge, Accra', phone: '+233302228382', displayPhone: '030 222 8382', latitude: 5.5579, longitude: -0.1962, iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
  { id: '3', name: 'Korle Bu Teaching Hospital', address: 'Korle Bu, Accra', phone: '+233302664014', displayPhone: '030 266 4014', latitude: 5.5369, longitude: -0.2352, iconBg: '#FEF2F2', iconColor: '#DC2626', is247: true },
];

export default function FindHospitalScreen({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const getDistance = (latitude, longitude) => {
    if (!userLocation) return null;
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const earthRadiusKm = 6371;
    const dLat = toRadians(latitude - userLocation.latitude);
    const dLon = toRadians(longitude - userLocation.longitude);
    const lat1 = toRadians(userLocation.latitude);
    const lat2 = toRadians(latitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    let active = true;
    const loadLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (active) {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      } catch (error) {
        console.error('FindHospital location error:', error);
      } finally {
        if (active) setLocationLoading(false);
      }
    };
    loadLocation();
    return () => {
      active = false;
    };
  }, []);

  const filteredHospitals = HOSPITALS.filter((hospital) => {
    const query = searchQuery.trim().toLowerCase();
    return !query ||
      hospital.name.toLowerCase().includes(query) ||
      hospital.address.toLowerCase().includes(query);
  });

  const openDirections = (hospital) => {
    const destination = `${hospital.latitude},${hospital.longitude}`;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url).catch((error) => console.error('Directions error:', error));
  };

  const openCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch((error) => console.error('Call error:', error));
  };

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
          <TextInput
            placeholder="Search hospitals..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapBox}>
        {locationLoading ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="small" color="#007A43" />
            <Text style={styles.mapText}>Finding your location...</Text>
          </View>
        ) : null}
        <HospitalMap
          hospitals={HOSPITALS}
          userLocation={userLocation}
          selectedHospital={selectedHospital}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hospital Cards List */}
        <View style={styles.listContainer}>
          {filteredHospitals.map(item => {
            const distance = getDistance(item.latitude, item.longitude);
            return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, selectedHospital?.id === item.id && styles.selectedCard]}
              onPress={() => setSelectedHospital(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.hospitalIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons name="local-hospital" size={24} color={item.iconColor} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.hospitalName}>{item.name}</Text>
                  <Text style={styles.distanceText}>
                    {distance != null ? `${distance.toFixed(1)} km away` : 'Distance available with location'}
                  </Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                  <Text style={styles.phoneText}>{item.displayPhone}</Text>
                  {item.is247 && <Text style={styles.badge247}>Open 24/7</Text>}
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionCircle} onPress={() => openCall(item.phone)}>
                  <Feather name="phone" size={18} color="#007A43" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCircle, { marginTop: 12 }]} onPress={() => openDirections(item)}>
                  <Feather name="navigation" size={18} color="#111827" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            );
          })}
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
  mapBox: { height: 220, backgroundColor: '#E5E7EB', position: 'relative', overflow: 'hidden' },
  realMap: { width: '100%', height: '100%', backgroundColor: '#E5E7EB' },
  mapLoading: { position: 'absolute', zIndex: 20, top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, elevation: 3 },
  mapText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  selectedCard: { borderColor: '#007A43', backgroundColor: '#F8FFFB' },
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
