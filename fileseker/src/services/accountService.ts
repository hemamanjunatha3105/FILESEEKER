import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@react-native-firebase/auth';
import {
  GeoPoint,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { AttendanceRecord, GeoLocation } from '../types/attendance';
import { auth, firestore } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
}

export interface TodayAttendance {
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInLocation: GeoLocation | null;
  checkOutLocation: GeoLocation | null;
}

interface AttendanceDocument {
  date: string;
  checkInAt: Timestamp;
  checkInLocation: GeoPoint | null;
  checkOutAt: Timestamp | null;
  checkOutLocation: GeoPoint | null;
}

async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
    const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
    const currentFine = await PermissionsAndroid.check(fine);

    if (currentFine) {
      return;
    }

    const permissions = await PermissionsAndroid.requestMultiple([
      fine,
      coarse,
    ]);
    if (permissions[fine] !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error(
        'Precise location access is required to record attendance. Allow precise location permission in app settings.',
      );
    }
    return;
  }

  await new Promise<void>((resolve, reject) => {
    Geolocation.requestAuthorization(
      () => resolve(),
      error => reject(new Error(error.message)),
    );
  });
}

async function getAttendanceLocation() {
  await requestLocationPermission();

  const position = await new Promise<{
    coords: { latitude: number; longitude: number };
  }>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    });
  }).catch(error => {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case 1:
          throw new Error('Location permission was denied.');
        case 2:
          throw new Error(
            'Current location is unavailable. Turn on device location and try again.',
          );
        case 3:
          throw new Error('Getting your location timed out. Please try again.');
        default:
          break;
      }
    }

    throw error;
  });

  const { latitude, longitude } = position.coords;
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('The device returned an invalid location.');
  }

  return {
    geoPoint: new GeoPoint(latitude, longitude),
  };
}

function parseAttendanceDocument(data: unknown): AttendanceDocument {
  if (typeof data !== 'object' || data === null) {
    throw new Error('An attendance record has invalid data.');
  }

  const record = data as Record<string, unknown>;
  if (
    typeof record.date !== 'string' ||
    !(record.checkInAt instanceof Timestamp) ||
    (record.checkInLocation !== null &&
      record.checkInLocation !== undefined &&
      !(record.checkInLocation instanceof GeoPoint)) ||
    (record.checkOutAt !== null &&
      record.checkOutAt !== undefined &&
      !(record.checkOutAt instanceof Timestamp)) ||
    (record.checkOutLocation !== null &&
      record.checkOutLocation !== undefined &&
      !(record.checkOutLocation instanceof GeoPoint))
  ) {
    throw new Error('An attendance record has invalid data.');
  }

  return {
    date: record.date,
    checkInAt: record.checkInAt,
    checkInLocation:
      record.checkInLocation instanceof GeoPoint
        ? record.checkInLocation
        : null,
    checkOutAt:
      record.checkOutAt instanceof Timestamp ? record.checkOutAt : null,
    checkOutLocation:
      record.checkOutLocation instanceof GeoPoint
        ? record.checkOutLocation
        : null,
  };
}

function userDocument(uid: string) {
  return doc(firestore, 'users', uid);
}

function attendanceCollection(uid: string) {
  return collection(firestore, 'users', uid, 'attendance');
}

