import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getIncidents } from '../utils/authService';

const DEFAULT_CENTER = { latitude: 5.6037, longitude: -0.187 };
const DEFAULT_ZOOM = 13;

const TYPE_COLORS = {
  Flood: '#3B82F6',
  Fire: '#EF4444',
  Pothole: '#F59E0B',
  Accident: '#EAB308',
  default: '#10B981',
};

export default function MapScreen({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      let center = DEFAULT_CENTER;
      let zoom = DEFAULT_ZOOM;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const userCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(userCoords);
        center = userCoords;
        zoom = 14;
      }

      const data = await getIncidents();
      const withCoords = (data || []).filter(
        (inc) => inc.latitude != null && inc.longitude != null
      );
      setIncidents(withCoords);
    } catch (err) {
      console.error('MapScreen load error:', err);
      setError(err.message || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!mapRef.current) return;

    let scriptEl = null;
    let linkEl = null;

    const initWebMap = async () => {
      try {
        if (!document.getElementById('leaflet-css')) {
          linkEl = document.createElement('link');
          linkEl.id = 'leaflet-css';
          linkEl.rel = 'stylesheet';
          linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(linkEl);
        }

        const existingScript = document.getElementById('leaflet-js');
        if (existingScript) {
          if (!leafletMapRef.current) {
            buildAndInitMap(window.L);
          }
          return;
        }

        await new Promise((resolve, reject) => {
          scriptEl = document.createElement('script');
          scriptEl.id = 'leaflet-js';
          scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          scriptEl.onload = resolve;
          scriptEl.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.head.appendChild(scriptEl);
        });

        buildAndInitMap(window.L);
      } catch (err) {
        console.error('Failed to initialize web map:', err);
        setError('Failed to initialize map');
      }
    };

    const buildAndInitMap = (L) => {
      const container = mapRef.current;
      if (!container) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const center = userLocation || DEFAULT_CENTER;
      const zoom = userLocation ? 14 : DEFAULT_ZOOM;
      map.setView([center.latitude, center.longitude], zoom);

      incidents.forEach((inc) => {
        const color = TYPE_COLORS[inc.type] || TYPE_COLORS.default;
        L.circleMarker([inc.latitude, inc.longitude], {
          radius: 8,
          fillColor: color,
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(
            `<b>${inc.title || inc.type}</b><br/>${inc.location || ''}<br/><small>${new Date(inc.createdAt).toLocaleString()}</small>`
          );
      });

      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 10,
          fillColor: '#007A43',
          color: '#FFFFFF',
          weight: 3,
          opacity: 1,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup('<b>Your location</b>');
      }

      leafletMapRef.current = map;
    };

    initWebMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [Platform.OS, userLocation, incidents]);

  const getMarkerColor = (type) => {
    if (!type) return TYPE_COLORS.default;
    return TYPE_COLORS[type] || TYPE_COLORS.default;
  };

  const center = userLocation || DEFAULT_CENTER;
  const zoom = userLocation ? 14 : DEFAULT_ZOOM;

  const buildHtml = () => {
    const markers = incidents
      .map((inc) => {
        const color = getMarkerColor(inc.type);
        return `
          L.circleMarker([${inc.latitude}, ${inc.longitude}], {
            radius: 8,
            fillColor: '${color}',
            color: '#FFFFFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(map)
            .bindPopup(\`<b>${inc.title || inc.type}</b><br/>${inc.location || ''}<br/><small>${new Date(inc.createdAt).toLocaleString()}</small>\`);
        `;
      })
      .join('\n');

    const userMarker = userLocation
      ? `
      L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
        radius: 10,
        fillColor: '#007A43',
        color: '#FFFFFF',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup('<b>Your location</b>');`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${center.latitude}, ${center.longitude}], ${zoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    ${markers}
    ${userMarker}
  </script>
</body>
</html>`;
  };

  const html = buildHtml();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('Home')}>
            <Feather name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Map</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Map {incidents.length > 0 ? `(${incidents.length})` : ''}
        </Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color="#007A43" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A43" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <View ref={mapRef} style={styles.webMapContainer} />
      ) : (
        <WebView
          key={html}
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  refreshButton: { padding: 4 },
  webView: { flex: 1, backgroundColor: '#E5E7EB' },
  webMapContainer: { flex: 1, backgroundColor: '#E5E7EB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007A43',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
