import Constants from 'expo-constants';
import { Platform } from 'react-native';

let notifications;

function getNotifications() {
  if (!notifications) {
    notifications = require('expo-notifications');
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  return notifications;
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android' && Constants.expoGoConfig) {
    return null;
  }

  const Notifications = getNotifications();
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  try {
    const expoPushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    token = expoPushToken.data;
  } catch (err) {
    console.error('Error getting push token:', err);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export function setupNotificationListeners(onNotification, onResponse) {
  const Notifications = getNotifications();
  const subscription1 = Notifications.addNotificationReceivedListener(onNotification);
  const subscription2 = Notifications.addNotificationResponseReceivedListener(onResponse);

  return () => {
    subscription1.remove();
    subscription2.remove();
  };
}
