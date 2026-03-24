import { StyleSheet, Text, View } from 'react-native';

import { theme, textVariants } from '@/theme';
import { workflowColor, workflowLabel } from '@/utils/order-status';

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const bg = workflowColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${bg}22`, borderColor: `${bg}44` }]}>
      <View style={[styles.dot, { backgroundColor: bg }]} />
      <Text style={[textVariants.caption, styles.text, { color: bg }]}>
        {workflowLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xxs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: { fontWeight: theme.fontWeight.semibold },
});
