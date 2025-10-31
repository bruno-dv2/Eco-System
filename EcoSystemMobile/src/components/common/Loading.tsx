import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import THEME from '../../constants/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  size = 'large',
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={THEME.colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={THEME.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  message: {
    marginTop: THEME.spacing.sm,
    fontSize: THEME.fontSizes.md,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
});