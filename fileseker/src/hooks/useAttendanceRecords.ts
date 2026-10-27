import { useCallback, useEffect, useState } from 'react';
import { AttendanceRecord } from '../types/attendance';
import { loadAttendance } from '../services/accountService';
import { getFirebaseErrorMessage } from '../services/firebaseErrors';

export function useAttendanceRecords(userId: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError('');

    loadAttendance(userId)
      .then(value => {
        if (isActive) {
          setRecords(value);
        }
      })
      .catch(loadError => {
        if (isActive) {
          setError(
            getFirebaseErrorMessage(
              loadError,
              'Could not load attendance records.',
            ),
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [requestId, userId]);

  const reload = useCallback(() => {
    setRequestId(value => value + 1);
  }, []);

  return { records, loading, error, reload };
}
