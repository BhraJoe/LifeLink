import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createIncident, getUser } from '../utils/authService';

export default function ReportIncidentScreen({ onNavigate, onGoBack }) {
  const [selectedType, setSelectedType] = useState('Accident');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    getUser().then(setUser);
  }, []);

  const incidentTypes = [
    { id: 'Accident', label: 'Accident', icon: 'car-crash' },
    { id: 'Fire', label: 'Fire', icon: 'fire' },
    { id: 'Flood', label: 'Flood', icon: 'water' },
    { id: 'Pothole', label: 'Pothole', icon: 'road' },
    { id: 'Other', label: 'Other', icon: 'ellipsis-h' },
  ];

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to auto-fill your location.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const parts = [address.name, address.city, address.region].filter(Boolean);
      setLocation(parts.join(', ') || `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
    } catch (err) {
      console.error('Location error:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets?.length) {
        const picked = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64,
          type: asset.mimeType || 'image/jpeg',
        }));
        setImages((prev) => [...prev, ...picked].slice(0, 5));
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || images.length === 0) {
      Alert.alert('Incomplete Form', 'Please fill in the title, description, location, and add at least one photo.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        type: selectedType,
        title,
        description,
        location,
        latitude,
        longitude,
        images: images.map((img) => img.base64).filter(Boolean),
        reportedBy: user?.fullName || 'anonymous',
      };

      await createIncident(payload);
      setTitle('');
      setDescription('');
      setImages([]);
      setSelectedType('Accident');
      if (onGoBack) {
        onGoBack();
      } else {
        onNavigate('Home');
      }
    } catch (err) {
      console.error('Submit incident error:', err);
      Alert.alert('Error', err.message || 'Failed to submit incident report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack || (() => onNavigate('Home'))}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Horizontal Incident Type Selectors */}
        <Text style={styles.sectionTitle}>Incident Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesRow}>
          {incidentTypes.map(item => {
            const isSelected = selectedType === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.typeBox, isSelected && styles.typeBoxSelected]}
                onPress={() => setSelectedType(item.id)}
              >
                <FontAwesome5 name={item.icon} size={20} color={isSelected ? '#007A43' : '#6B7280'} />
                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Title Field */}
        <Text style={styles.sectionTitle}>Title *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Brief title for the incident"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Location Form */}
        <Text style={styles.sectionTitle}>Location *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Incident location"
            maxLength={200}
          />
        </View>
        <TouchableOpacity style={styles.locationLink} onPress={getCurrentLocation}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#007A43" />
          ) : (
            <Text style={styles.locationLinkText}>Use current location</Text>
          )}
        </TouchableOpacity>

        {/* Description Field */}
        <Text style={styles.sectionTitle}>Description *</Text>
        <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: 'top' }]}
            placeholder="Describe what happened..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />
        </View>

        {/* Photos Grid */}
        <Text style={styles.sectionTitle}>Add Photos</Text>
        <View style={styles.photoGrid}>
          <TouchableOpacity style={styles.addPhotoCard} onPress={pickImage}>
            <Feather name="camera" size={24} color="#6B7280" />
          </TouchableOpacity>

          {images.map((img, index) => (
            <View key={index} style={styles.photoThumb}>
              <Image source={{ uri: img.uri }} style={styles.thumbImg} />
              <TouchableOpacity style={styles.closeBadge} onPress={() => setImages((prev) => prev.filter((_, i) => i !== index))}>
                <Ionicons name="close" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 18, marginBottom: 8 },
  typesRow: { flexDirection: 'row', marginBottom: 10 },
  typeBox: { width: 72, height: 72, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  typeBoxSelected: { borderColor: '#007A43', backgroundColor: '#F0FDF4' },
  typeLabel: { fontSize: 12, color: '#6B7280', marginTop: 6, fontWeight: '500' },
  typeLabelSelected: { color: '#007A43', fontWeight: '700' },
  inputContainer: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  input: { fontSize: 14, color: '#111827', width: '100%' },
  locationLink: { marginTop: 6, marginBottom: 10 },
  locationLinkText: { fontSize: 13, color: '#007A43', fontWeight: '700' },
  optional: { fontSize: 13, fontWeight: '400', color: '#6B7280' },
  photoGrid: { flexDirection: 'row', alignItems: 'center' },
  addPhotoCard: { width: 72, height: 72, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  photoThumb: { width: 72, height: 72, borderRadius: 14, marginRight: 12, position: 'relative' },
  thumbImg: { width: '100%', height: '100%', borderRadius: 14 },
  closeBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#111827', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  submitButton: { backgroundColor: '#007A43', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
