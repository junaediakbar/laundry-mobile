/**
 * Design tokens — laundry / water / fabric: fresh, soft, professional.
 * Android-first; light theme baseline (dark can map these later).
 */
export const tokens = {
  colors: {
    primary: '#0D9488',
    primaryMuted: '#CCFBF1',
    primaryDark: '#0F766E',
    secondary: '#64748B',
    secondaryMuted: '#F1F5F9',
    accent: '#38BDF8',
    accentMuted: '#E0F2FE',

    success: '#22C55E',
    successMuted: '#DCFCE7',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    error: '#EF4444',
    errorMuted: '#FEE2E2',
    info: '#3B82F6',
    infoMuted: '#DBEAFE',

    bg: '#F4F8FB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    inverse: '#FFFFFF',

    /** Order workflow */
    workflow: {
      received: '#6366F1',
      washing: '#0EA5E9',
      drying: '#F59E0B',
      ironing: '#EC4899',
      finished: '#22C55E',
      picked_up: '#64748B',
    } as const,
    /** Payment */
    payment: {
      unpaid: '#EF4444',
      partial: '#F59E0B',
      paid: '#22C55E',
    } as const,
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadow: {
    card: {
      android: { elevation: 3 },
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
    },
    fab: {
      android: { elevation: 6 },
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    },
  },
} as const;

export type WorkflowStatus = keyof typeof tokens.colors.workflow;
export type PaymentStatus = keyof typeof tokens.colors.payment;
