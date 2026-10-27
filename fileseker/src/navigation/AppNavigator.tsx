import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged, User } from '@react-native-firebase/auth';
import BottomNavigation, { MainTab } from '../components/BottomNavigation';
import { colors } from '../assets/theme';
import AttendanceScreen from '../screens/AttendanceScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import {
  checkIn,
  checkOut,
  loadTodayAttendance,
  loadUserProfile,
  logoutAccount,
  UserProfile,
} from '../services/accountService';
import { auth } from '../services/firebase';
import { getFirebaseErrorMessage } from '../services/firebaseErrors';
import { GeoLocation } from '../types/attendance';

function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'registration'>(
    'login',
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [authError, setAuthError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [checkedOutAt, setCheckedOutAt] = useState<Date | null>(null);
  const [checkedInLocation, setCheckedInLocation] =
    useState<GeoLocation | null>(null);
  const [checkedOutLocation, setCheckedOutLocation] =
    useState<GeoLocation | null>(null);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        if (!isActive) {
          return;
        }

        if (!user) {
          setAuthError('');
          setProfile(null);
          setProfileError('');
          setCheckedInAt(null);
          setCheckedOutAt(null);
          setCheckedInLocation(null);
          setCheckedOutLocation(null);
          setAttendanceError('');
          setAuthLoading(false);
          setCurrentScreen('login');
          return;
        }

        setAuthError('');
        setAuthLoading(true);
        setCurrentScreen('login');
        setActiveTab('home');
        setAttendanceLoading(true);

        loadUserProfile(user)
          .then(value => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setProfile(value);
              setProfileError('');
              setCurrentScreen('login');
            }
          })
          .catch(error => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setProfile({
                uid: user.uid,
                name:
                  user.displayName ?? user.email?.split('@')[0] ?? 'Account',
                email: user.email ?? '',
              });
              setProfileError(
                getFirebaseErrorMessage(
                  error,
                  'Could not load your saved profile.',
                ),
              );
              setCurrentScreen('login');
            }
          })
          .finally(() => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setAuthLoading(false);
            }
          });

        loadTodayAttendance(user.uid)
          .then(attendance => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setCheckedInAt(attendance.checkInAt);
              setCheckedOutAt(attendance.checkOutAt);
              setCheckedInLocation(attendance.checkInLocation);
              setCheckedOutLocation(attendance.checkOutLocation);
              setAttendanceError('');
            }
          })
          .catch(error => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setAttendanceError(
                getFirebaseErrorMessage(
                  error,
                  'Could not load today’s attendance.',
                ),
              );
            }
          })
          .finally(() => {
            if (isActive && auth.currentUser?.uid === user.uid) {
              setAttendanceLoading(false);
            }
          });
      },
      error => {
        if (isActive) {
          setAuthError(
            getFirebaseErrorMessage(
              error,
              'Could not check your sign-in state.',
            ),
          );
          setAuthLoading(false);
        }
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const handleCheckIn = async () => {
    if (!profile) {
      return;
    }

    try {
      const result = await checkIn(profile.uid);
      setCheckedInAt(result.time);
      setCheckedOutAt(null);
      setCheckedInLocation(result.location);
      setCheckedOutLocation(null);
      setAttendanceError('');
    } catch (error) {
      setAttendanceError(
        getFirebaseErrorMessage(error, 'Could not save your check-in.'),
      );
    }
  };

  const handleCheckOut = async () => {
    if (!profile) {
      return;
    }

    try {
      const result = await checkOut(profile.uid);
      setCheckedOutAt(result.time);
      setCheckedOutLocation(result.location);
      setAttendanceError('');
    } catch (error) {
      setAttendanceError(
        getFirebaseErrorMessage(error, 'Could not save your check-out.'),
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutAccount();
    } catch (error) {
      setProfileError(getFirebaseErrorMessage(error, 'Could not sign out.'));
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading your account…</Text>
      </View>
    );
  }

  if (profile) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.mainContainer}>
        <View style={styles.screenContainer}>
          {activeTab === 'home' ? (
            <HomeScreen
              attendanceError={attendanceError}
              attendanceLoading={attendanceLoading}
              checkedInAt={checkedInAt}
              checkedOutAt={checkedOutAt}
              checkedInLocation={checkedInLocation}
              checkedOutLocation={checkedOutLocation}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onOpenAttendance={() => setActiveTab('attendance')}
              onOpenProfile={() => setActiveTab('profile')}
              profile={profile}
            />
          ) : null}
          {activeTab === 'attendance' ? (
            <AttendanceScreen userId={profile.uid} />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              error={profileError}
              onSignOut={handleSignOut}
              profile={profile}
            />
          ) : null}
        </View>
        <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'registration') {
    return (
      <RegistrationScreen onNavigateToLogin={() => setCurrentScreen('login')} />
    );
  }

  return (
    <LoginScreen
      serviceError={authError}
      onNavigateToRegistration={() => setCurrentScreen('registration')}
    />
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#F7F8FC',
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 14,
  },
});

export default AppNavigator;
