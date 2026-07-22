import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';

export default function CommunityScreen({ onNavigate }) {
  const posts = [
    {
      id: '1',
      title: 'Flood reported',
      location: 'Lapaz, Accra',
      time: '2h ago',
      image: 'https://picsum.photos/400/200?random=10',
      likes: 12,
      comments: 5,
      type: 'flood',
    },
    {
      id: '2',
      title: 'Pothole',
      location: 'Dzorwulu, Accra',
      time: '5h ago',
      image: 'https://picsum.photos/400/200?random=11',
      likes: 8,
      comments: 3,
      type: 'pothole',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}><Text style={styles.chipTextActive}>All</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}><Text style={styles.chipText}>Incidents</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}><Text style={styles.chipText}>Missing</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}><Text style={styles.chipText}>Alerts</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.postIconBox}>
                <Ionicons name={post.type === 'flood' ? 'water-outline' : 'warning-outline'} size={20} color="#2563EB" />
              </View>
              <View style={styles.postMeta}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postSub}>{post.location}</Text>
              </View>
              <Text style={styles.timeText}>{post.time}</Text>
            </View>

            {/* Post Image */}
            <Image source={{ uri: post.image }} style={styles.postImg} />

            {/* Social Interaction Buttons */}
            <View style={styles.postFooter}>
              <View style={styles.actionGroup}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Feather name="heart" size={18} color="#6B7280" />
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, { marginLeft: 16 }]}>
                  <Feather name="message-square" size={18} color="#6B7280" />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="share-2" size={18} color="#6B7280" />
                <Text style={styles.actionCount}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Post Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => onNavigate('ReportIncident')}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomTabBar activeTab="Community" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterChipActive: { backgroundColor: '#007A43' },
  chipText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  chipTextActive: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  postCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  postIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  postMeta: { flex: 1 },
  postTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  postSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  timeText: { fontSize: 12, color: '#9CA3AF' },
  postImg: { width: '100%', height: 180 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { flexDirection: 'row', alignItems: 'center' },
  actionCount: { fontSize: 13, color: '#4B5563', marginLeft: 6, fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 50, height: 50, borderRadius: 25, backgroundColor: '#007A43', justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
