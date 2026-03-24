import { Tabs } from 'expo-router';
import {
  IconHome,
  IconLayoutGrid,
  IconReceipt,
  IconUser,
  IconUsers,
} from '@tabler/icons-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

const ICON = 26;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,
        tabBarInactiveTintColor: theme.color.textMuted,
        tabBarStyle: {
          backgroundColor: theme.color.surface,
          borderTopColor: theme.color.border,
          height: 56 + padBottom,
          paddingBottom: padBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.font.xs,
          fontWeight: theme.fontWeight.medium,
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <IconHome size={ICON} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Nota',
          tabBarIcon: ({ color }) => <IconReceipt size={ICON} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Pelanggan',
          tabBarIcon: ({ color }) => <IconUsers size={ICON} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <IconLayoutGrid size={ICON} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconUser size={ICON} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
