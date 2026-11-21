import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { shareLiveLocation, getStoredAuth } from '../utils/authService';

const CONTACTS = [
  { id: '1', name: 'Ama Mensah', phone: '+233201234567' },
  { id: '2', name: 'Kwaku Boateng', phone: '+233244567890' },
  { id: '3', name: 'Mama', phone: '+233551234567' },
  { id: '4', name: 'Yaw Owusu', phone: '+233277654321' },
];

const AVATAR_COLORS = ['#E0F2FE', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#EDE9FE', '#FEE2E2'];

const DURATIONS = [
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '8h', label: '8 hours' },
  { value: 'until-stopped', label: 'Until I stop' },
];

const PULSE_STYLE = `
  .ll-pulse { position: relative; width: 44px; height: 44px; }
  .ll-pulse .ll-ring { position: absolute; left: 0; top: 0; width: 44px; height: 44px; border-radius: 50%;
    background: rgba(0,122,67,0.25); animation: llPulse 1.8s ease-out infinite; }
  .ll-pulse .ll-dot { position: absolute; left: 14px; top: 14px; width: 16px; height: 16px; border-radius: 50%;
    background: #007A43; border: 3px solid #FFFFFF; box-shadow: 0 0 0 2px rgba(0,122,67,0.4); }
  @keyframes llPulse { 0% { transform: scale(0.3); opacity: 0.8; } 100% { transform: scale(1); opacity: 0; } }
`;

