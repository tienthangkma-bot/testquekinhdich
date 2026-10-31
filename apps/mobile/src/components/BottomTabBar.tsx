import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme/colors';
import { ScreenName } from '../types/navigation';

export interface BottomTabBarProps {
  currentScreen: ScreenName;
  onSelectScreen: (screen: ScreenName) => void;
}

interface TabItem {
  key: ScreenName;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { key: 'home', label: 'Trang chủ', icon: '🏠' },
  { key: 'serial', label: 'Seri tiền', icon: '🔢' },
  { key: 'maihua', label: 'Mai Hoa', icon: '⏳' },
  { key: 'history', label: 'Lịch sử', icon: '📜' },
  { key: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive =
            currentScreen === tab.key ||
            (currentScreen === 'result' && tab.key === 'home');

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => onSelectScreen(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
                {tab.icon}
              </Text>
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 58,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
