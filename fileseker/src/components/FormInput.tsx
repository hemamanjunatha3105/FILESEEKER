import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../assets/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

function FormInput({
  label,
  error,
  isPassword = false,
  ...textInputProps
}: FormInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !passwordVisible}
          style={styles.input}
          {...textInputProps}
        />
        {isPassword ? (
          <Text
            accessibilityRole="button"
            onPress={() => setPasswordVisible(visible => !visible)}
            style={styles.passwordToggle}>
            {passwordVisible ? 'Hide' : 'Show'}
          </Text>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  passwordToggle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    paddingLeft: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
  },
});

export default FormInput;
