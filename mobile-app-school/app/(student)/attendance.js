import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TextInput
} from 'react-native';
import { useGetStudentAttendanceQuery, useGetStudentDashboardStatsQuery } from '../../src/store/mobileApiSlice';
import { 
  Calendar,
  Check,
  X,
  Clock,
  ChevronLeft,
  BarChart2,
  User,
  Search
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

// ── Tiny SVG pie-chart approximation via View arcs ─────────────────────────
// We'll render a simple segmented donut using Views.

const StudentAttendance = () => {
  const router = useRouter();
  const { data: attendance, isLoading: attLoading }  = useGetStudentAttendanceQuery();
  const { data: stats,      isLoading: statsLoading } = useGetStudentDashboardStatsQuery();
  const { theme } = useTheme();
  const T = theme;

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (attLoading || statsLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  const total   = stats?.totalAttendance || 0;
  const present = stats?.presentCount    || 0;
  const absent  = stats?.absentCount     || 0;
  const excuse  = total - present - absent;

  const pctPresent = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  const pctAbsent  = total > 0 ? ((absent  / total) * 100).toFixed(1) : 0;

  // Unique courses from attendance
  const courses = attendance
    ? [...new Set(attendance.map(a => a.subject?.name).filter(Boolean))]
    : [];

  const filtered = attendance?.filter(a => {
    const matchesCourse = selectedCourse ? a.subject?.name === selectedCourse : true;
    const matchesSearch = searchTerm ? 
      (a.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       a.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    return matchesCourse && matchesSearch;
  });

  const statCards = [
    { label: 'Total',   value: total,   icon: Calendar, iconColor: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Present', value: present, icon: Check,    iconColor: '#10B981', bg: '#ECFDF5' },
    { label: 'Absent',  value: absent,  icon: X,        iconColor: '#EF4444', bg: '#FFF0F0' },
    { label: 'Excuse',  value: excuse,  icon: Clock,    iconColor: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />

      {/* ── AppBar ── */}
      <View style={[styles.appBar, { backgroundColor: T.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Attendance</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Hero card ── */}
        <View style={[styles.heroCard, { backgroundColor: T.primary }]}>
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <User size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{stats?.fullName || 'Student Name'}</Text>
            <Text style={styles.heroSub}>ID: {stats?.studentId || 'N/A'}</Text>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={[styles.searchBar, { backgroundColor: T.card, borderColor: T.border }]}>
          <Search size={20} color={T.subText} />
          <TextInput
            style={[styles.searchInput, { color: T.text }]}
            placeholder="Search Subject ID or Name..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={T.subText}
          />
        </View>

        {/* ── Course selector ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Select Course</Text>
        <View style={[styles.pickerBox, { backgroundColor: T.card, borderColor: T.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: T.card, borderColor: T.border }, !selectedCourse && { backgroundColor: T.primary, borderColor: T.primary }]}
              onPress={() => setSelectedCourse(null)}
            >
              <Text style={[styles.pillText, { color: T.subText }, !selectedCourse && styles.pillTextActive]}>All</Text>
            </TouchableOpacity>
            {courses.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.pill, { backgroundColor: T.card, borderColor: T.border }, selectedCourse === c && { backgroundColor: T.primary, borderColor: T.primary }]}
                onPress={() => setSelectedCourse(c)}
              >
                <Text style={[styles.pillText, { color: T.subText }, selectedCourse === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Donut / distribution visual ── */}
        <View style={[styles.chartCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.chartTitle, { color: T.text }]}>Attendance Distribution</Text>
          {/* Donut */}
          <View style={styles.donutWrapper}>
            <View style={[styles.donut, { borderColor: T.primary }]}>
              <View style={[styles.donutHole, { backgroundColor: T.card }]}>
                <Text style={[styles.donutPct, { color: T.text }]}>{pctPresent}%</Text>
                <Text style={[styles.donutLabel, { color: T.subText }]}>Present</Text>
              </View>
            </View>
          </View>
          {/* Legend */}
          <View style={styles.legend}>
            {[
              { label: 'Present', color: T.primary },
              { label: 'Absent',  color: '#CC4444' },
              { label: 'Excuse',  color: '#F59E0B' },
            ].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={[styles.legendText, { color: T.subText }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Stat Cards ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Attendance Details</Text>
        <View style={styles.grid}>
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <View key={card.label} style={[styles.statCard, { backgroundColor: T.dark ? card.iconColor + '22' : card.bg }]}>
                <View style={[styles.statIcon, { backgroundColor: card.iconColor + '22' }]}>
                  <Icon size={18} color={card.iconColor} />
                </View>
                <Text style={[styles.statValue, { color: card.iconColor }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: T.subText }]}>{card.label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Attendance list ── */}
        {filtered && filtered.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text }]}>Records</Text>
            {filtered.map((item, i) => {
              const isPresent = item.status === 'Present';
              const isAbsent  = item.status === 'Absent';
              const dotColor  = isPresent ? '#10B981' : isAbsent ? '#EF4444' : '#F59E0B';
              return (
                <View key={i} style={[styles.recordRow, { backgroundColor: T.card, borderColor: T.border }]}>
                  <View style={[styles.recordDot, { backgroundColor: dotColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recordSubject, { color: T.text }]}>{item.subject?.name || 'General'}</Text>
                    <Text style={[styles.recordDate, { color: T.subText }]}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: dotColor + '20' }]}>
                    <Text style={[styles.statusText, { color: dotColor }]}>{item.status}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={[styles.bottomBar, { backgroundColor: T.primary }]}>
        <BarChart2 size={24} color="#fff" />
      </View>
    </View>
  );
};

const CARD_W = (width - 52) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },

  appBar: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  scroll: { padding: 20 },

  heroCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  heroIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  heroTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  heroSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  pickerBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    elevation: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActive:     { borderWidth: 1 },
  pillText:       { fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  /* Chart */
  chartCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 1,
    borderWidth: 1,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
  donutWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  donut: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 30,
    borderTopColor: '#CC4444',
    justifyContent: 'center', alignItems: 'center',
  },
  donutHole: {
    position: 'absolute',
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
  },
  donutPct:   { fontSize: 20, fontWeight: '800' },
  donutLabel: { fontSize: 10, fontWeight: '600' },
  legend:     { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },

  /* Stat grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: CARD_W,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '500' },

  /* Records */
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
  },
  recordDot:     { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  recordSubject: { fontSize: 14, fontWeight: '700' },
  recordDate:    { fontSize: 12, marginTop: 2 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText:    { fontSize: 12, fontWeight: '700' },

  /* Bottom bar */
  bottomBar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StudentAttendance;

