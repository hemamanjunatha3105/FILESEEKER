import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../assets/theme';
import PrimaryButton from '../components/PrimaryButton';
import { UserProfile } from '../services/accountService';
import { getFirebaseErrorMessage } from '../services/firebaseErrors';

interface ProfileScreenProps {
  profile: UserProfile;
  error: string;
  onSignOut: () => Promise<void>;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function ProfileScreen({ profile, error, onSignOut }: ProfileScreenProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (signOutError) {
      Alert.alert(
        'Could not sign out',
        getFirebaseErrorMessage(signOutError, 'Please try again.'),
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.title}>My profile</Text>
      <Text style={styles.subtitle}>Your personal and work information.</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(profile.name)}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.email}</Text>
        <View style={styles.memberBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.memberText}>Signed in</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account information</Text>
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>✉</Text>
          </View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Email address</Text>
            <Text style={styles.detailValue}>{profile.email}</Text>
          </View>
        </View>
        <View style={[styles.detailRow, styles.lastDetailRow]}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>#</Text>
          </View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Account ID</Text>
            <Text numberOfLines={1} style={styles.detailValue}>
              {profile.uid}
            </Text>
          </View>
        </View>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <PrimaryButton
        disabled={isSigningOut}
        label={isSigningOut ? 'Signing out…' : 'Sign out'}
        onPress={handleSignOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 32,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 5,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 7,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 7,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 22,
    padding: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#E9E9FF',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 13,
  },
  role: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
  },
  memberBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  onlineDot: {
    backgroundColor: '#2A9A68',
    borderRadius: 3,
    height: 6,
    marginRight: 6,
    width: 6,
  },
  memberText: {
    color: '#25895D',
    fontSize: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 25,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  detailRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: '#F1F2F8',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  detailIconText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  detailCopy: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 10,
  },
  detailValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  error: {
    color: colors.error,
    fontSize: 11,
    marginTop: 14,
  },
});

export default ProfileScreen;
