import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ onNavigate, onGoBack }) {
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = ['English', 'Español', 'Français', 'Deutsch'];

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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>App Settings</Text>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push alerts</Text>
          <Switch
            value={pushAlertsEnabled}
            onValueChange={setPushAlertsEnabled}
            thumbColor={pushAlertsEnabled ? '#007A43' : '#f4f3f4'}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email updates</Text>
          <Switch
            value={emailUpdatesEnabled}
            onValueChange={setEmailUpdatesEnabled}
            thumbColor={emailUpdatesEnabled ? '#007A43' : '#f4f3f4'}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Location sharing</Text>
          <Switch
            value={locationSharingEnabled}
            onValueChange={setLocationSharingEnabled}
            thumbColor={locationSharingEnabled ? '#007A43' : '#f4f3f4'}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
          />
        </View>
        <Text style={styles.helpText}>
          When location sharing is enabled, emergency responders and selected contacts can see your live location during an SOS.
        </Text>

        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageList}>
          {languages.map(language => (
            <TouchableOpacity
              key={language}
              style={[
                styles.languageOption,
                selectedLanguage === language && styles.languageOptionSelected,
              ]}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLanguage === language && styles.languageTextSelected,
                ]}
              >
                {language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onNavigate && onNavigate('EditProfile')}
        >
          <Text style={styles.actionButtonText}>Edit profile details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonOutline]}
          onPress={() => onNavigate && onNavigate('Help')}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonOutlineText]}>Open help & support</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>About this app</Text>
        <Text style={styles.paragraph}>
          LinkLife helps you stay connected during emergencies with fast SOS alerts, live location sharing, hospital and pharmacy lookup, and community support.
        </Text>

        <Text style={styles.sectionTitle}>Tips</Text>
        <Text style={styles.bullet}>• Keep notifications enabled so you receive urgent alerts.</Text>
        <Text style={styles.bullet}>• Use the SOS feature only for real emergencies.</Text>
        <Text style={styles.bullet}>• Review your emergency contacts regularly.</Text>
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
  title: { fontSize: 22, fontWeight: '800', color: '#007A43', marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F766E', marginTop: 18, marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  settingLabel: { fontSize: 15, color: '#111827', maxWidth: '80%' },
  helpText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginTop: 8 },
  actionButton: { backgroundColor: '#007A43', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 10, marginBottom: 12 },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  actionButtonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#007A43' },
  actionButtonOutlineText: { color: '#007A43' },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 20 },
  bullet: { fontSize: 14, color: '#374151', lineHeight: 22, marginTop: 6 },
  languageList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  languageOptionSelected: {
    borderColor: '#007A43',
    backgroundColor: '#DCFCE7',
  },
  languageText: { fontSize: 14, color: '#111827' },
  languageTextSelected: { color: '#064E3B', fontWeight: '700' },
});
