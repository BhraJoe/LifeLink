import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ onNavigate, onGoBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (onGoBack) return onGoBack();
            return onNavigate && onNavigate('Profile');
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#007A43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About LinkLife</Text>

        <Text style={styles.tagline}>Community-powered emergency assistance and connection.</Text>

        <Text style={styles.sectionTitle}>What it does</Text>
        <Text style={styles.paragraph}>
          LinkLife lets users report incidents, trigger SOS with live location, find nearby hospitals and pharmacies, contact volunteers, and receive disaster alerts.
        </Text>

        <Text style={styles.sectionTitle}>Key features</Text>
        <Text style={styles.paragraph}>
          Incident reporting, SOS trigger, live location sharing with chosen contacts, searchable hospitals/pharmacies, emergency contacts, volunteer coordination, blood donor listings, and push alerts.
        </Text>

        <Text style={styles.sectionTitle}>Privacy & safety</Text>
        <Text style={styles.paragraph}>
          Location and personal data are shared only with contacts or responders you choose and used solely to assist during emergencies.
        </Text>

        <Text style={styles.sectionTitle}>Support</Text>
        <Text style={styles.paragraph}>
          Use the in-app Contact/Support option for help or feedback.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.paragraph}>
          LinkLife exists to connect communities, first responders, and volunteers to reduce
          response times and improve outcomes during emergencies through simple, reliable tools.
        </Text>

        <Text style={styles.sectionTitle}>Team</Text>
        <View style={styles.teamList}>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>Jane Doe</Text>
            <Text style={styles.memberRole}>Founder & Product</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>John Smith</Text>
            <Text style={styles.memberRole}>Engineering Lead</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>Aisha Khan</Text>
            <Text style={styles.memberRole}>Community & Partnerships</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <Text style={styles.paragraph}>
          We collect only the data necessary to provide emergency services (location, contact
          details, and reports). Data is shared only with contacts and responders you authorize.
          For full details, see the Privacy section and policies on our Help Center.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.paragraph}>Support: support@linklife.example</Text>
        <Text style={styles.paragraph}>Website: https://linklife.example</Text>

        <Text style={styles.sectionTitle}>Credits</Text>
        <Text style={styles.paragraph}>
          Built with React Native and Expo. Icons by @expo/vector-icons. Many thanks to our
          volunteer contributors and the open-source community.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backButton: { padding: 6, marginRight: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#007A43', marginBottom: 12 },
  tagline: { fontSize: 15, fontWeight: '600', marginBottom: 14, color: '#111827' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#0F766E' },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
