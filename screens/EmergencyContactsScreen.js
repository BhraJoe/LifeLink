import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';

const OFFICIAL_HOTLINES = [
  {
    id: 'h1',
    name: 'Ghana Police Service',
    number: '191',
    category: 'POLICE',
    icon: 'shield-checkmark',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    id: 'h2',
    name: 'National Ambulance Service',
    number: '193',
    category: 'AMBULANCE',
    icon: 'ambulance',
    color: '#DC2626',
    bg: '#FEF2F2',
    isFontAwesome: true,
  },
  {
    id: 'h3',
    name: 'Ghana National Fire Service',
    number: '192',
    category: 'FIRE',
    icon: 'fire-extinguisher',
    color: '#EA580C',
    bg: '#FFF7ED',
    isFontAwesome: true,
  },
  {
    id: 'h4',
    name: 'NADMO Disaster Emergency',
    number: '0302772980',
    displayNumber: '0302 772 980',
    category: 'DISASTER',
    icon: 'warning',
    color: '#CA8A04',
    bg: '#FEFCE8',
  },
];

const INITIAL_PERSONAL_CONTACTS = [
  { id: 'c1', name: 'Kojo Mensah (Brother)', relationship: 'Brother', phone: '+233 24 111 2233' },
  { id: 'c2', name: 'Dr. Evelyn Addo', relationship: 'Primary Physician', phone: '+233 20 444 5566' },
];

export default function EmergencyContactsScreen({ onNavigate }) {
  const [personalContacts, setPersonalContacts] = useState(INITIAL_PERSONAL_CONTACTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleAddContact = () => {
    if (!newName || !newPhone) {
      Alert.alert('Incomplete Fields', 'Please enter contact name and phone number.');
      return;
    }

    const contact = {
      id: `c_${Date.now()}`,
      name: newName,
      relationship: newRelationship || 'Family/Friend',
      phone: newPhone,
    };

    setPersonalContacts([...personalContacts, contact]);
    Alert.alert('Contact Saved! 📞', `${newName} added to your trusted emergency contacts.`);

    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setModalVisible(false);
  };

  const handleDeleteContact = (id, name) => {
    Alert.alert('Remove Contact', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setPersonalContacts(personalContacts.filter((c) => c.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={22} color="#007A43" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Official Ghana Emergency Hotlines */}
        <Text style={styles.sectionTitle}>Official Ghanaian Emergency Hotlines</Text>

        <View style={styles.cardGroup}>
          {OFFICIAL_HOTLINES.map((h, idx) => (
            <View
              key={h.id}
              style={[
                styles.contactRow,
                idx === OFFICIAL_HOTLINES.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: h.bg }]}>
                {h.isFontAwesome ? (
                  <FontAwesome5 name={h.icon} size={18} color={h.color} />
                ) : (
                  <Ionicons name={h.icon} size={20} color={h.color} />
                )}
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{h.name}</Text>
                <Text style={styles.contactNumber}>{h.displayNumber || h.number}</Text>
              </View>

              <TouchableOpacity style={styles.callCircleBtn} onPress={() => handleCall(h.number)}>
                <Feather name="phone" size={18} color="#007A43" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Section 2: Personal Trusted Emergency Contacts */}
        <View style={styles.personalHeader}>
          <Text style={styles.sectionTitle}>Personal Trusted Contacts</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.addText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSub}>
          These contacts are automatically alerted via SMS and push notification when you press the SOS button.
        </Text>

        <View style={styles.cardGroup}>
          {personalContacts.map((c, idx) => (
            <View
              key={c.id}
              style={[
                styles.contactRow,
                idx === personalContacts.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="user" size={18} color="#007A43" />
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactNumber}>
                  {c.phone} • <Text style={{ color: '#007A43' }}>{c.relationship}</Text>
                </Text>
              </View>

              <TouchableOpacity style={styles.callCircleBtn} onPress={() => handleCall(c.phone)}>
                <Feather name="phone" size={18} color="#007A43" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => handleDeleteContact(c.id, c.name)}
              >
                <Feather name="trash-2" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <Text style={styles.modalSub}>Saved contacts will receive your location during SOS triggers.</Text>

            <Text style={styles.inputLabel}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kojo Mensah"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Brother, Spouse, Doctor"
              value={newRelationship}
              onChangeText={setNewRelationship}
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0241112233"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmModalBtn} onPress={handleAddContact}>
                <Text style={styles.confirmModalText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  addBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 10, marginBottom: 8 },
  personalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  addText: { color: '#007A43', fontSize: 14, fontWeight: '700' },
  sectionSub: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  contactNumber: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  callCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  trashBtn: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  cancelModalText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  confirmModalBtn: { backgroundColor: '#007A43', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  confirmModalText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
