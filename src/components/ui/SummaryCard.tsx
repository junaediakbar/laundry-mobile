import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, theme, textVariants } from '@/theme';

type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'primary' | 'warning' | 'success';
};

const toneBg: Record<NonNullable<Props['tone']>, string> = {
  default: theme.color.surface,
  primary: theme.color.primaryMuted,
  warning: theme.color.warningMuted,
  success: theme.color.successMuted,
};

export function SummaryCard({ label, value, hint, tone = 'default' }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: toneBg[tone] }]}>
      <Text style={[textVariants.caption, styles.label]}>{label}</Text>
      <Text style={[textVariants.title, styles.value]} numberOfLines={2}>
        {value}
      </Text>
      {hint ? <Text style={[textVariants.caption, styles.hint]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...cardShadow(),
  },
  label: { color: theme.color.textSecondary, marginBottom: theme.space.xs },
  value: { fontSize: theme.font.lg },
  hint: { marginTop: theme.space.xs, color: theme.color.textMuted },
});
