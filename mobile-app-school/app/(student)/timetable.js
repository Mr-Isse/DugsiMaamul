import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { useGetStudentScheduleQuery } from '../../src/store/mobileApiSlice';
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  RefreshCw,
  BookOpen
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ── Colour tokens ──────────────────────────────────────────────────────────
const C = {
  primary:    '#1E3A8A',
  primaryMid: '#2D4EAA',
  bg:         '#F5F7FA',
  white:      '#FFFFFF',
  text:       '#1E293B',
  sub:        '#64748B',
  border:     '#E8EDF2',
  green:      '#10B981',
  greenBg:    '#ECFDF5',
};

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = () => {
  const router     = useRouter();
  const { data: scheduleData, isLoading, refetch } = useGetStudentScheduleQuery();

  const todayIdx = (new Date().getDay() + 6) % 7; // Adjust to 0=Mon, 6=Sun
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const selectedDay = FULL_DAYS[selectedDayIdx];

  const schedule = scheduleData?.filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

  const now     = new Date();
  const formatted = now.toLocaleDateString('en-US', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
  });
  const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── AppBar ── */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Class Schedule</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
          <RefreshCw size={20} color={C.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconBox}>
              <Calendar size={20} color={C.white} />
            </View>
            <View>
              <Text style={styles.heroDay}>Today</Text>
              <Text style={styles.heroDayName}>{FULL_DAYS[todayIdx]}</Text>
              <Text style={styles.heroDate}>{now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>Week {weekNum}</Text>
          </View>
        </View>

        {/* ── Day selector ── */}
        <View style={styles.daySelectorCard}>
          {SHORT_DAYS.map((d, i) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayBtn, selectedDayIdx === i && styles.dayBtnActive]}
              onPress={() => setSelectedDayIdx(i)}
            >
              <Text style={[styles.dayBtnText, selectedDayIdx === i && styles.dayBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* ── Schedule header ── */}
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleHeaderIcon}>
            <Clock size={18} color={C.primary} />
          </View>
          <View>
            <Text style={styles.scheduleHeaderTitle}>{selectedDay} Schedule</Text>
            <Text style={styles.scheduleHeaderSub}>{schedule.length} periods today</Text>
          </View>
        </View>

        {/* ── Timeline ── */}
        {schedule.length > 0 ? (
          schedule.map((item, i) => (
            <View key={i} style={styles.timelineRow}>
              {/* Left dot + line */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: item.color || C.primary }]} />
                {i < schedule.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Card */}
              <View style={[styles.scheduleCard, { borderLeftColor: item.color || C.primary, borderLeftWidth: 4 }]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.timeBadge}>
                    <Text style={[styles.timeBadgeText, { color: item.color || C.primary }]}>{item.startTime} - {item.endTime}</Text>
                  </View>
                  <View style={styles.subjectIconBox}>
                    <BookOpen size={16} color={item.color || C.primary} />
                  </View>
                </View>
                <Text style={styles.cardSubject}>{item.subject?.name}</Text>
                <View style={styles.cardMeta}>
                  <User size={13} color={C.sub} style={{ marginRight: 4 }} />
                  <Text style={styles.cardMetaText}>{item.teacher?.name}</Text>
                </View>
                <View style={[styles.cardMeta, { marginTop: 4 }]}>
                   <Text style={[styles.codeBadge, { backgroundColor: item.color + '10', color: item.color }]}>{item.subject?.code}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Calendar size={52} color={C.border} />
            <Text style={styles.emptyTitle}>No Classes</Text>
            <Text style={styles.emptySub}>Enjoy your {selectedDay}!</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },

  appBar: {
    backgroundColor: C.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn:    { padding: 4 },
  refreshBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: C.white },

  scroll: { padding: 20 },

  /* Hero */
  heroCard: {
    backgroundColor: C.primaryMid,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    elevation: 3,
  },
  heroLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroDay:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  heroDayName: { fontSize: 18, fontWeight: '800', color: C.white },
  heroDate:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  weekBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekBadgeText: { fontSize: 13, fontWeight: '700', color: C.white },

  /* Day selector */
  daySelectorCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    elevation: 1,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  dayBtnActive:     { backgroundColor: C.primary },
  dayBtnText:       { fontSize: 12, fontWeight: '700', color: C.sub },
  dayBtnTextActive: { color: C.white },

  /* Schedule header */
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  scheduleHeaderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center',
  },
  scheduleHeaderTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  scheduleHeaderSub:   { fontSize: 12, color: C.sub, marginTop: 1 },

  /* Timeline */
  timelineRow: { flexDirection: 'row', marginBottom: 14 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 14, paddingTop: 14 },
  timelineDot:  { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.white },
  timelineLine: { flex: 1, width: 2, backgroundColor: C.border, marginTop: 4 },

  scheduleCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timeBadge: {
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: { fontSize: 12, fontWeight: '600', color: C.sub },
  subjectDot: {
    width: 22, height: 22, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  subjectDotInner: { width: 12, height: 12, borderRadius: 4 },
  subjectIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  codeBadge: {
    fontSize: 10, fontWeight: '800', 
    paddingHorizontal: 6, paddingVertical: 2, 
    borderRadius: 4, textTransform: 'uppercase'
  },
  cardSubject: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 6 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center' },
  cardMetaText:{ fontSize: 12, color: C.sub, fontWeight: '500' },

  /* Empty */
  emptyBox:   { alignItems: 'center', marginTop: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 14 },
  emptySub:   { fontSize: 13, color: C.sub, marginTop: 4 },
});

export default Timetable;

