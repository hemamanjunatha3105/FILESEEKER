/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import App from '../App';
import BottomNavigation from '../src/components/BottomNavigation';
import FormInput from '../src/components/FormInput';
import PrimaryButton from '../src/components/PrimaryButton';

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/auth', () => {
  let stateListener:
    | ((user: { uid: string; email: string; displayName: string } | null) => void)
    | undefined;
  const auth = { currentUser: null as null | { uid: string } };
  const user = {
    uid: 'registered-user-id',
    email: 'member@example.com',
    displayName: 'Member Name',
  };

  return {
    getAuth: jest.fn(() => auth),
    onAuthStateChanged: jest.fn((_auth, listener) => {
      stateListener = listener;
      listener(auth.currentUser ? user : null);
      return jest.fn();
    }),
    signInWithEmailAndPassword: jest.fn(async (_auth, _email, _password) => {
      auth.currentUser = user;
      stateListener?.(user);
      return { user };
    }),
    createUserWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
    signOut: jest.fn(),
  };
});

jest.mock('@react-native-firebase/firestore', () => ({
  GeoPoint: class GeoPoint {
    latitude: number;
    longitude: number;

    constructor(latitude: number, longitude: number) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  },
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn((_firestore, ...segments: string[]) => ({
    path: segments.join('/'),
  })),
  doc: jest.fn((base, ...segments: string[]) => ({
    path: [...(base.path ? [base.path] : []), ...segments].join('/'),
  })),
  getDoc: jest.fn(async reference => ({
    data: () =>
      reference.path === 'users/registered-user-id'
        ? { name: 'Member Name' }
        : undefined,
  })),
  getDocs: jest.fn(async () => ({ docs: [] })),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
  Timestamp: class Timestamp {},
  where: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn(),
    requestAuthorization: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactLibrary = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      ReactLibrary.createElement(View, null, children),
    SafeAreaView: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => ReactLibrary.createElement(View, props, children),
  };
});

test('renders the Firebase login screen', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(
    renderer!.root.findAllByType(Text).some(text => text.props.children === 'Welcome back'),
  ).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('a registered Firebase account opens home and can navigate tabs', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const inputs = renderer!.root.findAllByType(FormInput);
  await ReactTestRenderer.act(() => {
    inputs[0].props.onChangeText('member@example.com');
    inputs[1].props.onChangeText('SecurePassword123!');
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(PrimaryButton).props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  });

  expect(
    renderer!.root.findAllByType(Text).some(text => text.props.children === 'Good morning,'),
  ).toBe(true);
  expect(
    renderer!.root.findAllByType(Text).some(
      text =>
        Array.isArray(text.props.children) &&
        text.props.children[0] === 'Member',
    ),
  ).toBe(true);

  const attendanceButtons = renderer!.root.findAllByType(PrimaryButton);
  expect(attendanceButtons.map(button => button.props.label)).toEqual([
    'Check in',
    'Check out',
  ]);
  expect(attendanceButtons[0].props.disabled).toBe(false);
  expect(attendanceButtons[1].props.disabled).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByType(BottomNavigation)
      .props.onSelectTab('attendance');
  });
  expect(
    renderer!.root
      .findAllByType(Text)
      .some(text => text.props.children === 'Recent activity'),
  ).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer!.root.findByType(BottomNavigation).props.onSelectTab('profile');
  });
  expect(
    renderer!.root
      .findAllByType(Text)
      .some(text => text.props.children === 'Account information'),
  ).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});
