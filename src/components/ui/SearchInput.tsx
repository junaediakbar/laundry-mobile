import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { theme, textVariants } from '@/theme';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Cari…',
  autoFocus,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={20} color={theme.color.textMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.color.textMuted}
        style={[textVariants.body, styles.input]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingHorizontal: theme.space.sm,
    minHeight: 48,
  },
  icon: { marginRight: theme.space.xs },
  input: {
    flex: 1,
    paddingVertical: theme.space.sm,
    color: theme.color.text,
  },
});
