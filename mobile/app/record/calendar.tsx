import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { displayDate, formatDateId } from '@/src/utils/travel';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen() {
  const params = useLocalSearchParams<{ startDate?: string; endDate?: string }>();
  const todayId = formatDateId(new Date());
  const [startDate, setStartDate] = useState(params.startDate ?? '');
  const [endDate, setEndDate] = useState(params.endDate ?? '');
  const year = new Date().getFullYear();

  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);

  const selectDate = (dateId: string) => {
    if (dateId > todayId) return;
    if (!startDate || endDate) {
      setStartDate(dateId);
      setEndDate('');
    } else if (dateId < startDate) {
      setStartDate(dateId);
      setEndDate(startDate);
    } else {
      setEndDate(dateId);
    }
  };

  const save = () => {
    if (!startDate) {
      Alert.alert('시작일을 선택해주세요.');
      return;
    }
    const finalEndDate = endDate || startDate;
    router.replace({ pathname: '/record/create', params: { startDate, endDate: finalEndDate } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable>
          <Text style={styles.title}>방문 일정</Text>
          <Pressable onPress={save}><Text style={styles.done}>완료</Text></Pressable>
        </View>

        <View style={styles.dateRange}>
          <DateBox label="시작일" value={startDate ? displayDate(startDate) : '선택 전'} />
          <DateBox label="종료일" value={endDate ? displayDate(endDate) : startDate ? displayDate(startDate) : '선택 전'} />
        </View>

        {months.map((month) => <MonthCalendar key={month} year={year} month={month} todayId={todayId} startDate={startDate} endDate={endDate} onSelect={selectDate} />)}

        <Pressable style={styles.saveButton} onPress={save}><Text style={styles.saveButtonText}>저장하기</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DateBox({ label, value }: { label: string; value: string }) {
  return <View style={styles.dateBox}><Text style={styles.dateLabel}>{label}</Text><Text style={styles.dateValue}>{value}</Text></View>;
}

type MonthProps = { year: number; month: number; todayId: string; startDate: string; endDate: string; onSelect: (dateId: string) => void };

function MonthCalendar({ year, month, todayId, startDate, endDate, onSelect }: MonthProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + lastDate }, (_, index) => index - firstDay + 1);

  return (
    <View style={styles.monthCard}>
      <Text style={styles.monthTitle}>{year}년 {month + 1}월</Text>
      <View style={styles.calendarGrid}>
        {WEEKDAYS.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
        {cells.map((day, index) => {
          if (day < 1) return <View key={`blank-${index}`} style={styles.dayCell} />;
          const dateId = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const future = dateId > todayId;
          const picked = dateId === startDate || dateId === endDate;
          const inRange = Boolean(startDate && endDate && dateId > startDate && dateId < endDate);
          return <Pressable key={dateId} disabled={future} onPress={() => onSelect(dateId)} style={[styles.dayCell, picked && styles.pickedDay, inRange && styles.rangeDay]}><Text style={[styles.dayText, picked && styles.pickedDayText, future && styles.futureText]}>{day}</Text></Pressable>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 },
  title: { color: '#222222', fontSize: 19, fontWeight: '800' },
  done: { width: 42, color: '#5C3DFF', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  dateRange: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 18 },
  dateBox: { flex: 1, padding: 13, borderRadius: 14, backgroundColor: '#F7F5FC' },
  dateLabel: { color: '#777086', fontSize: 12 },
  dateValue: { marginTop: 6, color: '#5C3DFF', fontSize: 14, fontWeight: '700' },
  monthCard: { marginBottom: 18, padding: 14, borderWidth: 1, borderColor: '#ECE9F8', borderRadius: 18, backgroundColor: '#FFFFFF' },
  monthTitle: { marginBottom: 13, color: '#30284A', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 7 },
  weekday: { width: '13.2%', color: '#888888', fontSize: 11, textAlign: 'center' },
  dayCell: { width: '13.2%', height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  dayText: { color: '#333333', fontSize: 12 },
  pickedDay: { backgroundColor: '#5C3DFF' },
  pickedDayText: { color: '#FFFFFF', fontWeight: '700' },
  rangeDay: { backgroundColor: '#EEE8FF' },
  futureText: { color: '#D5D5D5' },
  saveButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#5C3DFF' },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
