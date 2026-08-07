import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import { getIncidentById } from '../utils/authService';

export default function ReportDetailScreen({ onNavigate, onGoBack, routeParams }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = routeParams?.id;

  useEffect(() => {
    if (id) {
      loadIncident();
    }
  }, [id]);

  const loadIncident = async () => {
    try {
      const data = await getIncidentById(id);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident', err);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (!incident?.latitude || !incident?.longitude) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack}>
            <Feather name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007A43" />
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack}>
            <Feather name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Report not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconName = incident.type?.toLowerCase() === 'flood' ? 'water-outline' : incident.type?.toLowerCase() === 'fire' ? 'flame-outline' : incident.type?.toLowerCase() === 'pothole' ? 'trail-sign-outline' : incident.type?.toLowerCase() === 'accident' ? 'car-outline' : 'warning-outline';
  const statusColor = incident.status === 'ACTIVE' ? '#DC2626' : incident.status === 'RESOLVED' ? '#007A43' : '#D97706';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.typeBadgeRow}>
          <View style={styles.typeBadge}>
            <Ionicons name={iconName} size={18} color="#2563EB" />
            <Text style={styles.typeBadgeText}>{incident.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{incident.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{incident.title}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{incident.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{new Date(incident.createdAt).toLocaleString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="user" size={16} color="#6B7280" />
            <Text style={styles.metaText}>Reported by {incident.reportedBy}</Text>
          </View>
          {(incident.latitude != null && incident.longitude != null) && (
            <TouchableOpacity style={styles.metaItem} onPress={openMap}>
              <Feather name="navigation" size={16} color="#007A43" />
              <Text style={[styles.metaText, { color: '#007A43' }]}>
                {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {incident.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{incident.description}</Text>
          </View>
        ) : null}

        {Array.isArray(incident.images) && incident.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({incident.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageRow}>
                {incident.images.map((img, idx) => (
                  <Image key={idx} source={{ uri: `data:image/jpeg;base64,${img}` }} style={styles.detailImage} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {Array.isArray(incident.images) && incident.images.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.noPhotos}>No photos attached.</Text>
          </View>
        )}
      </ScrollView>

      <BottomTabBar activeTab="Community" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  center: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  typeBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeBadgeText: { marginLeft: 8, fontSize: 13, fontWeight: '700', color: '#2563EB', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  metaGrid: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { marginLeft: 10, fontSize: 14, color: '#374151', flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  imageRow: { flexDirection: 'row', alignItems: 'center' },
  detailImage: { width: 260, height: 200, borderRadius: 12, marginRight: 12 },
  noPhotos: { fontSize: 14, color: '#6B7280' },
});
