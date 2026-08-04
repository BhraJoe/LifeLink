import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Linking,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';

const MOCK_DISASTER_ALERTS = [
  {
    id: 'da1',
    title: 'Flash Flood Warning - High Risk Zones',
    category: 'FLOOD',
    severity: 'CRITICAL',
    region: 'Accra Metropolitan',
    affectedAreas: ['Alajo', 'Kaneshie', 'Odawna', 'Adabraka', 'Mallam Junction'],
    issuedBy: 'Ghana Meteorological Agency & NADMO',
    issuedAt: 'Today, 07:00 AM',
    description:
      'Torrential rain has led to rising water levels along the Odaw River basin. Residents in low-lying zones should move to higher ground immediately.',
    safetyInstructions: [
      'Do not attempt to walk or drive through floodwaters.',
      'Turn off main electricity switches if water enters building.',
      'Call NADMO Hotline 0302 772 980 for emergency evacuation assistance.',
    ],
  },
  {
    id: 'da2',
    title: 'Heavy Rainstorm & Gale Force Winds',
    category: 'STORM',
    severity: 'SEVERE',
    region: 'Central & Western Coast',
    affectedAreas: ['Cape Coast', 'Elmina', 'Sekondi-Takoradi', 'Axim'],
    issuedBy: 'Ghana Meteorological Agency',
    issuedAt: 'Today, 08:30 AM',
    description:
      'Severe thunder squalls with wind gusts up to 65 km/h expected along the coastal belt. High risk of fallen trees and unanchored billboards.',
    safetyInstructions: [
      'Stay indoors and away from windows during high wind gusts.',
      'Avoid parking vehicles directly under large trees or electricity pylons.',
    ],
  },
  {
    id: 'da3',
    title: 'Major Road Hazard Blackspot Alert',
    category: 'ROAD_SAFETY',
    severity: 'MODERATE',
    region: 'Accra-Kumasi Highway',
    affectedAreas: ['Nsawam Bypass', 'Suhum', 'Bunso Junction'],
    issuedBy: 'National Road Safety Authority (NRSA)',
    issuedAt: 'Yesterday, 06:00 PM',
    description:
      'Diesel spill on the wet asphalt surface near Bunso junction has created extremely slick driving conditions. Exercise extreme caution.',
    safetyInstructions: ['Reduce speed below 50 km/h.', 'Maintain at least 4 vehicle lengths distance.'],
  },
];

export default function DisasterAlertsScreen({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // ALL, FLOOD, STORM, ROAD_SAFETY
  const [alerts, setAlerts] = useState(MOCK_DISASTER_ALERTS);

  const handleCallNadmo = () => {
    Linking.openURL('tel:0302772980');
  };

  const filteredAlerts = alerts.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' };
      case 'SEVERE':
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FDBA74' };
      case 'MODERATE':
        return { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE047' };
      default:
        return { bg: '#EFF6FF', text: '#2563EB', border: '#93C5FD' };
    }
  };

  const renderAlertCard = ({ item }) => {
    const severityStyle = getSeverityStyle(item.severity);

    return (
      <View style={[styles.card, { borderColor: severityStyle.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.severityBadge, { backgroundColor: severityStyle.bg }]}>
            <FontAwesome5
              name={item.category === 'FLOOD' ? 'water' : item.category === 'STORM' ? 'wind' : 'car-crash'}
              size={12}
              color={severityStyle.text}
            />
            <Text style={[styles.severityText, { color: severityStyle.text }]}>{item.severity}</Text>
          </View>

          <Text style={styles.issuedAtText}>{item.issuedAt}</Text>
        </View>

        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.issuerText}>Issued by: {item.issuedBy}</Text>

        <Text style={styles.descText}>{item.description}</Text>

        {/* Affected Areas */}
        <View style={styles.areasContainer}>
          <Text style={styles.areasLabel}>Affected Areas:</Text>
          <View style={styles.areasWrap}>
            {item.affectedAreas.map((area) => (
              <View key={area} style={styles.areaTag}>
                <Text style={styles.areaTagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>🛡️ Safety Instructions:</Text>
          {item.safetyInstructions.map((instruction, idx) => (
            <Text key={idx} style={styles.instructionItem}>
              • {instruction}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.nadmoBtn} onPress={handleCallNadmo}>
            <Feather name="phone-call" size={15} color="#FFFFFF" />
            <Text style={styles.nadmoBtnText}>Call NADMO Emergency (0302 772 980)</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Disaster & Flood Alerts</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Category Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveCategory('ALL')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'ALL' && styles.filterChipTextActive]}>
              All Warnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'FLOOD' && styles.filterChipActive]}
            onPress={() => setActiveCategory('FLOOD')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'FLOOD' && styles.filterChipTextActive]}>
              🌊 Flood Warnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'STORM' && styles.filterChipActive]}
            onPress={() => setActiveCategory('STORM')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'STORM' && styles.filterChipTextActive]}>
              ⚡ Storm Watch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'ROAD_SAFETY' && styles.filterChipActive]}
            onPress={() => setActiveCategory('ROAD_SAFETY')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'ROAD_SAFETY' && styles.filterChipTextActive]}>
              🚗 Road Hazards
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  filterChipActive: { backgroundColor: '#EA580C' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: { fontSize: 11, fontWeight: '900', marginLeft: 6 },
  issuedAtText: { fontSize: 12, color: '#9CA3AF' },
  alertTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  issuerText: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 10 },
  descText: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 12 },
  areasContainer: { marginBottom: 12 },
  areasLabel: { fontSize: 12, fontWeight: '700', color: '#4B5563', marginBottom: 6 },
  areasWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  areaTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  areaTagText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  instructionsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructionsTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  instructionItem: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginBottom: 4 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  nadmoBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nadmoBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
});
