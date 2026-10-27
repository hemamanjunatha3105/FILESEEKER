export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string | null;
  checkInLocation: GeoLocation | null;
  checkOutLocation: GeoLocation | null;
  status: 'Present' | 'In progress';
  hours: string;
  checkInAt: Date;
  checkOutAt: Date | null;
}
