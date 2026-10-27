import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../assets/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : null,
        pressed && !disabled
          ? variant === 'secondary'
            ? styles.secondaryButtonPressed
            : styles.buttonPressed
          : null,
        disabled ? styles.buttonDisabled : null,
      ]}>
      <Text
        style={[
          styles.label,
          variant === 'secondary' ? styles.secondaryLabel : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondaryButtonPressed: {
    backgroundColor: '#EEEEFF',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.primary,
  },
});

export default PrimaryButton;
