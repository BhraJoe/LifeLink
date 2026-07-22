import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { isLoggedIn } from './utils/authService';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import MapScreen from './screens/MapScreen';
import SosTriggerScreen from './screens/SosTriggerScreen';
import AlertsScreen from './screens/AlertsScreen';
import ReportIncidentScreen from './screens/ReportIncidentScreen';
import FindHospitalScreen from './screens/FindHospitalScreen';
import BloodDonorsScreen from './screens/BloodDonorsScreen';
import LiveLocationScreen from './screens/LiveLocationScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOADING');
  const [initializing, setInitializing] = useState(true);
  const hasResolvedAuth = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
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

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (screen) => {
    hasResolvedAuth.current = true;
    setCurrentScreen(screen);
    setInitializing(false);
  };

  if (initializing) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007A43" />
        </View>
      </SafeAreaProvider>
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
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'SosTrigger':
        return <SosTriggerScreen onNavigate={handleNavigate} />;
      case 'Alerts':
        return <AlertsScreen onNavigate={handleNavigate} />;
      case 'ReportIncident':
        return <ReportIncidentScreen onNavigate={handleNavigate} />;
      case 'FindHospital':
        return <FindHospitalScreen onNavigate={handleNavigate} />;
      case 'BloodDonors':
        return <BloodDonorsScreen onNavigate={handleNavigate} />;
      case 'LiveLocation':
        return <LiveLocationScreen onNavigate={handleNavigate} />;
      case 'SIGN_IN':
        return <LoginScreen onNavigate={handleNavigate} />;
      case 'SIGN_UP':
        return <SignUpScreen onNavigate={handleNavigate} />;
      case 'FORGET_PASSWORD':
        return <ForgotPasswordScreen onNavigate={handleNavigate} />;
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
