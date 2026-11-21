import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const DEFAULT_CENTER = { latitude: 5.6037, longitude: -0.187 };

export default function HospitalMap({ hospitals, userLocation, selectedHospital }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const hospitalMarkersRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let active = true;

    const initializeMap = async () => {
      try {
        if (!document.getElementById('leaflet-css-hospitals')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css-hospitals';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!window.L) {
          await new Promise((resolve, reject) => {
            let script = document.getElementById('leaflet-js-hospitals');
            if (!script) {
              script = document.createElement('script');
              script.id = 'leaflet-js-hospitals';
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
              return;
            }
            script.addEventListener('load', resolve, { once: true });
            script.addEventListener('error', reject, { once: true });
          });
        }

        if (!active || !containerRef.current) return;
        const L = window.L;
        const map = L.map(containerRef.current, { zoomControl: false }).setView(
          [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude],
          13
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        hospitals.forEach((hospital) => {
          L.marker([hospital.latitude, hospital.longitude])
            .addTo(map)
            .bindPopup(`<b>${hospital.name}</b><br/>${hospital.address}`);
        });
        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Hospital map initialization failed:', error);
      }
    };

    initializeMap();
    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) return;
    if (hospitalMarkersRef.current) {
      hospitalMarkersRef.current.remove();
    }
    hospitalMarkersRef.current = window.L.layerGroup(
      hospitals.map((hospital) =>
        window.L.marker([hospital.latitude, hospital.longitude])
          .bindPopup(`<b>${hospital.name}</b><br/>${hospital.address}`)
      )
    ).addTo(mapRef.current);
  }, [hospitals, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const center = selectedHospital || userLocation || DEFAULT_CENTER;
    mapRef.current.setView(
      [center.latitude, center.longitude],
      selectedHospital ? 15 : 13
    );
  }, [mapReady, selectedHospital, userLocation]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = window.L.circleMarker(
        [userLocation.latitude, userLocation.longitude],
        {
          radius: 8,
          fillColor: '#007A43',
          color: '#FFFFFF',
          weight: 3,
          fillOpacity: 1,
        }
      ).addTo(mapRef.current).bindPopup('<b>Your location</b>');
    }
  }, [mapReady, userLocation]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject, backgroundColor: '#E5E7EB' },
});
