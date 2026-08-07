import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { isLoggedIn } from './utils/authService';
import { registerForPushNotificationsAsync } from './utils/notifications';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MapScreen from './screens/MapScreen';
import SosTriggerScreen from './screens/SosTriggerScreen';
import AlertsScreen from './screens/AlertsScreen';
import ReportIncidentScreen from './screens/ReportIncidentScreen';
import FindHospitalScreen from './screens/FindHospitalScreen';
import BloodDonorsScreen from './screens/BloodDonorsScreen';
import LiveLocationScreen from './screens/LiveLocationScreen';
import FindPharmacyScreen from './screens/FindPharmacyScreen';
import VolunteerScreen from './screens/VolunteerScreen';
import MissingPersonScreen from './screens/MissingPersonScreen';
import DisasterAlertsScreen from './screens/DisasterAlertsScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';
import SettingsScreen from './screens/SettingsScreen';
import BloodDonorProfileScreen from './screens/BloodDonorProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOADING');
  const [currentScreenParams, setCurrentScreenParams] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [screenStack, setScreenStack] = useState([]);
  const hasResolvedAuth = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await registerForPushNotificationsAsync();
      } catch (err) {
        console.error('Push notification setup failed:', err);
      }

      try {
        const loggedIn = await isLoggedIn();
        if (isMounted && !hasResolvedAuth.current) {
          hasResolvedAuth.current = true;
          setCurrentScreen(loggedIn ? 'HOME' : 'WELCOME');
          setInitializing(false);
        }
      } catch (error) {
        if (isMounted && !hasResolvedAuth.current) {
          hasResolvedAuth.current = true;
          setCurrentScreen('WELCOME');
          setInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (screen, params = null, options = {}) => {
    const { replace = false } = options;
    hasResolvedAuth.current = true;
    setScreenStack(prev => {
      if (replace) return prev;
      // push currentScreen onto stack unless it's the same
      if (!currentScreen || currentScreen === 'LOADING') return prev;
      return [...prev, currentScreen];
    });
    setCurrentScreen(screen);
    setCurrentScreenParams(params);
    setInitializing(false);
  };

  const handleGoBack = () => {
    setScreenStack(prev => {
      if (!prev || prev.length === 0) {
        // fallback to HOME
        setCurrentScreen('HOME');
        return [];
      }
      const newStack = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setCurrentScreen(last);
      return newStack;
    });
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#007A43" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'WELCOME':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      case 'HOME':
      case 'Home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'Map':
        return <MapScreen onNavigate={handleNavigate} />;
      case 'Community':
        return <CommunityScreen onNavigate={handleNavigate} />;
      case 'Profile':
        return <ProfileScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'EditProfile':
        return <EditProfileScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'SosTrigger':
        return <SosTriggerScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'Alerts':
        return <AlertsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'ReportIncident':
        return <ReportIncidentScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'FindHospital':
        return <FindHospitalScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'BloodDonors':
        return <BloodDonorsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'BloodDonorProfile':
        return <BloodDonorProfileScreen onNavigate={handleNavigate} onGoBack={handleGoBack} routeParams={currentScreenParams} />;
      case 'LiveLocation':
        return <LiveLocationScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'FindPharmacy':
        return <FindPharmacyScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'Volunteer':
        return <VolunteerScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'MissingPersons':
        return <MissingPersonScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'DisasterAlerts':
        return <DisasterAlertsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'Settings':
        return <SettingsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'About':
        return <AboutScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'Help':
        return <HelpScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'EmergencyContacts':
        return <EmergencyContactsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'SIGN_IN':
        return <LoginScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'SIGN_UP':
        return <SignUpScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      case 'FORGET_PASSWORD':
        return <ForgotPasswordScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />;
      default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