async function findActiveAttendance(uid: string) {
  const activeQuery = query(
    attendanceCollection(uid),
    where('checkOutAt', '==', null),
    limit(1),
  );
  const snapshot = await getDocs(activeQuery);
  const document = snapshot.docs[0];
  if (!document) {
    return null;
  }

  return {
    reference: doc(attendanceCollection(uid), document.id),
    data: parseAttendanceDocument(document.data()),
  };
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function registerAccount(
  name: string,
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  await updateProfile(credential.user, { displayName: name.trim() });
  await setDoc(userDocument(credential.user.uid), {
    uid: credential.user.uid,
    name: name.trim(),
    email: credential.user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function loginAccount(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function logoutAccount() {
  await signOut(auth);
}

export async function loadUserProfile(user: User): Promise<UserProfile> {
  const profileSnapshot = await getDoc(userDocument(user.uid));
  const data = profileSnapshot.data();

  return {
    uid: user.uid,
    name:
      typeof data?.name === 'string'
        ? data.name
        : user.displayName ?? user.email?.split('@')[0] ?? 'Account',
    email: user.email ?? '',
  };
}

function attendanceRecordFromData(data: AttendanceDocument): AttendanceRecord {
  const checkInTime = data.checkInAt.toDate();
  const checkOutTime = data.checkOutAt?.toDate() ?? null;
  const workedMilliseconds = checkOutTime
    ? Math.max(0, checkOutTime.getTime() - checkInTime.getTime())
    : 0;
  const totalMinutes = Math.floor(workedMilliseconds / 60000);
  const hours = `${Math.floor(totalMinutes / 60)}h ${String(
    totalMinutes % 60,
  ).padStart(2, '0')}m`;

  return {
    date: data.date,
    checkIn: checkInTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    checkOut: checkOutTime
      ? checkOutTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null,
    status: checkOutTime ? 'Present' : 'In progress',
    hours: checkOutTime ? hours : 'In progress',
    checkInAt: checkInTime,
    checkOutAt: checkOutTime,
    checkInLocation: data.checkInLocation
      ? {
          latitude: data.checkInLocation.latitude,
          longitude: data.checkInLocation.longitude,
        }
      : null,
    checkOutLocation: data.checkOutLocation
      ? {
          latitude: data.checkOutLocation.latitude,
          longitude: data.checkOutLocation.longitude,
        }
      : null,
  };
}

export async function loadTodayAttendance(
  uid: string,
): Promise<TodayAttendance> {
  const activeAttendance = await findActiveAttendance(uid);
  if (activeAttendance) {
    const data = activeAttendance.data;
    return {
      checkInAt: data.checkInAt.toDate(),
      checkOutAt: data.checkOutAt?.toDate() ?? null,
      checkInLocation: data.checkInLocation
        ? {
            latitude: data.checkInLocation.latitude,
            longitude: data.checkInLocation.longitude,
          }
        : null,
      checkOutLocation: data.checkOutLocation
        ? {
            latitude: data.checkOutLocation.latitude,
            longitude: data.checkOutLocation.longitude,
          }
        : null,
    };
  }

  const attendanceSnapshot = await getDoc(
    doc(attendanceCollection(uid), dayKey(new Date())),
  );
  const snapshotData = attendanceSnapshot.data();
  if (!snapshotData) {
    return {
      checkInAt: null,
      checkOutAt: null,
      checkInLocation: null,
      checkOutLocation: null,
    };
  }
  const data = parseAttendanceDocument(snapshotData);

  return {
    checkInAt: data.checkInAt.toDate(),
    checkOutAt: data.checkOutAt?.toDate() ?? null,
    checkInLocation: data.checkInLocation
      ? {
          latitude: data.checkInLocation.latitude,
          longitude: data.checkInLocation.longitude,
        }
      : null,
    checkOutLocation: data.checkOutLocation
      ? {
          latitude: data.checkOutLocation.latitude,
          longitude: data.checkOutLocation.longitude,
        }
      : null,
  };
}

export async function loadAttendance(uid: string) {
  const attendanceQuery = query(
    attendanceCollection(uid),
    orderBy('date', 'desc'),
    limit(31),
  );
  const snapshot = await getDocs(attendanceQuery);

  return snapshot.docs.map(document =>
    attendanceRecordFromData(parseAttendanceDocument(document.data())),
  );
}

export async function checkIn(uid: string) {
  if (await findActiveAttendance(uid)) {
    throw new Error('You are already checked in. Check out before starting another shift.');
  }

  const location = await getAttendanceLocation();
  const date = new Date();
  const reference = doc(attendanceCollection(uid), dayKey(date));

  await runTransaction(firestore, async transaction => {
    const snapshot = await transaction.get(reference);

    if (snapshot.exists()) {
      throw new Error('Attendance has already been recorded for today.');
    }

    transaction.set(reference, {
      date: dayKey(date),
      checkInAt: serverTimestamp(),
      checkInLocation: location.geoPoint,
      checkOutAt: null,
      checkOutLocation: null,
      createdAt: serverTimestamp(),
    });
  });

  const savedSnapshot = await getDoc(reference);
  if (!savedSnapshot.exists()) {
    throw new Error('Your check-in could not be confirmed after saving.');
  }
  const savedRecord = parseAttendanceDocument(savedSnapshot.data());

  return {
    time: savedRecord.checkInAt.toDate(),
    location: {
      latitude: location.geoPoint.latitude,
      longitude: location.geoPoint.longitude,
    } satisfies GeoLocation,
  };
}

export async function checkOut(uid: string) {
  const activeAttendance = await findActiveAttendance(uid);
  if (!activeAttendance) {
    throw new Error('There is no active check-in to check out from.');
  }

  const location = await getAttendanceLocation();
  const reference = activeAttendance.reference;

  await runTransaction(firestore, async transaction => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists() || snapshot.data()?.checkOutAt) {
      throw new Error('There is no active check-in to check out from.');
    }

    transaction.update(reference, {
      checkOutAt: serverTimestamp(),
      checkOutLocation: location.geoPoint,
    });
  });

  const savedSnapshot = await getDoc(reference);
  if (!savedSnapshot.exists()) {
    throw new Error('Your check-out could not be confirmed after saving.');
  }
  const savedRecord = parseAttendanceDocument(savedSnapshot.data());
  if (!savedRecord.checkOutAt) {
    throw new Error('Your check-out could not be confirmed after saving.');
  }

  return {
    time: savedRecord.checkOutAt.toDate(),
    location: {
      latitude: location.geoPoint.latitude,
      longitude: location.geoPoint.longitude,
    } satisfies GeoLocation,
  };
}
