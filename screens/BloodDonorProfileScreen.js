import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function BloodDonorProfileScreen({ onNavigate, onGoBack, routeParams }) {
  const donor = routeParams?.donor || {
    name: 'Unknown Donor',
    bloodGroup: 'O+',
    distance: 'N/A',
    status: 'Available',
    avatar: 'https://i.pravatar.cc/100?img=26',
    age: 28,
    location: 'Accra, Ghana',
    lastDonation: '3 months ago',
    phone: '+233501234567',
    email: 'donor@example.com',
    notes: 'Healthy and ready to donate. Prefers morning appointments.',
  };

  const callDonor = () => {
    const url = `tel:${donor.phone}`;
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  };

  const messageDonor = () => {
    const url = `sms:${donor.phone}`;
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (onGoBack) return onGoBack();
            return onNavigate && onNavigate('BloodDonors');
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#007A43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donor Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: donor.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{donor.name}</Text>
          <Text style={styles.details}>{donor.bloodGroup} • {donor.age} yrs</Text>
          <Text style={styles.details}>{donor.location}</Text>
          <Text style={[styles.status, donor.status === 'Available' ? styles.available : styles.unavailable]}>{donor.status}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{donor.distance}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last donation</Text>
          <Text style={styles.statValue}>{donor.lastDonation}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.sectionText}>Phone: {donor.phone}</Text>
        <Text style={styles.sectionText}>Email: {donor.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.sectionText}>{donor.notes}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={callDonor}>
          <Feather name="phone" size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={messageDonor}>
          <Feather name="message-circle" size={18} color="#007A43" />
          <Text style={[styles.actionText, styles.messageText]}>Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 6, marginRight: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 18, margin: 16, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  details: { fontSize: 14, color: '#4B5563', marginTop: 4 },
  status: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  available: { color: '#166534', backgroundColor: '#DCFCE7' },
  unavailable: { color: '#B91C1C', backgroundColor: '#FECACA' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  statItem: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginRight: 10 },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F766E', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007A43', borderRadius: 12, paddingVertical: 14, marginRight: 10 },
  actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  messageButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#007A43' },
  messageText: { color: '#007A43' },
});
