import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const DEFAULT_CENTER = { latitude: 5.6037, longitude: -0.187 };

export default function HospitalMap({ hospitals, userLocation, selectedHospital }) {
  const mapRef = useRef(null);
  const center = selectedHospital || userLocation || DEFAULT_CENTER;

  useEffect(() => {
    if ((!selectedHospital && !userLocation) || !mapRef.current) return;
    const focus = selectedHospital || userLocation;
    mapRef.current.animateToRegion({
      latitude: focus.latitude,
      longitude: focus.longitude,
      latitudeDelta: selectedHospital ? 0.02 : 0.12,
      longitudeDelta: selectedHospital ? 0.02 : 0.12,
    }, 500);
  }, [selectedHospital, userLocation]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      }}
      showsUserLocation={!!userLocation}
      showsMyLocationButton
    >
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          coordinate={{ latitude: hospital.latitude, longitude: hospital.longitude }}
          title={hospital.name}
          description={hospital.address}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
});
