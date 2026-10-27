import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../assets/theme';
import AttendanceRow from '../components/AttendanceRow';
import { useAttendanceRecords } from '../hooks/useAttendanceRecords';

interface AttendanceScreenProps {
  userId: string;
}

function AttendanceScreen({ userId }: AttendanceScreenProps) {
  const { records, loading, error, reload } = useAttendanceRecords(userId);
  const completedRecords = records.filter(record => record.checkOutAt);
  const totalMinutes = completedRecords.reduce((total, record) => {
    return (
      total +
      Math.floor(
        (record.checkOutAt!.getTime() - record.checkInAt.getTime()) / 60000,
      )
    );
  }, 0);
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${String(
    totalMinutes % 60,
  ).padStart(2, '0')}m`;
  const openShifts = records.filter(record => !record.checkOutAt).length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR WORK RECORD</Text>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>A clear view of your recent workdays.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryValue}>{records.length}</Text>
          <Text style={styles.summaryLabel}>DAYS LOGGED</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryValue}>{totalHours}</Text>
          <Text style={styles.summaryLabel}>HOURS WORKED</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryValue}>{openShifts}</Text>
          <Text style={styles.summaryLabel}>OPEN SHIFTS</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recent activity</Text>
        <Text style={styles.period}>Last 31 days</Text>
      </View>
      <View style={styles.listCard}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyState}>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
            <Pressable accessibilityRole="button" onPress={reload}>
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : records.length > 0 ? (
          records.map(record => (
            <AttendanceRow key={record.date} record={record} />
          ))
        ) : (
          <Text style={styles.emptyState}>
            No attendance records yet. Check in from Home to create your first
            record.
          </Text>
        )}
      </View>
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
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#25275E',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  summaryBlock: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#C6C7E5',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 6,
  },
  divider: {
    backgroundColor: '#555787',
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 27,
  },
  listTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  period: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  loader: {
    paddingVertical: 28,
  },
  emptyState: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 24,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
  },
  retry: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
});

export default AttendanceScreen;
