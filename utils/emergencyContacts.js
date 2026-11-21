import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = 'lifelink_emergency_contacts';

export async function getEmergencyContacts() {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY);
  if (!raw) return [];

  const contacts = JSON.parse(raw);
  if (
    !Array.isArray(contacts) ||
    contacts.some(
      contact =>
        !contact ||
        typeof contact.id !== 'string' ||
        typeof contact.name !== 'string' ||
        typeof contact.phone !== 'string'
    )
  ) {
    throw new Error('Saved emergency contacts are invalid.');
  }

  return contacts;
}

export async function saveEmergencyContacts(contacts) {
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}
