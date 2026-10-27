import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../assets/theme';

export type MainTab = 'home' | 'attendance' | 'profile';

interface BottomNavigationProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

const tabs: { key: MainTab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'attendance', label: 'Attendance', icon: '▦' },
  { key: 'profile', label: 'Profile', icon: '○' },
];

function BottomNavigation({ activeTab, onSelectTab }: BottomNavigationProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tab}>
            <Text style={[styles.icon, isActive ? styles.active : null]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive ? styles.active : null]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingTop: 10,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    paddingVertical: 2,
  },
  icon: {
    color: colors.muted,
    fontSize: 23,
    height: 27,
    lineHeight: 27,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  active: {
    color: colors.primary,
  },
});

export default BottomNavigation;
