import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';

const MOCK_PHARMACIES = [
  {
    id: 'p1',
    name: 'Top Up Pharmacy (24 Hours)',
    district: 'East Legon, Accra',
    address: 'Bawaleshie Rd, Accra',
    phone: '+233302520111',
    displayPhone: '+233 30 252 0111',
    is24Hours: true,
    isOpenNow: true,
    distance: '1.2 km',
    rating: 4.8,
    emergencyMedsAvailable: true,
  },
  {
    id: 'p2',
    name: 'Ernest Chemist Ltd',
    district: 'Osu, Accra',
    address: 'Oxford Street, Osu, Accra',
    phone: '+233302775831',
    displayPhone: '+233 30 277 5831',
    is24Hours: false,
    isOpenNow: true,
    openingHours: '7:30 AM - 10:00 PM',
    distance: '3.5 km',
    rating: 4.6,
    emergencyMedsAvailable: true,
  },
  {
    id: 'p3',
    name: 'Ridge Emergency Pharmacy',
    district: 'Ridge, Accra',
    address: 'Castle Road, Ridge',
    phone: '+233302228382',
    displayPhone: '+233 30 222 8382',
    is24Hours: true,
    isOpenNow: true,
    distance: '2.4 km',
    rating: 4.9,
    emergencyMedsAvailable: true,
  },
  {
    id: 'p4',
    name: 'Unichem Pharmacy',
    district: 'Spintex, Accra',
    address: 'Spintex Road, Accra',
    phone: '+233302813300',
    displayPhone: '+233 30 281 3300',
    is24Hours: true,
    isOpenNow: true,
    distance: '5.1 km',
    rating: 4.7,
    emergencyMedsAvailable: true,
  },
  {
    id: 'p5',
    name: 'M&G Pharmaceuticals',
    district: 'Adabraka, Accra',
    address: 'Graphic Road, Accra',
    phone: '+233302221888',
    displayPhone: '+233 30 222 1888',
    is24Hours: false,
    isOpenNow: true,
    openingHours: '8:00 AM - 8:00 PM',
    distance: '4.8 km',
    rating: 4.5,
    emergencyMedsAvailable: false,
  },
];

export default function FindPharmacyScreen({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, 24HOURS, EMERGENCY
  const [pharmacies, setPharmacies] = useState(MOCK_PHARMACIES);
  const [loading, setLoading] = useState(false);

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === '24HOURS') return pharmacy.is24Hours;
    if (activeFilter === 'EMERGENCY') return pharmacy.emergencyMedsAvailable;
    return true;
  });

  const renderPharmacyItem = ({ item }) => (
    <View style={styles.pharmacyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={24} color="#16A34A" />
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.pharmacyName}>{item.name}</Text>
          <Text style={styles.districtText}>
            <Ionicons name="location-outline" size={13} color="#6B7280" /> {item.district}
          </Text>
        </View>

        {item.is24Hours ? (
          <View style={styles.badge24}>
            <Text style={styles.badge24Text}>24/7</Text>
          </View>
        ) : (
          <View style={styles.badgeOpen}>
            <Text style={styles.badgeOpenText}>OPEN</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressText}>{item.address}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailBadge}>
          <Feather name="navigation" size={12} color="#007A43" />
          <Text style={styles.detailBadgeText}>{item.distance}</Text>
        </View>

        <View style={styles.detailBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.detailBadgeText}>{item.rating}</Text>
        </View>

        {item.emergencyMedsAvailable && (
          <View style={[styles.detailBadge, { backgroundColor: '#FEF2F2' }]}>
            <FontAwesome5 name="pills" size={11} color="#DC2626" />
            <Text style={[styles.detailBadgeText, { color: '#DC2626' }]}>Emergency Meds</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.phone)}>
          <Feather name="phone-call" size={16} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Call ({item.displayPhone})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Finder</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by pharmacy name or area..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
            All Pharmacies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === '24HOURS' && styles.filterChipActive]}
          onPress={() => setActiveFilter('24HOURS')}
        >
          <Text style={[styles.filterChipText, activeFilter === '24HOURS' && styles.filterChipTextActive]}>
            🌙 24/7 Open
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'EMERGENCY' && styles.filterChipActive]}
          onPress={() => setActiveFilter('EMERGENCY')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'EMERGENCY' && styles.filterChipTextActive]}>
            💊 Emergency Stock
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Content */}
      <FlatList
        data={filteredPharmacies}
        keyExtractor={(item) => item.id}
        renderItem={renderPharmacyItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-pharmacy" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Pharmacies Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search filter or location search.</Text>
          </View>
        }
      />

      <BottomTabBar activeTab="Home" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchSection: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#007A43' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 24 },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justify: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleArea: { flex: 1 },
  pharmacyName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  districtText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge24: { backgroundColor: '#DC2626', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badge24Text: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  badgeOpen: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeOpenText: { color: '#15803D', fontSize: 11, fontWeight: '800' },
  addressText: { fontSize: 13, color: '#4B5563', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  detailBadgeText: { fontSize: 12, fontWeight: '600', color: '#374151', marginLeft: 4 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  callBtn: {
    backgroundColor: '#007A43',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 4, textAlign: 'center' },
});
