import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
  Alert,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import { getMissingPersons, createMissingPerson, createSighting } from '../utils/authService';
import { isValidGhanaPhoneNumber, sanitizeDigits, sanitizeName, sanitizePhoneNumber } from '../utils/validation';

export default function MissingPersonScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('ALERTS');
  const [missingPersons, setMissingPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingNotes, setSightingNotes] = useState('');
  const [submittingSighting, setSubmittingSighting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    loadMissingPersons();
  }, []);

  const loadMissingPersons = async () => {
    try {
      setLoading(true);
      const data = await getMissingPersons({ verifiedOnly: true });
      setMissingPersons(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load missing persons');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenSighting = (person) => {
    setSelectedPerson(person);
    setSightingLocation('');
    setSightingNotes('');
  };

  const handleSubmitSighting = async () => {
    if (!sightingLocation) {
      Alert.alert('Missing Location', 'Please enter where you saw this person.');
      return;
    }

    try {
      setSubmittingSighting(true);
      await createSighting(selectedPerson.id, {
        location: sightingLocation,
        notes: sightingNotes,
      });

      setMissingPersons((prev) =>
        prev.map((p) =>
          p.id === selectedPerson.id ? { ...p, sightingsCount: (p.sightingsCount || 0) + 1 } : p
        )
      );

      Alert.alert(
        'Sighting Reported! 📍',
        `Thank you! Your report for ${selectedPerson.fullName} has been sent to family members and emergency officers.`
      );
      setSelectedPerson(null);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit sighting');
    } finally {
      setSubmittingSighting(false);
    }
  };

  const handleCreateReport = async () => {
    if (!fullName || !lastSeenLocation || !contactPhone) {
      Alert.alert('Incomplete Form', 'Please provide the missing person full name, last seen location, and contact phone.');
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim()) || fullName.trim().length < 2) {
      Alert.alert('Invalid name', 'Enter a valid full name using letters only.');
      return;
    }
    if (!isValidGhanaPhoneNumber(contactPhone)) {
      Alert.alert('Invalid phone number', 'Enter 0241234567 or +233241234567.');
      return;
    }
    if (age && (Number(age) < 1 || Number(age) > 120)) {
      Alert.alert('Invalid age', 'Age must be between 1 and 120.');
      return;
    }

    try {
      setSubmittingReport(true);
      const result = await createMissingPerson({
        fullName,
        age: Number(age) || 0,
        gender,
        lastSeenLocation,
        description,
        contactPhone,
      });

      const newPerson = {
        ...result.report,
        sightingsCount: 0,
      };

      setMissingPersons([newPerson, ...missingPersons]);
      Alert.alert(
        'Report Submitted 📢',
        'Your missing person alert has been recorded. It will be shared with nearby community members after quick verification.'
      );

      setFullName('');
      setAge('');
      setLastSeenLocation('');
      setContactPhone('');
      setDescription('');
      setActiveTab('ALERTS');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const filteredPersons = missingPersons.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastSeenLocation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPersonCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.personName}>{item.fullName}</Text>
            {item.verifiedByAdmin && (
              <MaterialIcons name="verified" size={16} color="#007A43" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.subInfo}>
            {item.age > 0 ? `${item.age} yrs • ` : ''}
            {item.gender}
          </Text>
        </View>

        <View style={item.status === 'RESOLVED' || item.status === 'FOUND' ? styles.statusFound : styles.statusActive}>
          <Text style={item.status === 'RESOLVED' || item.status === 'FOUND' ? styles.statusFoundText : styles.statusActiveText}>
            {item.status === 'RESOLVED' || item.status === 'FOUND' ? 'FOUND' : 'MISSING'}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={15} color="#DC2626" />
        <Text style={styles.detailText}>
          Last seen: <Text style={{ fontWeight: '700' }}>{item.lastSeenLocation}</Text> ({item.lastSeenDate || 'Today'})
        </Text>
      </View>

      {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}

      <View style={styles.sightingsBar}>
        <Feather name="eye" size={14} color="#6B7280" />
        <Text style={styles.sightingsText}>{item.sightingsCount || 0} community sighting reports</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.sightingBtn} onPress={() => handleOpenSighting(item)}>
          <Ionicons name="eye-outline" size={16} color="#007A43" />
          <Text style={styles.sightingBtnText}>Report Sighting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.contactPhone)}>
          <Feather name="phone" size={15} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Call Family</Text>
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
        <Text style={styles.headerTitle}>Missing Persons</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'ALERTS' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('ALERTS')}
        >
          <Text style={[styles.segmentText, activeTab === 'ALERTS' && styles.segmentTextActive]}>
            Active Alerts ({filteredPersons.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'REPORT' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('REPORT')}
        >
          <Text style={[styles.segmentText, activeTab === 'REPORT' && styles.segmentTextActive]}>
            Report Missing
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ALERTS' ? (
        <>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search missing person or location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
                maxLength={120}
              />
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007A43" />
              <Text style={styles.loadingText}>Loading alerts...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPersons}
              keyExtractor={(item) => item.id}
              renderItem={renderPersonCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>Submit Missing Person Alert</Text>
          <Text style={styles.formSub}>Provide accurate details to notify nearby citizens and emergency services.</Text>

          <Text style={styles.inputLabel}>Missing Person's Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kwame Mensah"
            value={fullName}
            onChangeText={(value) => setFullName(sanitizeName(value))}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={100}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 14"
                keyboardType="numeric"
                value={age}
                onChangeText={(value) => setAge(sanitizeDigits(value, 3))}
                maxLength={3}
              />
            </View>

            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Last Known Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kaneshie Market, Accra"
            value={lastSeenLocation}
            onChangeText={setLastSeenLocation}
          />

          <Text style={styles.inputLabel}>Family / Contact Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0249991122 or +233249991122"
            keyboardType="phone-pad"
            value={contactPhone}
            onChangeText={(value) => setContactPhone(sanitizePhoneNumber(value))}
            maxLength={13}
          />

          <Text style={styles.inputLabel}>Clothing & Appearance Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Describe clothing, height, distinct features..."
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submittingReport && styles.submitBtnDisabled]}
            onPress={handleCreateReport}
            disabled={submittingReport}
          >
            <Text style={styles.submitBtnText}>{submittingReport ? 'Submitting...' : 'Publish Missing Person Alert'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Sighting Modal */}
      <Modal visible={!!selectedPerson} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report Sighting</Text>
            <Text style={styles.modalSub}>
              Have you seen <Text style={{ fontWeight: '700' }}>{selectedPerson?.fullName}</Text>?
            </Text>

            <Text style={styles.inputLabel}>Sighting Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Achimota Overpass"
              value={sightingLocation}
              onChangeText={setSightingLocation}
              maxLength={200}
            />

            <Text style={styles.inputLabel}>Additional Notes / Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Saw him around 2 PM heading towards station"
              value={sightingNotes}
              onChangeText={setSightingNotes}
              maxLength={500}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setSelectedPerson(null)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={handleSubmitSighting}
                disabled={submittingSighting}
              >
                <Text style={styles.confirmModalText}>{submittingSighting ? 'Submitting...' : 'Submit Sighting'}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentBtnActive: { borderBottomColor: '#DC2626' },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  segmentTextActive: { color: '#DC2626', fontWeight: '700' },
  searchSection: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#DC2626' },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  personName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subInfo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusActive: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusActiveText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
  statusFound: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusFoundText: { color: '#15803D', fontSize: 11, fontWeight: '800' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 13, color: '#374151', marginLeft: 6 },
  descText: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 10 },
  sightingsBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sightingsText: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  sightingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sightingBtnText: { color: '#007A43', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007A43',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  formContent: { padding: 20 },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  formSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
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
  genderRow: { flexDirection: 'row', height: 42 },
  genderBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 6,
  },
  genderBtnActive: { backgroundColor: '#DC2626' },
  genderText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  genderTextActive: { color: '#FFFFFF' },
  submitBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  cancelModalText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  confirmModalBtn: { backgroundColor: '#007A43', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  confirmModalText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});


