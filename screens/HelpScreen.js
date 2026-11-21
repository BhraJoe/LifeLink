import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { version as appVersion } from '../package.json';

const SUPPORT_EMAIL = 'support@linklife.example';
const SUPPORT_PHONE = '+1234567890';
const HELP_CENTER_URL = 'https://linklife.example/support';

export default function HelpScreen({ onNavigate, onGoBack }) {
  const openEmail = (subject = '', body = '') => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  };

  const openPhone = (phone) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  };

  const openUrl = (url) => {
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  };

  const faqs = [
    { q: 'How do I trigger an SOS?', a: 'Add trusted phone numbers under Emergency Contacts, then press and hold SOS. LifeLink captures your location and opens a text addressed to those contacts. Review it and tap Send; delivery is not guaranteed.' },
    { q: 'Can I choose who receives my SOS text?', a: 'The SMS composer is prefilled with all saved trusted contacts. You can review or change recipients before sending.' },
    { q: 'How is my data used?', a: 'Trusted contacts are stored on your device. An SOS location is sent to the configured backend for recording and added to an SMS draft. Do not use this prototype for sensitive or real emergency data.' },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help & Support</Text>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => openEmail('Support Request', 'Describe your issue here...')}>
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline} onPress={() => openPhone(SUPPORT_PHONE)}>
            <Text style={styles.buttonOutlineText}>Call Support</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => openEmail(`Bug Report - LinkLife v${appVersion}`, 'Steps to reproduce:\n') }>
          <Text style={styles.buttonText}>Report a Bug</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        <Text style={styles.paragraph}>If the app is not working as expected:</Text>
        <Text style={styles.bullet}>- Restart the app and try again.</Text>
        <Text style={styles.bullet}>- Ensure app has location and notification permissions.</Text>
        <Text style={styles.bullet}>- Update the app to the latest version.</Text>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((f, idx) => (
          <View key={idx} style={styles.faqItem}>
            <Text style={styles.faqQ}>{f.q}</Text>
            <Text style={styles.faqA}>{f.a}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>More Help</Text>
        <Text style={styles.paragraph}>
          Visit our Help Center for detailed guides and policies.
        </Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => openUrl(HELP_CENTER_URL)}>
          <Text style={styles.linkText}>Open Help Center</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>App version: {appVersion}</Text>
          <Text style={styles.contactInfo}>Support: {SUPPORT_EMAIL} • {SUPPORT_PHONE}</Text>
        </View>
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
  title: { fontSize: 20, fontWeight: '800', color: '#007A43', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#0F766E' },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 20 },
  bullet: { fontSize: 14, color: '#374151', marginLeft: 8, marginTop: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, backgroundColor: '#007A43', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  buttonOutline: { flex: 1, borderWidth: 1, borderColor: '#007A43', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  buttonOutlineText: { color: '#007A43', fontWeight: '700' },
  faqItem: { marginTop: 8 },
  faqQ: { fontSize: 14, fontWeight: '700', color: '#111827' },
  faqA: { fontSize: 14, color: '#374151', marginTop: 4 },
  linkButton: { marginTop: 8 },
  linkText: { color: '#007A43', fontWeight: '700' },
  footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  versionText: { fontSize: 12, color: '#6B7280' },
  contactInfo: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