const avatarColor = (id) => {
  const sum = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

function buildMapHtml(lat, lng, acc) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #E8F0EA; }
    ${PULSE_STYLE}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var accCircle = L.circle([${lat}, ${lng}], {
      radius: ${acc || 20}, color: '#007A43', weight: 1, fillColor: '#007A43', fillOpacity: 0.12
    }).addTo(map);
    var icon = L.divIcon({
      className: '',
      html: '<div class="ll-pulse"><span class="ll-ring"></span><span class="ll-dot"></span></div>',
      iconSize: [44, 44], iconAnchor: [22, 22]
    });
    var marker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
    window.updateLL = function (nlat, nlng, nacc) {
      marker.setLatLng([nlat, nlng]);
      accCircle.setLatLng([nlat, nlng]).setRadius(nacc || 20);
      map.panTo([nlat, nlng]);
    };
  </script>
</body>
</html>`;
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.L) return resolve(window.L);
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const existing = document.getElementById('leaflet-js');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

export default function LiveLocationScreen({ onNavigate, onGoBack }) {
  const [isSharing, setIsSharing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [duration, setDuration] = useState('until-stopped');
  const [selected, setSelected] = useState(CONTACTS.map((c) => c.id));
  const [sendingSms, setSendingSms] = useState(false);

  const intervalRef = useRef(null);
  const watchRef = useRef(null);
  const webViewRef = useRef(null);
  const webContainerRef = useRef(null);
  const leafletRef = useRef(null);
  const webLayerRef = useRef(null);
  const [webReady, setWebReady] = useState(false);

  const goBack = () => (onGoBack ? onGoBack() : onNavigate('Home'));

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current) watchRef.current.remove();
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const selectedContacts = useMemo(
    () => CONTACTS.filter((c) => selected.includes(c.id)),
    [selected]
  );

  const toggleContact = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendLocation = useCallback(
    async (loc, shareDuration) => {
      setLocation(loc);
      try {
        const auth = await getStoredAuth();
        const user = auth.user;
        await shareLiveLocation({
          userId: user?.id || 'anonymous',
          userName: user?.fullName || 'LifeLink User',
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address:
            loc.address ||
            `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`,
          duration: shareDuration,
        });
      } catch (err) {
        console.error('Failed to push live location:', err);
      }
    },
    []
  );

  const startSharing = async () => {
    if (starting) return;
    try {
      setStarting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your live location.');
        return;
      }

      setIsSharing(true);
      setElapsed(0);
      setErrorMsg(null);

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      const initialLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      let address = '';
      try {
        const [addr] = await Location.reverseGeocodeAsync({
          latitude: initialLoc.coords.latitude,
          longitude: initialLoc.coords.longitude,
        });
        address = [addr?.name, addr?.city, addr?.region].filter(Boolean).join(', ');
      } catch {
        address = '';
      }
      await sendLocation({ ...initialLoc, address }, duration);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (loc) => {
          try {
            const [addr] = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            const withAddress = {
              ...loc,
              address: [addr?.name, addr?.city, addr?.region].filter(Boolean).join(', '),
            };
            await sendLocation(withAddress, duration);
          } catch {
            await sendLocation(loc, duration);
          }
        }
      );
    } catch (err) {
      console.error('Live location error:', err);
      setErrorMsg(err.message || 'Unable to start sharing');
      setIsSharing(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } finally {
      setStarting(false);
    }
  };

  const stopSharing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchRef.current) watchRef.current.remove();
    intervalRef.current = null;
    watchRef.current = null;
    setIsSharing(false);
    setElapsed(0);
    setLocation(null);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!location) {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
      webLayerRef.current = null;
      setWebReady(false);
    }
  }, [location]);

  const shareLink = async () => {
    if (!location) return;
    const { latitude, longitude } = location.coords;
    try {
      await Share.share({
        message:
          `Follow my live location on LifeLink: ` +
          `https://maps.google.com/?q=${latitude.toFixed(5)},${longitude.toFixed(5)}`,
      });
    } catch (err) {
      console.error('Share link error:', err);
    }
  };

  const sendSms = async () => {
    if (!location) return;
    const numbers = selectedContacts.map((c) => c.phone).filter(Boolean);
    if (numbers.length === 0) {
      Alert.alert('No contacts selected', 'Select at least one contact with a phone number.');
      return;
    }
    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert('SMS unavailable', 'Text messaging is not available on this device.');
      return;
    }
    try {
      setSendingSms(true);
      const { latitude, longitude } = location.coords;
      const message =
        `I'm sharing my live location with you via LifeLink. ` +
        `Track me: https://maps.google.com/?q=${latitude.toFixed(5)},${longitude.toFixed(5)}` +
        (location.address ? ` (${location.address})` : '');
      await SMS.sendSMSAsync(numbers, message);
    } catch (err) {
      console.error('SMS error:', err);
      Alert.alert('SMS failed', err.message || 'Could not open the messaging app.');
    } finally {
      setSendingSms(false);
    }
  };

  const mapHtml = useMemo(() => {
    if (!location) return null;
    return buildMapHtml(
      location.coords.latitude,
      location.coords.longitude,
      location.coords.accuracy
    );
  }, [location !== null]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapHtml) return;
    let cancelled = false;
    const init = async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !webContainerRef.current) return;
        if (!leafletRef.current) {
          const map = L.map(webContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
          }).setView([location.coords.latitude, location.coords.longitude], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          leafletRef.current = map;
        }
        setWebReady(true);
      } catch (err) {
        console.error('Web map init failed:', err);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [mapHtml]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !webReady || !location) return;
    const L = typeof window !== 'undefined' ? window.L : null;
    const map = leafletRef.current;
    if (!L || !map) return;
    if (webLayerRef.current) webLayerRef.current.clearLayers();
    const group = L.layerGroup().addTo(map);
    const { latitude, longitude, accuracy } = location.coords;
    L.circle([latitude, longitude], {
      radius: accuracy || 20,
      color: '#007A43',
      weight: 1,
      fillColor: '#007A43',
      fillOpacity: 0.12,
    }).addTo(group);
    const icon = L.divIcon({
      className: '',
      html: '<div class="ll-pulse"><span class="ll-ring"></span><span class="ll-dot"></span></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    L.marker([latitude, longitude], { icon }).addTo(group);
    map.panTo([latitude, longitude]);
    webLayerRef.current = group;
  }, [location, webReady]);

  useEffect(() => {
    if (Platform.OS === 'web' || !location || !webViewRef.current) return;
    const { latitude, longitude, accuracy } = location.coords;
    webViewRef.current.injectJavaScript(
      `window.updateLL && window.updateLL(${latitude}, ${longitude}, ${accuracy || 20}); true;`
    );
  }, [location]);

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return <View ref={webContainerRef} style={styles.map} />;
    }
    if (!mapHtml) return <View style={styles.map} />;
    return (
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={goBack} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Location</Text>
          {isSharing && (
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapWrap}>
        {isSharing && location ? (
          <>
            {renderMap()}

            <View style={styles.statusCard}>
              <View style={styles.statusLeft}>
                <View style={styles.radarIconBox}>
                  <Ionicons name="radio" size={18} color="#007A43" />
                </View>
                <View>
                  <Text style={styles.statusTitle}>Sharing live location</Text>
                  <Text style={styles.statusTimer}>{formatTime(elapsed)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.stopPill} onPress={stopSharing} activeOpacity={0.8}>
                <Feather name="square" size={12} color="#FFFFFF" />
                <Text style={styles.stopPillText}>Stop</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Feather name="map-pin" size={16} color="#007A43" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle} numberOfLines={1}>
                  {location.address || 'Current location'}
                </Text>
                <Text style={styles.addressCoords}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                  {location.coords.accuracy ? `  ·  ±${Math.round(location.coords.accuracy)}m` : ''}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="navigate-circle" size={64} color="#007A43" />
            </View>
            <Text style={styles.placeholderTitle}>Share your live location</Text>
            <Text style={styles.placeholderText}>
              Let trusted contacts follow your journey in real time during emergencies or travel.
            </Text>
            {starting && <ActivityIndicator color="#007A43" style={{ marginTop: 16 }} />}
          </View>
        )}
      </View>

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Feather name="alert-triangle" size={16} color="#991B1B" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.sheet}>
        {!isSharing && (
          <>
            <Text style={styles.sheetLabel}>Share for</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.durationRow}
            >
              {DURATIONS.map((opt) => {
                const active = duration === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.durationChip, active && styles.durationChipActive]}
                    onPress={() => setDuration(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.durationChipText, active && styles.durationChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Sharing with</Text>
          <Text style={styles.sheetCount}>{selectedContacts.length} selected</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contactRow}
        >
          {CONTACTS.map((person) => {
            const active = selected.includes(person.id);
            return (
              <TouchableOpacity
                key={person.id}
                style={styles.contactItem}
                onPress={() => toggleContact(person.id)}
                activeOpacity={0.8}
              >
                <View style={styles.contactAvatarWrap}>
                  <View style={[styles.contactAvatar, { backgroundColor: avatarColor(person.id) }]}>
                    <Text style={styles.contactInitial}>{person.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={[styles.checkBadge, active ? styles.checkBadgeOn : styles.checkBadgeOff]}>
                    <Feather name={active ? 'check' : 'plus'} size={11} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={[styles.contactName, active && styles.contactNameActive]} numberOfLines={1}>
                  {person.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isSharing ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryAction} onPress={shareLink} activeOpacity={0.8}>
              <Feather name="link" size={16} color="#007A43" />
              <Text style={styles.secondaryActionText}>Share link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={sendSms}
              disabled={sendingSms}
              activeOpacity={0.8}
            >
              {sendingSms ? (
                <ActivityIndicator size="small" color="#007A43" />
              ) : (
                <Feather name="message-circle" size={16} color="#007A43" />
              )}
              <Text style={styles.secondaryActionText}>Send SMS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, starting && styles.startButtonDisabled]}
            onPress={startSharing}
            disabled={starting}
            activeOpacity={0.85}
          >
            {starting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="navigation" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.startButtonText}>
              {starting ? 'Starting…' : 'Start sharing location'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#DC2626', letterSpacing: 1 },

  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E8F0EA',
  },
  map: { flex: 1, backgroundColor: '#E8F0EA' },

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  placeholderIcon: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0px 6px 16px rgba(0, 122, 67, 0.15)',
  },
  placeholderTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  placeholderText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  statusCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  radarIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  statusTimer: { fontSize: 12, color: '#6B7280', marginTop: 1, fontVariant: ['tabular-nums'] },
  stopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stopPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  addressCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  addressCoords: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { flex: 1, color: '#991B1B', fontSize: 12, fontWeight: '600' },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  sheetLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  durationRow: { gap: 8, paddingBottom: 14 },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  durationChipActive: { backgroundColor: '#007A43' },
  durationChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  durationChipTextActive: { color: '#FFFFFF' },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sheetCount: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },

  contactRow: { gap: 16, paddingBottom: 4 },
  contactItem: { alignItems: 'center', width: 56 },
  contactAvatarWrap: { position: 'relative' },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: { fontSize: 18, fontWeight: '800', color: '#111827' },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkBadgeOn: { backgroundColor: '#007A43' },
  checkBadgeOff: { backgroundColor: '#9CA3AF' },
  contactName: { fontSize: 12, color: '#6B7280', marginTop: 6, fontWeight: '600' },
  contactNameActive: { color: '#111827' },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingVertical: 14,
  },
  secondaryActionText: { fontSize: 13, fontWeight: '700', color: '#007A43' },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007A43',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 16,
  },
  startButtonDisabled: { backgroundColor: '#9CA3AF' },
  startButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
