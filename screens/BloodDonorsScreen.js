import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function BloodDonorsScreen({ onNavigate }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const locations = ['Accra', 'Kumasi', 'Tamale', 'Takoradi'];
  const donors = [
    { id: '1', name: 'Esi A.', bloodGroup: 'O+', distance: '2.3 km away', location: 'Accra', status: 'Available', avatar: 'https://i.pravatar.cc/100?img=26', phone: '+233501234567' },
    { id: '2', name: 'Kofi B.', bloodGroup: 'A+', distance: '3.1 km away', location: 'Kumasi', status: 'Available', avatar: 'https://i.pravatar.cc/100?img=11', phone: '+233501234568' },
  ];
  const filteredDonors = donors.filter(donor => {
    const groupMatch = selectedGroup ? donor.bloodGroup === selectedGroup : true;
    const locationMatch = selectedLocation ? donor.location === selectedLocation : true;
    return groupMatch && locationMatch;
  });

  const callDonor = phone => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const handleSearch = () => {
    setSearchPerformed(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Donors</Text>
        <TouchableOpacity onPress={() => setFilterOpen(prev => !prev)}>
          <Feather name="filter" size={20} color={filterOpen ? '#007A43' : '#000'} />
        </TouchableOpacity>
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
        <View style={styles.groupOptions}>
          {bloodGroups.map(group => (
            <TouchableOpacity
              key={group}
              style={[
                styles.groupButton,
                selectedGroup === group && styles.groupButtonSelected,
              ]}
              onPress={() => setSelectedGroup(selectedGroup === group ? null : group)}
            >
              <Text
                style={[
                  styles.groupButtonText,
                  selectedGroup === group && styles.groupButtonTextSelected,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.selectedInfo}>
          {searchPerformed
            ? `${filteredDonors.length} donors found${selectedGroup ? ` for ${selectedGroup}` : ''}${selectedLocation ? ` in ${selectedLocation}` : ''}`
            : 'Select a blood group and location, then tap Search Donors.'}
        </Text>

        {filterOpen && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Filter Options</Text>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.filterRow}>
              {locations.map(location => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterTag,
                    selectedLocation === location && styles.filterTagSelected,
                  ]}
                  onPress={() => setSelectedLocation(location)}
                >
                  <Text
                    style={[
                      styles.groupButtonText,
                      selectedLocation === location && styles.groupButtonTextSelected,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedGroup(null);
                  setSelectedLocation(null);
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterOpen(false)}
              >
                <Text style={styles.searchButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.fieldLabel}>Location</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setLocationOpen(prev => !prev)}>
          <Text style={[styles.dropdownPlaceholder, selectedLocation ? styles.dropdownText : null]}>
            {selectedLocation || 'Select location'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {locationOpen && (
          <View style={styles.dropdownList}>
            {locations.map(location => (
              <TouchableOpacity
                key={location}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Donors</Text>
        </TouchableOpacity>

        {/* Nearby Donors Cards */}
        <Text style={styles.sectionTitle}>Nearby Donors</Text>
        {filteredDonors.map(donor => (
          <TouchableOpacity key={donor.id} style={styles.donorCard} onPress={() => onNavigate('BloodDonorProfile', { donor })}>
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
            <TouchableOpacity style={styles.callCircle} onPress={() => callDonor(donor.phone)}>
              <Feather name="phone" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
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
  groupOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  groupButton: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8, marginBottom: 8 },
  groupButtonSelected: { backgroundColor: '#DCFCE7', borderColor: '#007A43' },
  groupButtonText: { fontSize: 13, color: '#111827' },
  groupButtonTextSelected: { color: '#064E3B', fontWeight: '700' },
  selectedInfo: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  filterPanel: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  filterTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  filterTag: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8, marginBottom: 8 },
  filterTagSelected: { backgroundColor: '#DCFCE7', borderColor: '#007A43' },
  filterActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  clearButton: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginRight: 8, backgroundColor: '#FFFFFF' },
  clearButtonText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  applyButton: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007A43' },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 48, paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#FAFAFA' },
  dropdownPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  dropdownText: { color: '#111827' },
  dropdownList: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 14 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 14, color: '#111827' },
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
