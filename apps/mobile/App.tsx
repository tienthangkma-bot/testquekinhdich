import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  CastingInput,
  CastingMethod,
  DivinationDateTime,
  LinePosition,
} from '@kindich/domain';
import { SIX_YAO_DEFAULT_RULESET_ID, SIX_YAO_ORCHESTRATOR_VERSION } from '@kindich/core';
import { theme } from './src/theme/colors';
import { ScreenName, MobileDivinationRecord, QuestionCategory } from './src/types/navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { SerialCastingScreen } from './src/screens/SerialCastingScreen';
import { MaiHuaCastingScreen } from './src/screens/MaiHuaCastingScreen';
import { HexagramResultScreen } from './src/screens/HexagramResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomTabBar } from './src/components/BottomTabBar';
import { openMobileSqliteDatabase, SqliteDivinationRepository } from './src/database';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [activeRecord, setActiveRecord] = useState<MobileDivinationRecord | null>(null);
  const [history, setHistory] = useState<MobileDivinationRecord[]>([]);
  const repoRef = useRef<SqliteDivinationRepository | null>(null);

  // Khởi tạo SQLite Repository khi ứng dụng khởi chạy
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const db = await openMobileSqliteDatabase('kindich_mobile.db');
        const repo = new SqliteDivinationRepository(db);
        await repo.initialize();
        repoRef.current = repo;

        // Tải lịch sử đã lưu trước đó từ SQLite
        const result = await repo.list(undefined, { page: 1, pageSize: 50 });
        if (isMounted && result.items.length > 0) {
          const loadedRecords: MobileDivinationRecord[] = [];
          for (const item of result.items) {
            const detail = await repo.getById(item.id);
            if (detail) {
              const movingLines = (detail.result?.movingLines ??
                detail.resultSnapshot?.trio.movingLineIndices ??
                []) as readonly LinePosition[];

              loadedRecords.push({
                id: detail.divination.id,
                method: detail.divination.method,
                createdAt: detail.divination.createdAt,
                question: detail.divination.question,
                category: detail.divination.inquiryType as QuestionCategory,
                trio: detail.result?.trio ?? detail.resultSnapshot?.trio!,
                movingLines,
                sixYaoAnalysis: detail.analysis?.details as any,
                dateTimeInfo: {
                  solarDateStr: new Date(detail.divination.dateTimeInfo.solarDateTime).toLocaleDateString('vi-VN'),
                  lunarDateStr: `Ngày ${detail.divination.dateTimeInfo.lunarDay} tháng ${detail.divination.dateTimeInfo.lunarMonth}`,
                  yearCanChi: detail.divination.dateTimeInfo.yearCanChi,
                  monthCanChi: detail.divination.dateTimeInfo.monthCanChi,
                  dayCanChi: detail.divination.dateTimeInfo.dayCanChi,
                  hourCanChi: detail.divination.dateTimeInfo.hourCanChi,
                },
                serialNumber: (detail.divination.input as any)?.serialNumber,
              });
            }
          }
          if (isMounted) {
            setHistory(loadedRecords);
          }
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo SQLite Repository:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Khi lập quẻ thành công (Seri tiền hoặc Mai Hoa) -> tự động lưu vào SQLite
  const handleCastSuccess = async (record: MobileDivinationRecord) => {
    setActiveRecord(record);
    setHistory((prev) => [record, ...prev]);
    setCurrentScreen('result');

    // Lưu bền vững vào SQLite
    if (repoRef.current) {
      try {
        const input: CastingInput =
          record.method === CastingMethod.SERIAL
            ? {
                method: CastingMethod.SERIAL,
                serialNumber: record.serialNumber ?? '000000',
              }
            : {
                method: CastingMethod.MAI_HUA,
                dateTime: record.createdAt,
              };

        const dateTimeInfo: DivinationDateTime = {
          solarDateTime: record.createdAt,
          lunarYear: record.sixYaoAnalysis?.dateTime?.lunarDate?.year ?? 2026,
          lunarMonth: record.sixYaoAnalysis?.dateTime?.lunarDate?.month ?? 9,
          lunarDay: record.sixYaoAnalysis?.dateTime?.lunarDate?.day ?? 21,
          lunarHourBranch: record.dateTimeInfo.hourCanChi.split(' ')[1] ?? 'Tý',
          yearCanChi: record.dateTimeInfo.yearCanChi,
          monthCanChi: record.dateTimeInfo.monthCanChi,
          dayCanChi: record.dateTimeInfo.dayCanChi,
          hourCanChi: record.dateTimeInfo.hourCanChi,
        };

        await repoRef.current.create({
          id: record.id,
          method: record.method,
          algorithmVersion: record.method === CastingMethod.SERIAL ? 'SERIAL-MOD8-V1' : 'MAI-HUA-V1',
          ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
          input,
          dateTimeInfo,
          trio: record.trio,
          question: record.question,
          inquiryType: record.category,
          analysis: record.sixYaoAnalysis
            ? {
                ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
                algorithmVersion: SIX_YAO_ORCHESTRATOR_VERSION,
                palaceId: record.sixYaoAnalysis.primaryHexagram.palace.id,
                palaceElement: record.sixYaoAnalysis.primaryHexagram.palace.element,
                worldLine: record.sixYaoAnalysis.primaryHexagram.palace.worldLine,
                responseLine: record.sixYaoAnalysis.primaryHexagram.palace.responseLine,
                summary: record.sixYaoAnalysis.disclaimer,
                details: record.sixYaoAnalysis,
              }
            : undefined,
        });
      } catch (err) {
        console.warn('Lỗi lưu quẻ vào SQLite:', err);
      }
    }
  };

  // Xem chi tiết từ màn hình Lịch sử
  const handleSelectRecord = (record: MobileDivinationRecord) => {
    setActiveRecord(record);
    setCurrentScreen('result');
  };

  // Xóa một mục lịch sử khỏi state và SQLite
  const handleDeleteRecord = async (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeRecord && activeRecord.id === id) {
      setActiveRecord(null);
    }

    if (repoRef.current) {
      try {
        await repoRef.current.delete(id);
      } catch (err) {
        console.warn('Lỗi xóa quẻ khỏi SQLite:', err);
      }
    }
  };

  // Xóa toàn bộ lịch sử khỏi state và SQLite
  const handleClearAllHistory = async () => {
    const idsToDelete = history.map((item) => item.id);
    setHistory([]);
    setActiveRecord(null);

    if (repoRef.current) {
      try {
        for (const id of idsToDelete) {
          await repoRef.current.delete(id);
        }
      } catch (err) {
        console.warn('Lỗi xóa tất cả quẻ trong SQLite:', err);
      }
    }
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

          {/* Thanh điều hướng dưới đáy */}
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
