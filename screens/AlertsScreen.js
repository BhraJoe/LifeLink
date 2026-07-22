import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function AlertsScreen({ navigation }) {
  const alerts = [
    {
      id: '1',
      title: 'Flood Warning',
      body: 'Heavy rains expected in Greater Accra Region today, 8:00 AM',
      timestamp: 'Today, 8:00 AM',
      type: 'danger',
      icon: 'alert-triangle',
    },
    {
      id: '2',
      title: 'Storm Alert',
      body: 'Strong winds expected today, 6:00 PM',
      timestamp: 'Today, 6:00 PM',
      type: 'warning',
      icon: 'cloud-lightning',
    },
    {
      id: '3',
      title: 'Fire Outbreak',
      body: 'Avoid Aburi Mountains area\nToday, 5:30 PM',
      timestamp: 'Today, 5:30 PM',
      type: 'warning',
      icon: 'flame',
    },
    {
      id: '4',
      title: 'General Notice',
      body: 'Stay safe and follow official instructions',
      timestamp: 'Yesterday, 9:15 PM',
      type: 'info',
      icon: 'info',
    },
  ];

  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return { bg: '#FEF2F2', border: '#FCA5A5', iconBg: '#EF4444', iconColor: '#FFF' };
      case 'warning':
        return { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#F59E0B', iconColor: '#FFF' };
      default:
        return { bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#3B82F6', iconColor: '#FFF' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {alerts.map(item => {
          const alertStyle = getAlertStyles(item.type);
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.alertCard, { backgroundColor: alertStyle.bg, borderColor: alertStyle.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: alertStyle.iconBg }]}>
                {item.icon === 'flame' ? (
                  <FontAwesome5 name="fire" size={18} color="#FFF" />
                ) : (
                  <Feather name={item.icon} size={20} color={alertStyle.iconColor} />
                )}
              </View>

              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertBody}>{item.body}</Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  alertInfo: { flex: 1, paddingRight: 8 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  alertBody: { fontSize: 13, color: '#374151', marginTop: 4, lineHeight: 18 },
  timeText: { fontSize: 12, color: '#6B7280', marginTop: 6 },
});
