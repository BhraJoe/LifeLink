import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { logout, getUser } from '../utils/authService';
import BottomTabBar from './BottomTabBar';

export default function ProfileScreen({ navigation, onNavigate }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const userName = user?.fullName || 'User';
  const userPhone = user?.phoneNumber || '';
  const menuItems = [
    { id: '1', title: 'Emergency Contacts', icon: 'shield-outline' },
    { id: '2', title: 'My Reports', icon: 'document-text-outline' },
    { id: '3', title: 'Blood Donor Profile', icon: 'water-outline' },
    { id: '4', title: 'Settings', icon: 'settings-outline' },
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline' },
    { id: '6', title: 'About LifeLink', icon: 'information-circle-outline' },
  ];

  const handleLogout = async () => {
    await logout();
    onNavigate && onNavigate('WELCOME');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007A43" />

      {/* Dark Green Banner */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: 'https://i.pravatar.cc/120?img=12' }} style={styles.avatar} />
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userPhone}>{userPhone}</Text>

        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={22} color="#374151" style={{ marginRight: 14 }} />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* Log Out Option */}
        <TouchableOpacity 
          style={styles.logoutItem} 
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#DC2626" style={{ marginRight: 14 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar activeTab="Profile" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeader: { backgroundColor: '#007A43', alignItems: 'center', paddingTop: 20, paddingBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FFFFFF', marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  editBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FFFFFF' },
  editBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  menuContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  logoutItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, marginTop: 10 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
