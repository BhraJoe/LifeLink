import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';

const MOCK_TASKS = [
  {
    id: 'vt1',
    title: 'First Aid Assistance - Road Accident',
    category: 'First Aid',
    urgency: 'HIGH',
    location: 'Spintex Rd near Coca-Cola Roundabout, Accra',
    distance: '1.4 km',
    timeAgo: '10 mins ago',
    description: 'Two motorbikes collided. CPR and basic first aid needed before ambulance arrival.',
    respondersCount: 1,
  },
  {
    id: 'vt2',
    title: 'Emergency Blood Transport',
    category: 'Medical Transport',
    urgency: 'URGENT',
    location: '37 Military Hospital to Ridge Hospital',
    distance: '3.0 km',
    timeAgo: '25 mins ago',
    description: 'Urgent transport of 2 units of O- negative blood needed for emergency surgery.',
    respondersCount: 2,
  },
  {
    id: 'vt3',
    title: 'Flood Relief & Evacuation Support',
    category: 'Disaster Relief',
    urgency: 'MEDIUM',
    location: 'Alajo, Accra',
    distance: '5.2 km',
    timeAgo: '1 hour ago',
    description: 'Volunteers needed with boots/raincoats to assist elderly residents moving to higher ground.',
    respondersCount: 5,
  },
];

const AVAILABLE_SKILLS = [
  'First Aid Certified',
  'CPR Trained',
  'Medical Doctor / Nurse',
  'Search & Rescue',
  'Emergency Driver',
  'Disaster Relief Worker',
  'Community Coordinator',
];

export default function VolunteerScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' or 'REGISTER'
  const [acceptedTasks, setAcceptedTasks] = useState({});

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAcceptTask = (taskId) => {
    setAcceptedTasks((prev) => ({ ...prev, [taskId]: true }));
    Alert.alert('Task Accepted! 🤝', 'Thank you for responding. Emergency dispatch info has been sent to your phone.');
  };

  const handleRegisterVolunteer = () => {
    if (!fullName || !phone || selectedSkills.length === 0) {
      Alert.alert('Incomplete Form', 'Please enter your name, phone number, and select at least one skill.');
      return;
    }

    Alert.alert(
      'Volunteer Registered 🎉',
      `Thank you ${fullName}! Your volunteer profile is active. You will receive nearby emergency requests.`
    );
    setActiveTab('REQUESTS');
  };

  const renderTaskCard = ({ item }) => {
    const isAccepted = acceptedTasks[item.id];

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.urgencyBadge}>
            <Text style={styles.urgencyText}>{item.urgency} URGENCY</Text>
          </View>
          <Text style={styles.timeText}>{item.timeAgo}</Text>
        </View>

        <Text style={styles.taskTitle}>{item.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color="#EA580C" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <Text style={styles.taskDesc}>{item.description}</Text>

        <View style={styles.taskFooter}>
          <View style={styles.volunteersBadge}>
            <Feather name="users" size={12} color="#4B5563" />
            <Text style={styles.volunteersCount}>{item.respondersCount} responding</Text>
          </View>

          {isAccepted ? (
            <View style={styles.acceptedBtn}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.acceptedBtnText}>Accepted</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptTask(item.id)}>
              <Text style={styles.acceptBtnText}>Accept Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Volunteer Hub</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'REQUESTS' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('REQUESTS')}
        >
          <Text style={[styles.segmentText, activeTab === 'REQUESTS' && styles.segmentTextActive]}>
            Nearby Requests ({MOCK_TASKS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'REGISTER' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('REGISTER')}
        >
          <Text style={[styles.segmentText, activeTab === 'REGISTER' && styles.segmentTextActive]}>
            Register Skills
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'REQUESTS' ? (
        <FlatList
          data={MOCK_TASKS}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>Register as a Community Volunteer</Text>
          <Text style={styles.formSub}>
            Help saved lives during accidents, floods, and blood shortages in your community.
          </Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kwame Mensah"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0241234567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.inputLabel}>City / Area</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. East Legon, Accra"
            value={district}
            onChangeText={setDistrict}
          />

          <Text style={styles.inputLabel}>Select Your Skills</Text>
          <View style={styles.skillsGrid}>
            {AVAILABLE_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillChip, isSelected && styles.skillChipSelected]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.skillChipText, isSelected && styles.skillChipTextSelected]}>
                    {isSelected ? '✓ ' : '+ '}
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Available for Dispatch</Text>
              <Text style={styles.switchSub}>Receive urgent emergency notifications</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={isAvailable ? '#007A43' : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegisterVolunteer}>
            <Text style={styles.submitBtnText}>Save Volunteer Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

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
  segmentBtnActive: { borderBottomColor: '#007A43' },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  segmentTextActive: { color: '#007A43', fontWeight: '700' },
  listContent: { padding: 16 },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  urgencyBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgencyText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
  timeText: { fontSize: 12, color: '#9CA3AF' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 13, color: '#EA580C', fontWeight: '600', marginLeft: 4 },
  taskDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 12 },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  volunteersBadge: { flexDirection: 'row', alignItems: 'center' },
  volunteersCount: { fontSize: 12, color: '#4B5563', marginLeft: 4 },
  acceptBtn: { backgroundColor: '#007A43', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  acceptBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  acceptedBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  acceptedBtnText: { color: '#15803D', fontSize: 13, fontWeight: '700', marginLeft: 4 },
  formContent: { padding: 20 },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  formSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },
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
    marginBottom: 16,
  },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  skillChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipSelected: { backgroundColor: '#007A43' },
  skillChipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  skillChipTextSelected: { color: '#FFFFFF' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  switchSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#007A43',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
