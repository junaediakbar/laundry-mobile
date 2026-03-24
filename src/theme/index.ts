import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { tokens } from './tokens';

export { tokens };
export type { PaymentStatus, WorkflowStatus } from './tokens';

export const theme = {
  color: tokens.colors,
  space: tokens.space,
  radius: tokens.radius,
  font: tokens.fontSize,
  lineHeight: tokens.lineHeight,
  fontWeight: tokens.fontWeight,
};

/** Merge platform shadow styles for cards */
export function cardShadow(): ViewStyle {
  if (Platform.OS === 'ios') {
    return { ...tokens.shadow.card.ios };
  }
  return { ...tokens.shadow.card.android };
}

export function fabShadow(): ViewStyle {
  if (Platform.OS === 'ios') {
    return { ...tokens.shadow.fab.ios };
  }
  return { ...tokens.shadow.fab.android };
}

export const textVariants = {
  hero: {
    fontSize: tokens.fontSize.hero,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.text,
    lineHeight: Math.round(tokens.fontSize.hero * tokens.lineHeight.tight),
  } satisfies TextStyle,
  title: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text,
  } satisfies TextStyle,
  body: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.regular,
    color: tokens.colors.text,
    lineHeight: Math.round(tokens.fontSize.md * tokens.lineHeight.relaxed),
  } satisfies TextStyle,
  bodyMuted: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textSecondary,
    lineHeight: Math.round(tokens.fontSize.sm * tokens.lineHeight.relaxed),
  } satisfies TextStyle,
  caption: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
  } satisfies TextStyle,
  label: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.textSecondary,
  } satisfies TextStyle,
} as const;
