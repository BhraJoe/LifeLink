import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function ReportIncidentScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('Accident');

  const incidentTypes = [
    { id: 'Accident', label: 'Accident', icon: 'car-crash' },
    { id: 'Fire', label: 'Fire', icon: 'fire' },
    { id: 'Flood', label: 'Flood', icon: 'water' },
    { id: 'Pothole', label: 'Pothole', icon: 'road' },
    { id: 'Other', label: 'Other', icon: 'ellipsis-h' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
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

        {/* Location Form */}
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} defaultValue="Lapaz, Accra" />
        </View>
        <TouchableOpacity style={styles.locationLink}>
          <Text style={styles.locationLinkText}>Use current location</Text>
        </TouchableOpacity>

        {/* Description Field */}
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: 'top' }]}
            placeholder="Describe what happened..."
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        {/* Photos Grid */}
        <Text style={styles.sectionTitle}>Add Photos <Text style={styles.optional}>(Optional)</Text></Text>
        <View style={styles.photoGrid}>
          <TouchableOpacity style={styles.addPhotoCard}>
            <Feather name="camera" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.photoThumb}>
            <Image source={{ uri: 'https://picsum.photos/100/100?random=1' }} style={styles.thumbImg} />
            <TouchableOpacity style={styles.closeBadge}><Ionicons name="close" size={12} color="#FFF" /></TouchableOpacity>
          </View>

          <View style={styles.photoThumb}>
            <Image source={{ uri: 'https://picsum.photos/100/100?random=2' }} style={styles.thumbImg} />
            <TouchableOpacity style={styles.closeBadge}><Ionicons name="close" size={12} color="#FFF" /></TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit Report</Text>
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
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
