import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { cancelSosEvent, createSosEvent } from '../utils/authService';
import { getEmergencyContacts } from '../utils/emergencyContacts';

export default function SosTriggerScreen({ onNavigate }) {
  const [contacts, setContacts] = useState([]);
  const [contactsReady, setContactsReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [sosEventId, setSosEventId] = useState(null);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getEmergencyContacts()
      .then(savedContacts => {
        if (isMounted) setContacts(savedContacts);
      })
      .catch(error => {
        if (isMounted) setFeedback(`Could not load emergency contacts: ${error.message}`);
      })
      .finally(() => {
        if (isMounted) setContactsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSos = async () => {
    if (working || !contactsReady) return;

    setWorking(true);
    setFeedback(null);

    let currentLocation;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission is required to send your location.');
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw new Error('Turn on location services and try again.');
      }

      currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (error) {
      setFeedback(`SOS was not started: ${error.message}`);
      setWorking(false);
      return;
    }

    let recordError = null;
    const controller = new AbortController();
    const recordTimeout = setTimeout(() => controller.abort(), 5000);
    try {
      const locationPayload = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      if (Number.isFinite(currentLocation.coords.accuracy)) {
        locationPayload.accuracy = currentLocation.coords.accuracy;
      }

      const event = await createSosEvent(locationPayload, { signal: controller.signal });
      if (!event?.id) throw new Error('The server did not return an SOS record.');
      setSosEventId(event.id);
    } catch (error) {
      recordError = error;
    } finally {
      clearTimeout(recordTimeout);
    }

    const recordMessage = recordError
      ? `LifeLink could not confirm that the SOS was recorded: ${recordError.message}.`
      : 'The SOS location was recorded.';

    if (contacts.length === 0) {
      setFeedback(`No trusted contacts are saved, so no text was prepared. ${recordMessage} Add contacts or call an emergency hotline.`);
      setWorking(false);
      return;
    }

    try {
      const smsAvailable = await SMS.isAvailableAsync();
      if (!smsAvailable) {
        throw new Error('SMS is not available on this device. Call an emergency hotline directly.');
      }

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;
      const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message = `I need help. My current location is ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. Find me here: ${mapUrl}`;
      const result = await SMS.sendSMSAsync(
        contacts.map(contact => contact.phone),
        message
      );

      if (result.result === 'sent') {
        setFeedback(`The SMS app reported the message as sent; delivery is not guaranteed. ${recordMessage}`);
      } else if (result.result === 'cancelled') {
        setFeedback(`The SMS was cancelled and no message was sent. ${recordMessage}`);
      } else {
        setFeedback(`The SMS app was opened. Review the message and tap Send; delivery status is unavailable. ${recordMessage}`);
      }
    } catch (error) {
      setFeedback(`Could not open the SMS composer: ${error.message} ${recordMessage}`);
    } finally {
      setWorking(false);
    }
  };

  const handleCancel = () => {
    if (!sosEventId) {
      onNavigate('Home');
      return;
    }

    Alert.alert(
      'Cancel this SOS?',
      'This marks the SOS as cancelled in LifeLink. It cannot recall a text that was already sent.',
      [
        { text: 'Keep SOS active', style: 'cancel' },
        {
          text: 'Cancel SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSosEvent(sosEventId);
              setSosEventId(null);
              setFeedback('SOS marked as cancelled. Any SMS already sent cannot be recalled.');
            } catch (error) {
              Alert.alert('Could not cancel SOS', error.message);
            }
          },
        },
      ]
    );
  };

  const openMap = () => {
    if (!location) return;
    onNavigate('Map', {
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} accessibilityLabel="Cancel SOS or return home">
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Emergency</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.radarOuter}>
          <View style={styles.radarMiddle}>
            <TouchableOpacity
              style={[styles.sosButton, working && styles.sosButtonDisabled]}
              activeOpacity={0.8}
              onLongPress={handleSos}
              delayLongPress={600}
              disabled={working || !contactsReady}
              accessibilityRole="button"
              accessibilityLabel="Press and hold to prepare an SOS text"
            >
              {working ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Text style={styles.sosButtonText}>SOS</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.instructions}>
          {working
            ? 'Getting your location...'
            : contactsReady
              ? 'Press and hold to prepare SOS text'
              : 'Loading emergency contacts...'}
        </Text>
        <Text style={styles.subInstructions}>
          LifeLink records your location and prepares a text for your trusted contacts. You must review and tap Send in your SMS app.
        </Text>

        <View style={styles.locationCard}>
          <Ionicons name="location-outline" size={24} color="#111827" style={styles.locationIcon} />
          <View style={styles.locationDetails}>
            <Text style={styles.locationTitle}>Your Location</Text>
            {location ? (
              <>
                <Text style={styles.locationAddress}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.accuracyText}>
                  {Number.isFinite(location.coords.accuracy)
                    ? `Accuracy: about ${Math.round(location.coords.accuracy)} m`
                    : 'Accuracy unavailable'}
                </Text>
                <TouchableOpacity onPress={openMap} style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>View location on map</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.locationAddress}>Location is captured when you trigger SOS.</Text>
            )}
          </View>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

        <TouchableOpacity
          style={styles.contactsButton}
          onPress={() => onNavigate('EmergencyContacts')}
        >
          <Text style={styles.contactsButtonText}>Manage emergency contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>
            {sosEventId ? 'Cancel SOS' : 'Back to Home'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  radarOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  radarMiddle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  sosButtonDisabled: { opacity: 0.7 },
  sosButtonText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  instructions: { fontSize: 18, fontWeight: '800', color: '#DC2626', marginBottom: 8 },
  subInstructions: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 14,
  },
  locationIcon: { marginRight: 12 },
  locationDetails: { flex: 1 },
  locationTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  locationAddress: { fontSize: 13, color: '#4B5563', marginVertical: 3 },
  accuracyText: { fontSize: 12, color: '#6B7280' },
  mapButton: { alignSelf: 'flex-start', marginTop: 8 },
  mapButtonText: { color: '#007A43', fontSize: 13, fontWeight: '700' },
  feedback: {
    color: '#7F1D1D',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  contactsButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  contactsButtonText: { color: '#007A43', fontSize: 14, fontWeight: '700' },
  cancelButton: {
    width: '100%',
    backgroundColor: '#DC2626',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
