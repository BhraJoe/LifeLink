import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Decorative Cloud Background Elements */}
      <View style={styles.cloudLeft}>
        <Ionicons name="cloud" size={70} color="rgba(255, 255, 255, 0.08)" />
      </View>
      <View style={styles.cloudRight}>
        <Ionicons name="cloud" size={90} color="rgba(255, 255, 255, 0.08)" />
      </View>

      {/* Main Branding Section */}
      <View style={styles.contentContainer}>
        {/* Heart + Cross Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.heartWrapper}>
            <Ionicons name="heart" size={120} color="#00C853" />
            <View style={styles.crossOverlay}>
              <Ionicons name="add" size={32} color="#003D29" style={{ fontWeight: 'bold' }} />
            </View>
          </View>
        </View>

        {/* App Title */}
        <Text style={styles.title}>
          Life<Text style={{ color: '#00C853' }}>Link</Text>
        </Text>

        {/* Main Tagline */}
        <Text style={styles.mainTagline}>
          Connecting communities.{'\n'}Saving lives.
        </Text>

        {/* Sub-Tagline */}
        <Text style={styles.subTagline}>
          Get help. Give help.{'\n'}Build a safer Ghana.
        </Text>
      </View>

      {/* City Skyline Background Silhouette */}
      <View style={styles.skylineContainer}>
        <View style={[styles.building, { height: 40, width: 30 }]} />
        <View style={[styles.building, { height: 70, width: 45 }]} />
        <View style={[styles.building, { height: 50, width: 35 }]} />
        <View style={[styles.building, { height: 85, width: 50 }]} />
        <View style={[styles.building, { height: 60, width: 40 }]} />
      </View>

      {/* Bottom Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          activeOpacity={0.8}
          onPress={() => onNavigate && onNavigate('SIGN_UP')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('SIGN_IN')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003D29',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  cloudLeft: {
    position: 'absolute',
    top: 40,
    left: -10,
  },
  cloudRight: {
    position: 'absolute',
    top: 20,
    right: -20,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossOverlay: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  mainTagline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
  },
  subTagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  skylineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 120,
    width: '100%',
    opacity: 0.12,
  },
  building: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  buttonText: {
    color: '#007A43',
    fontSize: 18,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loginLink: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: '700',
  },
});
