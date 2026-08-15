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
import { useGetTeacherScheduleQuery } from '../../src/store/mobileApiSlice';
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  RefreshCw,
  BookOpen,
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  Bell,
  Filter,
  Plus,
  Edit
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TeacherSchedule = () => {
  const router     = useRouter();
  const { theme } = useTheme();
  const { data: scheduleData, isLoading, refetch } = useGetTeacherScheduleQuery();
  
  const T = theme;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  const selectedDay = FULL_DAYS[selectedDayIdx];
  const schedule = (scheduleData || [])
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const currentTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Determine current or next class for highlighting priority
  const getCurrentOrNextClass = () => {
    if (selectedDayIdx !== todayIdx) return null;
    
    // Find current class
    const current = schedule.find(item => 
      currentTimeStr >= item.startTime && currentTimeStr <= item.endTime
    );
    if (current) return { ...current, status: 'CURRENT' };

    // Find next class
    const next = schedule.find(item => item.startTime > currentTimeStr);
    if (next) return { ...next, status: 'NEXT' };

    return null;
  };

  const currentOrNext = getCurrentOrNextClass();

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />
      
      {/* Enhanced Header */}
      <View style={[styles.appBar, { backgroundColor: T.primary }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: T.primary + '20' }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={T.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerIconRow}>
              <View style={[styles.headerIcon, { backgroundColor: T.primary + '20' }]}>
                <CalendarIcon size={22} color={T.primary} />
              </View>
              <Text style={styles.headerTitle}>Schedule</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: '#fff' }]}>
              {FULL_DAYS[todayIdx]}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.refreshBtn, { backgroundColor: T.primary + '20' }]} 
              onPress={refetch}
            >
              <RefreshCw size={20} color={T.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: T.primary + '20' }]} 
              onPress={() => {}}
            >
              <Filter size={20} color={T.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Enhanced Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.heroLeft}>
            <View style={[styles.heroIconBox, { backgroundColor: T.primary }]}>
              <CalendarIcon size={24} color="#fff" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroDay, { color: T.subText }]}>Today</Text>
              <Text style={[styles.heroDayName, { color: T.text }]}>{FULL_DAYS[todayIdx]}</Text>
              <View style={styles.heroStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: T.text }]}>{schedule.length}</Text>
                  <Text style={[styles.statLabel, { color: T.subText }]}>Classes</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={T.primary} />
                  <Text style={[styles.statTime, { color: T.text }]}>
                    {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.heroRight}>
            <View style={[styles.dateBadge, { backgroundColor: T.input }]}>
              <Text style={[styles.dateBadgeText, { color: T.text }]}>{now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</Text>
            </View>
            <View style={[styles.notificationBadge, { backgroundColor: '#10B981' }]}>
              <Bell size={16} color="#fff" />
              <View style={styles.notificationDot} />
            </View>
          </View>
        </View>

        {/* Enhanced Day Selector */}
        <View style={[styles.daySelectorCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.daySelectorHeader}>
            <View style={[styles.daySelectorIcon, { backgroundColor: T.primary + '20' }]}>
              <CalendarIcon size={18} color={T.primary} />
            </View>
            <Text style={[styles.daySelectorTitle, { color: T.text }]}>Select Day</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
            {SHORT_DAYS.map((d, i) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayBtn, 
                  { 
                    backgroundColor: selectedDayIdx === i ? T.primary : T.input, 
                    borderColor: selectedDayIdx === i ? T.primary : T.border,
                    elevation: selectedDayIdx === i ? 6 : 2,
                    shadowColor: selectedDayIdx === i ? T.primary : 'transparent',
                    shadowOffset: selectedDayIdx === i ? { width: 0, height: 4 } : { width: 0, height: 0 },
                    shadowOpacity: selectedDayIdx === i ? 0.3 : 0,
                    shadowRadius: selectedDayIdx === i ? 8 : 0
                  }
                ]}
                onPress={() => setSelectedDayIdx(i)}
              >
                <View style={styles.dayBtnContent}>
                  <Text style={[
                    styles.dayBtnText, 
                    { 
                      color: T.subText, 
                      fontWeight: selectedDayIdx === i ? '700' : '600'
                    }
                  ]}>
                    {d}
                  </Text>
                  <View style={[
                    styles.dayIndicator,
                    {
                      backgroundColor: selectedDayIdx === i ? T.primary : 'transparent',
                      width: selectedDayIdx === i ? 6 : 0
                    }
                  ]}>
                    {schedule?.filter(s => s.day === FULL_DAYS[i])?.length > 0 && (
                      <View style={[styles.dayIndicatorDot, { backgroundColor: selectedDayIdx === i ? '#fff' : T.primary }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Enhanced Schedule Header */}
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleHeaderLeft}>
            <View style={[styles.scheduleHeaderIcon, { backgroundColor: T.primary + '20' }]}>
              <Clock size={20} color={T.primary} />
            </View>
            <View style={styles.scheduleHeaderText}>
              <Text style={[styles.scheduleHeaderTitle, { color: T.text }]}>{selectedDay}</Text>
              <Text style={[styles.scheduleHeaderSub, { color: T.subText }]}>
                {schedule.length} {schedule.length === 1 ? 'class' : 'classes'}
              </Text>
            </View>
          </View>
          
          <View style={styles.scheduleHeaderRight}>
          </View>
        </View>

        {schedule.length > 0 ? (
          schedule.map((item, i) => {
            const isPriority = currentOrNext && currentOrNext._id === item._id;
            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot, 
                    { 
                      backgroundColor: item.color || T.primary,
                      shadowColor: item.color || T.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                      width: isPriority ? 18 : 14,
                      height: isPriority ? 18 : 14,
                      borderRadius: isPriority ? 9 : 7,
                    }
                  ]} />
                  {i < schedule.length - 1 && <View style={[styles.timelineLine, { backgroundColor: T.border }]} />}
                </View>
                
                <View style={[
                  styles.scheduleCard, 
                  { 
                    backgroundColor: T.card,
                    borderLeftColor: item.color || T.primary, 
                    borderLeftWidth: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderColor: isPriority ? T.primary : T.border,
                    borderWidth: isPriority ? 2 : 1,
                  }
                ]}>
                  {isPriority && (
                    <View style={[styles.priorityBadge, { backgroundColor: T.primary }]}>
                      <Text style={styles.priorityBadgeText}>{currentOrNext.status === 'CURRENT' ? 'NOW' : 'NEXT'}</Text>
                    </View>
                  )}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.timeBadge, { backgroundColor: T.primary + '20' }]}>
                      <Text style={[styles.timeBadgeText, { color: item.color || T.primary }]}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    <View style={[styles.subjectIconBox, { backgroundColor: T.input }]}>
                      <BookOpen size={18} color={item.color || T.primary} />
                    </View>
                  </View>
                  
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardSubject, { color: T.text }]}>{item.subject?.name}</Text>
                    <View style={styles.cardMeta}>
                      <View style={styles.cardMetaItem}>
                        <Users size={14} color={T.subText} />
                        <Text style={[styles.cardMetaText, { color: T.subText }]}>
                          {item.class?.name} - {item.class?.section}
                        </Text>
                      </View>
                      <View style={styles.cardMetaItem}>
                        <MapPin size={14} color={T.subText} />
                        <Text style={[styles.cardMetaText, { color: T.subText }]}>
                          Room {item.room || 'TBD'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardMeta}>
                      <View style={[styles.codeBadge, { backgroundColor: (item.color || T.primary) + '20', color: item.color || T.primary }]}>
                        <Text style={styles.codeBadgeText}>{item.subject?.code}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: T.card }]}>
            <Calendar size={52} color={T.subText} />
            <Text style={[styles.emptyText, { color: T.subText }]}>No classes scheduled for {selectedDay}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appBar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#fff', opacity: 0.8 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn:    { padding: 4 },
  refreshBtn: { padding: 4 },
  filterBtn: { padding: 4 },
  scroll: { padding: 20 },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
  },
  heroLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  heroIconBox: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  alignItems: 'flex-start',
  },
  heroDay:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  heroDayName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#fff' },
  statTime: { fontSize: 14, fontWeight: '600', color: '#fff' },
  heroRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateBadgeText: { fontSize: 13, fontWeight: '700' },
  notificationBadge: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  daySelectorCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  daySelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  daySelectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayScroll: {
    gap: 10,
    paddingRight: 20,
  },
  dayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 55,
    alignItems: 'center',
  },
  dayBtnContent: {
    alignItems: 'center',
  },
  dayBtnText: {
    fontSize: 13,
  },
  dayIndicator: {
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleHeaderText: {
    justifyContent: 'center',
  },
  scheduleHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scheduleHeaderSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  addPeriodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addPeriodBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 20,
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 4,
  },
  scheduleCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subjectIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  cardContent: {
    gap: 10,
  },
  cardSubject: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priorityBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 20,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  pickerOptions: {
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeInputsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default TeacherSchedule;

