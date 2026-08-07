import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { shareLiveLocation, getStoredAuth } from '../utils/authService';

export default function LiveLocationScreen({ onNavigate }) {
  const [sharing, setSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Ama', image: 'https://i.pravatar.cc/100?img=32' },
    { id: '2', name: 'Kwaku', image: 'https://i.pravatar.cc/100?img=12' },
    { id: '3', name: 'Mama', image: 'https://i.pravatar.cc/100?img=47' },
  ]);
  const intervalRef = useRef(null);
  const watchRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current) watchRef.current.remove();
    };
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const startSharing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your live location.');
        return;
      }

      setSharing(true);
      setElapsed(0);
      setErrorMsg(null);

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      const sendLocation = async (loc) => {
        setLocation(loc);
        const auth = await getStoredAuth();
        const user = auth.user;

        await shareLiveLocation({
          userId: user?.id || 'anonymous',
          userName: user?.fullName || 'LifeLink User',
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address: loc.address || `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`,
        });
      };

      const initialLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: initialLoc.coords.latitude,
        longitude: initialLoc.coords.longitude,
      });
      const named = {
        ...initialLoc,
        address: [address.name, address.city, address.region].filter(Boolean).join(', '),
      };
      await sendLocation(named);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (loc) => {
          const [addr] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          const withAddress = {
            ...loc,
            address: [addr.name, addr.city, addr.region].filter(Boolean).join(', '),
          };
          await sendLocation(withAddress);
        }
      );
    } catch (err) {
      console.error('Live location error:', err);
      setErrorMsg(err.message);
      setSharing(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const stopSharing = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchRef.current) watchRef.current.remove();
    setSharing(false);
    setElapsed(0);
    setLocation(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Simulated Map Container */}
      <View style={styles.mapView}>
        {errorMsg && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {!sharing && !location && (
          <View style={styles.mapOverlayCenter}>
            <View style={styles.startPrompt}>
              <Ionicons name="navigate-circle-outline" size={48} color="#007A43" />
              <Text style={styles.startPromptText}>Start sharing your live location with trusted contacts</Text>
              <TouchableOpacity style={styles.startButton} onPress={startSharing}>
                <Text style={styles.startButtonText}>Start Sharing</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {location && (
          <>
            <View style={styles.statusBanner}>
              <View style={styles.statusLeft}>
                <View style={styles.radarIconBox}>
                  <Ionicons name="radio" size={20} color="#007A43" />
                </View>
                <View>
                  <Text style={styles.bannerTitle}>Sharing live location</Text>
                  <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={stopSharing}>
                <Text style={styles.stopText}>Stop</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapOverlayCenter}>
              <View style={styles.pulseOuter}>
                <View style={styles.pulseDot} />
              </View>
            </View>

            <View style={styles.coordsBox}>
              <Text style={styles.coordsText}>
                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
              {location.address ? <Text style={styles.addressText}>{location.address}</Text> : null}
            </View>
          </>
        )}
      </View>

      {/* Bottom Panel: Shared Contacts */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Sharing with</Text>
        <View style={styles.avatarRow}>
          {contacts.map((person) => (
            <View key={person.id} style={styles.avatarItem}>
              <Image source={{ uri: person.image }} style={styles.avatar} />
              <Text style={styles.avatarName}>{person.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreButton}>
            <Feather name="plus" size={24} color="#6B7280" />
            <Text style={styles.addText}>Add More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  mapView: { flex: 1, backgroundColor: '#E5E7EB', position: 'relative' },
  errorBanner: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12 },
  errorText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  mapOverlayCenter: { position: 'absolute', top: '40%', left: '42%' },
  startPrompt: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  startPromptText: { fontSize: 14, color: '#374151', textAlign: 'center', marginTop: 12, marginBottom: 16, paddingHorizontal: 10 },
  startButton: { backgroundColor: '#007A43', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  startButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  statusBanner: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  radarIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  timerText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  stopText: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  pulseOuter: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(22, 163, 74, 0.2)', justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#16A34A' },
  coordsBox: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 12 },
  coordsText: { fontSize: 12, color: '#111827', fontWeight: '700' },
  addressText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarItem: { alignItems: 'center', marginRight: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginBottom: 6 },
  avatarName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  addMoreButton: { alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
