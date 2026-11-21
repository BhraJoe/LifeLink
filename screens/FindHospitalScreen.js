import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, StatusBar, Linking, Platform, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import HospitalMap from '../components/HospitalMap';
import { searchHospitals } from '../utils/authService';

const HOSPITALS = [
  { id: '1', name: '37 Military Hospital', address: 'Cantonments, Accra', phone: '+233302776090', displayPhone: '030 277 6090', latitude: 5.5840, longitude: -0.1738, iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
  { id: '2', name: 'Ridge Hospital', address: 'Ridge, Accra', phone: '+233302228382', displayPhone: '030 222 8382', latitude: 5.5579, longitude: -0.1962, iconBg: '#EFF6FF', iconColor: '#2563EB', is247: true },
  { id: '3', name: 'Korle Bu Teaching Hospital', address: 'Korle Bu, Accra', phone: '+233302664014', displayPhone: '030 266 4014', latitude: 5.5369, longitude: -0.2352, iconBg: '#FEF2F2', iconColor: '#DC2626', is247: true },
];
const DISTANCE_OPTIONS = [
  { label: 'Any distance', value: null },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
];

export default function FindHospitalScreen({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [hospitals, setHospitals] = useState(HOSPITALS);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [maxDistance, setMaxDistance] = useState(null);
  const [open247Only, setOpen247Only] = useState(false);
  const lastSearchRequest = useRef(0);
  const submitSearch = () => {
    setSubmittedQuery(searchQuery.trim());
    setSearchAttempt((attempt) => attempt + 1);
  };
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

  useEffect(() => {
    const query = submittedQuery.trim();
    if (query.length < 2) {
      setHospitals(HOSPITALS);
      setSelectedHospital(null);
      setSearchLoading(false);
      setSearchError(null);
      return undefined;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(null);
    const delay = Math.max(0, 1200 - (Date.now() - lastSearchRequest.current));
    const timeout = setTimeout(async () => {
      try {
        lastSearchRequest.current = Date.now();
        const results = await searchHospitals(query, { signal: controller.signal });
        const matches = (Array.isArray(results) ? results : [])
          .filter((result) => {
            const healthcare = result.extratags?.healthcare?.split(';') || [];
            return result.type === 'hospital' || healthcare.includes('hospital');
          })
          .map((result) => {
            const latitude = Number(result.lat);
            const longitude = Number(result.lon);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

            const phone = result.extratags?.['contact:phone'] || result.extratags?.phone || null;
            const openingHours = result.extratags?.opening_hours || '';
            return {
              id: `${result.osm_type}-${result.osm_id}`,
              name: result.name || result.display_name || 'Hospital',
              address: result.display_name || result.address?.city || '',
              phone,
              displayPhone: phone,
              latitude,
              longitude,
              iconBg: '#EFF6FF',
              iconColor: '#2563EB',
              is247: /24\s*\/\s*7|24\s*hours/i.test(openingHours),
            };
          })
          .filter(Boolean);

        setHospitals(matches);
        setSelectedHospital(matches[0] || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Hospital search error:', error);
          setSearchError(error.message || 'Could not search hospitals. Check your connection and try again.');
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [submittedQuery, searchAttempt]);

  const filteredHospitals = useMemo(() => hospitals.filter((hospital) => {
    if (open247Only && !hospital.is247) return false;
    if (maxDistance != null && userLocation) {
      const distance = getDistance(hospital.latitude, hospital.longitude);
      if (distance == null || distance > maxDistance) return false;
    }
    return true;
  }), [hospitals, maxDistance, open247Only, userLocation]);

  const hasActiveFilter = maxDistance != null || open247Only;

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
          <TouchableOpacity
            onPress={submitSearch}
            accessibilityRole="button"
            accessibilityLabel="Search hospitals"
          >
            <Feather name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            placeholder="Search any hospital or area..."
            placeholderTextColor="#9CA3AF"
            maxLength={120}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSubmittedQuery('');
            }}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Filter hospitals"
        >
          <Feather name="sliders" size={18} color={hasActiveFilter ? '#FFFFFF' : '#111827'} />
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
          hospitals={filteredHospitals}
          userLocation={userLocation}
          selectedHospital={filteredHospitals.some((hospital) => hospital.id === selectedHospital?.id)
            ? selectedHospital
            : null}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hospital Cards List */}
        <View style={styles.listContainer}>
          {searchLoading && (
            <View style={styles.searchStatus}>
              <ActivityIndicator size="small" color="#007A43" />
              <Text style={styles.searchStatusText}>Searching hospitals...</Text>
            </View>
          )}
          {searchError && <Text style={styles.searchError}>{searchError}</Text>}
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
                  <Text style={styles.phoneText}>{item.displayPhone || 'Phone not listed'}</Text>
                  {item.is247 && <Text style={styles.badge247}>Open 24/7</Text>}
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionCircle, !item.phone && styles.disabledAction]}
                  onPress={() => item.phone && openCall(item.phone)}
                  disabled={!item.phone}
                  accessibilityLabel={item.phone ? `Call ${item.name}` : 'Phone number not listed'}
                >
                  <Feather name="phone" size={18} color={item.phone ? '#007A43' : '#9CA3AF'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCircle, { marginTop: 12 }]} onPress={() => openDirections(item)}>
                  <Feather name="navigation" size={18} color="#111827" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            );
          })}
          {!searchLoading && filteredHospitals.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-hospital" size={36} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No hospitals found</Text>
              <Text style={styles.emptyText}>
                {submittedQuery.trim().length < 2
                  ? 'Try a different filter.'
                  : 'Try another hospital name or city.'}
              </Text>
            </View>
          )}
          <Text style={styles.attribution}>Hospital search data © OpenStreetMap contributors</Text>
        </View>
      </ScrollView>

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter hospitals</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)} accessibilityLabel="Close filters">
                <Feather name="x" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterLabel}>Distance from you</Text>
            {!userLocation && (
              <Text style={styles.locationHint}>Allow location access to filter by distance.</Text>
            )}
            <View style={styles.filterOptions}>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.filterChip,
                    maxDistance === option.value && styles.filterChipSelected,
                    option.value != null && !userLocation && styles.filterChipDisabled,
                  ]}
                  disabled={option.value != null && !userLocation}
                  onPress={() => setMaxDistance(option.value)}
                >
                  <Text style={[
                    styles.filterChipText,
                    maxDistance === option.value && styles.filterChipTextSelected,
                  ]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.open247Option}
              onPress={() => setOpen247Only((current) => !current)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: open247Only }}
            >
              <View style={[styles.checkbox, open247Only && styles.checkboxSelected]}>
                {open247Only && <Feather name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.open247Text}>Only show hospitals listed as open 24/7</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.doneButtonText}>Show {filteredHospitals.length} hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => {
                setMaxDistance(null);
                setOpen247Only(false);
              }}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterButtonActive: { backgroundColor: '#007A43', borderColor: '#007A43' },
  mapBox: { height: 220, backgroundColor: '#E5E7EB', position: 'relative', overflow: 'hidden' },
  mapLoading: { position: 'absolute', zIndex: 20, top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, elevation: 3 },
  mapText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  selectedCard: { borderColor: '#007A43', backgroundColor: '#F8FFFB' },
  cardLeft: { flexDirection: 'row', flex: 1 },
  hospitalIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  disabledAction: { backgroundColor: '#F3F4F6' },
  hospitalName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  distanceText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addressText: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  phoneText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badge247: { fontSize: 12, fontWeight: '700', color: '#007A43', marginTop: 6 },
  cardActions: { justifyContent: 'center' },
  actionCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  searchStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  searchStatusText: { marginLeft: 8, color: '#6B7280', fontSize: 13 },
  searchError: { color: '#B91C1C', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginTop: 8 },
  emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  attribution: { color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17, 24, 39, 0.4)' },
  filterSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  locationHint: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  filterChipSelected: { backgroundColor: '#007A43' },
  filterChipDisabled: { opacity: 0.45 },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterChipTextSelected: { color: '#FFFFFF' },
  open247Option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 14 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxSelected: { backgroundColor: '#007A43', borderColor: '#007A43' },
  open247Text: { flex: 1, color: '#374151', fontSize: 13 },
  doneButton: { backgroundColor: '#007A43', paddingVertical: 13, borderRadius: 11, alignItems: 'center' },
  doneButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  clearFilters: { alignItems: 'center', paddingVertical: 12 },
  clearFiltersText: { color: '#007A43', fontSize: 13, fontWeight: '600' },
});
