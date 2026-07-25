import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BottomTabBar({ activeTab, onTabPress, onSosPress }) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: 'home' },
    { id: 'Map', label: 'Map', icon: 'map-pin' },
    { id: 'Community', label: 'Community', icon: 'users' },
    { id: 'Profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <View style={styles.barContainer}>
      {/* Left Tabs */}
      <View style={styles.tabGroup}>
        {tabs.slice(0, 2).map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id} 
              style={styles.tabButton} 
              onPress={() => onTabPress(tab.id)}
            >
              <Feather name={tab.icon} size={22} color={isActive ? '#007A43' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Center SOS Button */}
      <TouchableOpacity style={styles.sosButton} activeOpacity={0.85} onPress={onSosPress}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Right Tabs */}
      <View style={styles.tabGroup}>
        {tabs.slice(2, 4).map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id} 
              style={styles.tabButton} 
              onPress={() => onTabPress(tab.id)}
            >
              <Feather name={tab.icon} size={22} color={isActive ? '#007A43' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tabGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#007A43',
    fontWeight: '700',
  },
  sosButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    boxShadow: '0px 4px 5px rgba(220, 38, 38, 0.3)',
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
