import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme/colors';
import { ScreenName, MobileDivinationRecord } from './src/types/navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { SerialCastingScreen } from './src/screens/SerialCastingScreen';
import { MaiHuaCastingScreen } from './src/screens/MaiHuaCastingScreen';
import { HexagramResultScreen } from './src/screens/HexagramResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomTabBar } from './src/components/BottomTabBar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [activeRecord, setActiveRecord] = useState<MobileDivinationRecord | null>(null);
  const [history, setHistory] = useState<MobileDivinationRecord[]>([]);

  // Khi lập quẻ thành công (Seri tiền hoặc Mai Hoa)
  const handleCastSuccess = (record: MobileDivinationRecord) => {
    setActiveRecord(record);
    setHistory((prev) => [record, ...prev]);
    setCurrentScreen('result');
  };

  // Xem chi tiết từ màn hình Lịch sử
  const handleSelectRecord = (record: MobileDivinationRecord) => {
    setActiveRecord(record);
    setCurrentScreen('result');
  };

  // Xóa một mục lịch sử
  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeRecord && activeRecord.id === id) {
      setActiveRecord(null);
    }
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllHistory = () => {
    setHistory([]);
    setActiveRecord(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={theme.colors.card} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {currentScreen === 'home' && (
            <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
          )}

          {currentScreen === 'serial' && (
            <SerialCastingScreen
              onBack={() => setCurrentScreen('home')}
              onCastSuccess={handleCastSuccess}
            />
          )}

          {currentScreen === 'maihua' && (
            <MaiHuaCastingScreen
              onBack={() => setCurrentScreen('home')}
              onCastSuccess={handleCastSuccess}
            />
          )}

          {currentScreen === 'result' && activeRecord && (
            <HexagramResultScreen
              record={activeRecord}
              onBack={() => setCurrentScreen('home')}
              onNewCast={() => setCurrentScreen('serial')}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              history={history}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAllHistory}
              onNavigateCast={(m) => setCurrentScreen(m)}
            />
          )}

          {currentScreen === 'settings' && <SettingsScreen />}

          {/* Thanh điều hướng dưới đáy (ẩn khi đang ở màn hình nhập liệu nếu cần, hoặc luôn hiển thị) */}
          <BottomTabBar
            currentScreen={currentScreen}
            onSelectScreen={(screen) => setCurrentScreen(screen)}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
