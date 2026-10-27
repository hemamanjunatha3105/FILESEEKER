import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../assets/theme';
import { AttendanceRecord } from '../types/attendance';

interface AttendanceRowProps {
  record: AttendanceRecord;
}

function AttendanceRow({ record }: AttendanceRowProps) {
  const isInProgress = record.status === 'In progress';
  const [year, month, day] = record.date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  const displayDate = Number.isNaN(parsedDate.getTime())
    ? record.date
    : parsedDate.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.times}>
          {record.checkIn} · {record.checkOut ?? '--:--'}
        </Text>
        <AttendanceLocation label="Check-in location" location={record.checkInLocation} />
        {record.checkOutAt ? (
          <AttendanceLocation
            label="Check-out location"
            location={record.checkOutLocation}
          />
        ) : null}
      </View>
      <View style={styles.trailing}>
        <Text style={styles.hours}>{record.hours}</Text>
        <Text style={[styles.status, isInProgress ? styles.inProgress : null]}>
          {record.status}
        </Text>
      </View>
    </View>
  );
}

function AttendanceLocation({
  label,
  location,
}: {
  label: string;
  location: AttendanceRecord['checkInLocation'];
}) {
  if (!location) {
    return (
      <Text style={styles.locationUnavailable}>
        {label}: Location unavailable
      </Text>
    );
  }

  const coordinates = formatLocation(location);

  return (
    <View style={styles.locationBlock}>
      <Text style={styles.locationLabel}>{label}</Text>
      <Text selectable style={styles.coordinates}>
        {coordinates}
      </Text>
      <Pressable
        accessibilityLabel={`View ${label.toLowerCase()} on Google Maps`}
        accessibilityRole="link"
        onPress={() => {
          Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
          ).catch(() => {
            Alert.alert('Unable to open map', 'Please try again.');
          });
        }}
        style={styles.mapLink}>
        <Text style={styles.mapLinkText}>View on map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  main: {
    flex: 1,
  },
  date: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  times: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  locationBlock: {
    marginTop: 10,
  },
  locationLabel: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  coordinates: {
    color: '#000000',
    fontSize: 10,
    marginTop: 3,
  },
  mapLink: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  mapLinkText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  locationUnavailable: {
    color: '#000000',
    fontSize: 10,
    marginTop: 9,
  },
  trailing: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  hours: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  status: {
    color: '#2A8A64',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },
  inProgress: {
    color: colors.primary,
  },
});

function formatLocation(location: { latitude: number; longitude: number }) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

export default AttendanceRow;
