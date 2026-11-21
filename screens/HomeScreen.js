import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import { getUser } from '../utils/authService';

export default function HomeScreen({ onNavigate }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const greetingName = user?.fullName?.split(' ')[0] || 'User';

  const callEmergencyService = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Welcome Bar */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {greetingName}! 👋</Text>
        <TouchableOpacity style={styles.bellButton} onPress={() => onNavigate('DisasterAlerts')}>
          <Feather name="bell" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Red SOS Emergency Card */}
        <TouchableOpacity 
          style={styles.sosCard}
          activeOpacity={0.9}
          onPress={() => onNavigate('SosTrigger')}
        >
          <View>
            <Text style={styles.sosCardTitle}>SOS Emergency</Text>
            <Text style={styles.sosCardSub}>Press and hold to prepare an SOS text</Text>
          </View>
          <View style={styles.sosCircle}>
            <Text style={styles.sosCircleText}>SOS</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('ReportIncident')}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <FontAwesome5 name="bullhorn" size={20} color="#EA580C" />
            </View>
            <Text style={styles.actionText}>Report{'\n'}Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('FindHospital')}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="local-hospital" size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionText}>Find Hospital</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('BloodDonors')}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <FontAwesome5 name="tint" size={20} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Blood Donors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('FindPharmacy')}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="medical" size={22} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Pharmacy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('MissingPersons')}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="search" size={20} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Missing Persons</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('DisasterAlerts')}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="warning-outline" size={22} color="#EA580C" />
            </View>
            <Text style={styles.actionText}>Disaster Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('Volunteer')}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <FontAwesome5 name="hands-helping" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.actionText}>Volunteer Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('LiveLocation')}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="navigate-circle" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>Live Sharing</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts List */}
        <View style={styles.contactHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={() => onNavigate('EmergencyContacts')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Police</Text>
              <Text style={styles.contactNumber}>191</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => callEmergencyService('191')}><Feather name="phone" size={18} color="#007A43" /></TouchableOpacity>
          </View>

          <View style={styles.contactRow}>
            <View style={[styles.contactIcon, { backgroundColor: '#FEF2F2' }]}>
              <FontAwesome5 name="ambulance" size={16} color="#DC2626" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Ambulance</Text>
              <Text style={styles.contactNumber}>193</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => callEmergencyService('193')}><Feather name="phone" size={18} color="#007A43" /></TouchableOpacity>
          </View>

          <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.contactIcon, { backgroundColor: '#FEF2F2' }]}>
              <FontAwesome5 name="fire-extinguisher" size={18} color="#DC2626" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Fire Service</Text>
              <Text style={styles.contactNumber}>192</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => callEmergencyService('192')}><Feather name="phone" size={18} color="#007A43" /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Home" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  sosCard: { backgroundColor: '#DC2626', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sosCardTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  sosCardSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  sosCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  sosCircleText: { color: '#DC2626', fontSize: 18, fontWeight: '900' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  actionCard: { width: '48%', backgroundColor: '#FAFAFA', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  seeAll: { color: '#007A43', fontSize: 14, fontWeight: '700' },
  contactCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', paddingHorizontal: 16, marginTop: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  contactIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  contactNumber: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  callButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
});
