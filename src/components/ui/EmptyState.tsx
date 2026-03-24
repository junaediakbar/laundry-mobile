import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
};

export function EmptyState({ icon = 'file-tray-outline', title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={theme.color.textMuted} />
      <Text style={[textVariants.title, styles.title]}>{title}</Text>
      {description ? (
        <Text style={[textVariants.bodyMuted, styles.desc]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space.xxxl,
    paddingHorizontal: theme.space.xl,
  },
  title: { marginTop: theme.space.md, textAlign: 'center' },
  desc: { marginTop: theme.space.sm, textAlign: 'center' },
});
