import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { fabShadow, theme } from '@/theme';

type Props = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  /** Distance from bottom (e.g. tab bar height + inset). */
  bottom?: number;
};

export function FloatingActionButton({
  onPress,
  icon = 'add',
  accessibilityLabel,
  bottom,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottom ?? theme.space.lg },
        pressed && { transform: [{ scale: 0.96 }] },
      ]}>
      <Ionicons name={icon} size={28} color={theme.color.inverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.space.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...fabShadow(),
  },
});
