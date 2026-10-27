import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../assets/theme';
import PrimaryButton from '../components/PrimaryButton';
import { UserProfile } from '../services/accountService';
import { GeoLocation } from '../types/attendance';

interface HomeScreenProps {
  profile: UserProfile;
  checkedInAt: Date | null;
  checkedOutAt: Date | null;
  checkedInLocation: GeoLocation | null;
  checkedOutLocation: GeoLocation | null;
  attendanceLoading: boolean;
  attendanceError: string;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onOpenAttendance: () => void;
  onOpenProfile: () => void;
}

function formatLocation(location: GeoLocation) {
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function HomeScreen({
  profile,
  checkedInAt,
  checkedOutAt,
  checkedInLocation,
  checkedOutLocation,
  attendanceLoading,
  attendanceError,
  onCheckIn,
  onCheckOut,
  onOpenAttendance,
  onOpenProfile,
}: HomeScreenProps) {
  const [now, setNow] = useState(() => new Date());
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = checkedInAt !== null && checkedOutAt === null;
  const handleAttendancePress = async (action: 'checkIn' | 'checkOut') => {
    if (
      attendanceLoading ||
      isUpdatingAttendance ||
      (action === 'checkIn' && (checkedInAt !== null || checkedOutAt !== null)) ||
      (action === 'checkOut' && !isCheckedIn)
    ) {
      return;
    }

    setIsUpdatingAttendance(true);
    try {
      await (action === 'checkIn' ? onCheckIn() : onCheckOut());
    } catch (error) {
      Alert.alert(
        'Attendance update failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>FILESEEKER · WORKSPACE</Text>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>
            {profile.name.split(' ')[0] || 'Welcome'} 👋
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={onOpenProfile}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials(profile.name)}</Text>
        </Pressable>
      </View>

      <View style={styles.clockCard}>
        <View style={styles.clockCardTop}>
          <View>
            <Text style={styles.cardEyebrow}>YOUR LOCAL TIME</Text>
            <Text style={styles.clock}>
              {now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Text>
            <Text style={styles.date}>
              {now.toLocaleDateString([], {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.clockDecoration}>
            <Text style={styles.clockDecorationText}>◷</Text>
          </View>
        </View>

        <View style={styles.statusLine}>
          <View
            style={[
              styles.statusDot,
              isCheckedIn ? styles.statusDotActive : null,
            ]}
          />
          <Text style={styles.statusText}>
            {checkedOutAt
              ? `Shift completed · Out at ${formatTime(checkedOutAt)}`
              : isCheckedIn
              ? `You’re checked in since ${formatTime(checkedInAt)}`
              : 'You haven’t checked in yet'}
          </Text>
        </View>
        {attendanceLoading ? (
          <ActivityIndicator color={colors.surface} style={styles.loader} />
        ) : (
          <View style={styles.attendanceActions}>
            <View style={styles.attendanceAction}>
              <PrimaryButton
                disabled={
                  isUpdatingAttendance ||
                  checkedInAt !== null ||
                  checkedOutAt !== null
                }
                label={
                  isUpdatingAttendance && !isCheckedIn
                    ? 'Saving…'
                    : checkedOutAt
                    ? 'Shift complete'
                    : isCheckedIn
                    ? 'Checked in'
                    : 'Check in'
                }
                onPress={() => handleAttendancePress('checkIn')}
              />
            </View>
            <View style={styles.attendanceAction}>
              <PrimaryButton
                disabled={isUpdatingAttendance || !isCheckedIn}
                label={
                  isUpdatingAttendance && isCheckedIn
                    ? 'Saving…'
                    : checkedOutAt
                    ? 'Checked out'
                    : 'Check out'
                }
                onPress={() => handleAttendancePress('checkOut')}
                variant="secondary"
              />
            </View>
          </View>
        )}
        {attendanceError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {attendanceError}
          </Text>
        ) : null}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Today at a glance</Text>
        <Text style={styles.sectionCaption}>Your workday</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.purpleIcon]}>
            <Text style={styles.purpleIconText}>↗</Text>
          </View>
          <Text style={styles.statLabel}>CHECK IN</Text>
          <Text style={styles.statValue}>
            {checkedInAt ? formatTime(checkedInAt) : '--:--'}
          </Text>
          {checkedInLocation ? (
            <Text style={styles.statLocation}>
              {formatLocation(checkedInLocation)}
            </Text>
          ) : null}
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.greenIcon]}>
            <Text style={styles.greenIconText}>↙</Text>
          </View>
          <Text style={styles.statLabel}>CHECK OUT</Text>
          <Text style={styles.statValue}>
            {checkedOutAt ? formatTime(checkedOutAt) : '--:--'}
          </Text>
          {checkedOutLocation ? (
            <Text style={styles.statLocation}>
              {formatLocation(checkedOutLocation)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onOpenAttendance}
          style={({ pressed }) => [
            styles.actionCard,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={[styles.actionIcon, styles.purpleIcon]}>
            <Text style={styles.purpleIconText}>▦</Text>
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Attendance</Text>
            <Text style={styles.actionSubtitle}>View your work history</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [
            styles.actionCard,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={[styles.actionIcon, styles.blueIcon]}>
            <Text style={styles.blueIconText}>○</Text>
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>My profile</Text>
            <Text style={styles.actionSubtitle}>Your account details</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 32,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  greeting: {
    color: colors.muted,
    fontSize: 16,
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#E9E9FF',
    borderColor: colors.surface,
    borderRadius: 24,
    borderWidth: 3,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  clockCard: {
    backgroundColor: '#25275E',
    borderRadius: 22,
    marginBottom: 27,
    overflow: 'hidden',
    padding: 21,
  },
  clockCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    color: '#B9BAE3',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clock: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 7,
  },
  date: {
    color: '#D1D2ED',
    fontSize: 12,
    marginTop: 5,
  },
  statLocation: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 4,
  },
  clockDecoration: {
    alignItems: 'center',
    backgroundColor: '#393B7B',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  clockDecorationText: {
    color: '#D4D4FF',
    fontSize: 35,
    lineHeight: 42,
  },
  statusLine: {
    alignItems: 'center',
    borderTopColor: '#45477B',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 15,
  },
  statusDot: {
    backgroundColor: '#E9B75C',
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  statusDotActive: {
    backgroundColor: '#68D7A6',
  },
  statusText: {
    color: '#E3E3F5',
    flex: 1,
    fontSize: 12,
  },
  loader: {
    marginTop: 20,
  },
  attendanceActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  attendanceAction: {
    flex: 1,
  },
  error: {
    color: '#FFB7BE',
    fontSize: 12,
    marginTop: 10,
  },
  sectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCaption: {
    color: colors.muted,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 27,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 15,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    marginBottom: 13,
    width: 34,
  },
  purpleIcon: {
    backgroundColor: '#EEEEFF',
  },
  purpleIconText: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '700',
  },
  greenIcon: {
    backgroundColor: '#E6F6EE',
  },
  greenIconText: {
    color: '#25895D',
    fontSize: 19,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  actions: {
    gap: 10,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 13,
  },
  pressed: {
    opacity: 0.75,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  blueIcon: {
    backgroundColor: '#E9F2FF',
  },
  blueIconText: {
    color: '#397BC8',
    fontSize: 20,
  },
  actionCopy: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  chevron: {
    color: colors.muted,
    fontSize: 25,
    marginLeft: 8,
  },
});

export default HomeScreen;
