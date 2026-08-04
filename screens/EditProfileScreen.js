import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { editProfileSchema, validate } from '../utils/validation';
import { getUser, updateUser, uploadAvatar, getAvatarUri } from '../utils/authService';

export default function EditProfileScreen({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFilename, setAvatarFilename] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getUser();
      if (currentUser) {
        setFullName(currentUser.fullName || '');
        setEmail(currentUser.email || '');
        setPhoneNumber(currentUser.phoneNumber || '');
        setAvatarFilename(currentUser.avatar || null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timeout = setTimeout(() => setToastMessage(''), 1400);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photos to change your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Pick failed', 'Could not read the selected image.');
      return;
    }

    const mimeType = asset.mimeType || 'image/jpeg';

    setUploadingAvatar(true);
    try {
      await uploadAvatar(asset.base64, mimeType);
      const refreshed = await getUser();
      setAvatarFilename(refreshed?.avatar || null);
      setToastMessage('Profile picture updated');
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const result = validate(editProfileSchema, {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });
    setErrors(result.errors);
    if (!result.success) return;

    setSaving(true);
    try {
      const payload = { fullName, email, phoneNumber };
      if (password) {
        payload.password = password;
      }
      await updateUser(payload);
      setToastMessage('Profile updated');
      setTimeout(() => {
        onNavigate && onNavigate('Profile');
      }, 1400);
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#007A43" />
      </SafeAreaView>
    );
  }

  const avatarUri = getAvatarUri(avatarFilename);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate && onNavigate('Profile')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
            />
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={pickAvatar}
              disabled={uploadingAvatar}
            >
              <Feather name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9EA5B1"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        {/* Email Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9EA5B1"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Phone Number Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputContainer, errors.phoneNumber && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#9EA5B1"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
        </View>

        {/* New Password Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Leave blank to keep current"
              placeholderTextColor="#9EA5B1"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Feather
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#718096"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm your new password"
              placeholderTextColor="#9EA5B1"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Feather
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#718096"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {toastMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007A43',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  input: {
    fontSize: 15,
    color: '#111827',
    width: '100%',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#007A43',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  toast: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#0F766E',
    alignSelf: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
