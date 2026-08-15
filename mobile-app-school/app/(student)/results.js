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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetStudentResultsQuery, useGetStudentDashboardStatsQuery } from '../../src/store/mobileApiSlice';
import {
  GraduationCap,
  ChevronLeft,
  FileText,
  Calendar,
  ChevronRight,
  Info,
  User as UserIcon,
  BookOpen,
  Lock,
  AlertCircle,
  CreditCard
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
  rowBorder:  '#F1F5F9',
  accent:     '#4F46E5',
  infoBg:     '#E0F2FE',
  infoBorder: '#BAE6FD',
  infoText:   '#0369A1',
  danger:     '#EF4444',
  dangerBg:   '#FEF2F2',
  warning:    '#F59E0B',
};

const StudentResults = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'transcript', 'detailed'
  const [selectedResult, setSelectedResult] = useState(null);
  
  const { data: resultsData, isLoading: rLoading, error } = useGetStudentResultsQuery();
  const { data: stats,        isLoading: sLoading } = useGetStudentDashboardStatsQuery();

  if (rLoading || sLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // Handle blocked state (unpaid fees)
  if (resultsData?.isBlocked || (error?.status === 403 && error?.data?.isBlocked)) {
    const blockData = resultsData || error?.data;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.lockedContainer}>
          <View style={styles.lockedCard}>
            <View style={styles.lockIconCircle}>
              <Lock size={48} color={C.danger} />
            </View>
            
            <Text style={styles.lockedTitle}>Results Locked</Text>
            <Text style={styles.lockedMessage}>
              {blockData.message || "You must clear all outstanding fees to view exam results"}
            </Text>

            <View style={styles.dueContainer}>
              <View style={styles.dueHeader}>
                <AlertCircle size={18} color={C.warning} />
                <Text style={styles.dueHeaderText}>Outstanding Dues</Text>
              </View>
              
              <View style={styles.dueRow}>
                <Text style={styles.dueLabel}>Total Due Amount:</Text>
                <Text style={styles.dueValue}>${blockData.totalDue?.toFixed(2)}</Text>
              </View>

              <View style={styles.unpaidMonthsContainer}>
                <Text style={styles.unpaidMonthsLabel}>Unpaid Months:</Text>
                <View style={styles.monthsList}>
                  {blockData.unpaidMonths?.map((month, idx) => (
                    <View key={idx} style={styles.monthBadge}>
                      <Text style={styles.monthBadgeText}>{month}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => router.push('/payments')}
            >
              <CreditCard size={20} color={C.white} />
              <Text style={styles.payButtonText}>Pay Fees Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const allResults = resultsData?.allResults || [];
  const studentInfo = resultsData?.studentInfo || {};
  const recordCount = allResults.length;

  const renderSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconCircle}>
          <FileText size={24} color={C.white} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Examination Results</Text>
          <Text style={styles.headerSubtitle}>View your academic performance</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>View Results</Text>

      {/* Transcript View Button */}
      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => setViewMode('transcript')}
      >
        <View style={[styles.optionIconBox, { backgroundColor: '#FFF7ED' }]}>
          <FileText size={22} color="#F97316" />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Academic Summary</Text>
          <Text style={styles.optionSubtitle}>Complete record of all subject results</Text>
        </View>
        <ChevronRight size={20} color="#CBD5E1" />
      </TouchableOpacity>

      {/* Detailed View Button */}
      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => setViewMode('detailed')}
      >
        <View style={[styles.optionIconBox, { backgroundColor: '#FEF2F2' }]}>
          <Calendar size={22} color="#EF4444" />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Detailed Marks</Text>
          <Text style={styles.optionSubtitle}>View breakdown of M1, Mid, M2, and Final</Text>
        </View>
        <ChevronRight size={20} color="#CBD5E1" />
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Info size={18} color={C.infoText} />
          <Text style={styles.infoBoxTitle}>Academic Information</Text>
        </View>
        <Text style={styles.infoBoxText}>
          Choose how you want to view your examination results. Transcript shows all results, while semester view shows results by academic period.
        </Text>
      </View>
    </ScrollView>
  );

  const renderTranscript = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setViewMode('selection')}
      >
        <ChevronLeft size={20} color={C.primary} />
        <Text style={styles.backButtonText}>Back to Options</Text>
      </TouchableOpacity>

      <View style={styles.countBadge}>
        <View style={styles.countIconBox}>
          <GraduationCap size={18} color={C.primary} />
        </View>
        <Text style={styles.countText}>{recordCount} Academic Records</Text>
      </View>

      <View style={styles.semesterBlock}>
        <View style={styles.semesterHeader}>
          <View style={styles.semHeaderIconBox}>
            <GraduationCap size={18} color={C.white} />
          </View>
          <Text style={styles.semHeaderTitle}>Academic Year 2026</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Course Name</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Total (/100)</Text>
          </View>
          {allResults.length === 0 ? (
            <View style={styles.emptyResults}>
              <Text style={styles.emptyText}>No results found yet.</Text>
            </View>
          ) : (
            allResults.map((res, idx) => {
              const subjectTotal = (res.monthly1 || 0) + (res.midterm || 0) + (res.monthly2 || 0) + (res.final || 0);
              return (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{res.subject?.name || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', fontWeight: '800', color: C.primary }]}>
                    {subjectTotal.toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderDetailedView = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setViewMode('selection')}
      >
        <ChevronLeft size={20} color={C.primary} />
        <Text style={styles.backButtonText}>Back to Options</Text>
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIconBox}>
            <UserIcon size={20} color={C.white} />
          </View>
          <Text style={styles.profileTitle}>Student Profile</Text>
        </View>
        
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileLabel}>Student ID</Text>
          <Text style={styles.profileValue}>{studentInfo.customId}</Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileLabel}>Name</Text>
          <Text style={styles.profileValue}>{studentInfo.name}</Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileLabel}>Class</Text>
          <Text style={styles.profileValue}>{stats?.className || 'N/A'}</Text>
        </View>

        {/* Cumulative Ranking Section */}
        <View style={styles.rankProgression}>
          <Text style={styles.rankProgTitle}>Class Rank Progression</Text>
          <View style={styles.rankGrid}>
            {[
              { label: 'M1', key: 'monthly1' },
              { label: 'Mid', key: 'midterm' },
              { label: 'M2', key: 'monthly2' },
              { label: 'Final', key: 'final' }
            ].map((item, i) => (
              <View key={i} style={styles.rankItem}>
                <Text style={styles.rankLabel}>{item.label}</Text>
                <Text style={styles.rankValue}>
                  {resultsData?.rankingData?.[item.key]?.rank ? `#${resultsData.rankingData[item.key].rank}` : '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Subject Breakdown ({allResults.length})</Text>

      {/* Detailed Marks Cards */}
      {allResults.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No course marks available.</Text>
        </View>
      ) : (
        allResults.map((res, idx) => (
          <View key={idx} style={styles.markCard}>
            <View style={styles.markCardHeader}>
              <View style={styles.markIconBox}>
                <BookOpen size={18} color={C.white} />
              </View>
              <View style={styles.markHeaderTextContainer}>
                <Text style={styles.markSubjectName}>{res.subject?.name || 'N/A'}</Text>
                <Text style={styles.markSubjectCode}>{res.subject?.code || 'N/A'}</Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>
                  {((res.monthly1 || 0) + (res.midterm || 0) + (res.monthly2 || 0) + (res.final || 0)).toFixed(1)}
                </Text>
                <Text style={styles.maxMarkText}>/ 100</Text>
              </View>
            </View>

            <View style={styles.markGrid}>
              <View style={styles.markItem}>
                <Text style={styles.markLabel}>M1</Text>
                <Text style={styles.markValue}>{res.monthly1 || '0'}</Text>
              </View>
              <View style={styles.markItem}>
                <Text style={styles.markLabel}>Midterm</Text>
                <Text style={styles.markValue}>{res.midterm || '0'}</Text>
              </View>
              <View style={styles.markItem}>
                <Text style={styles.markLabel}>M2</Text>
                <Text style={styles.markValue}>{res.monthly2 || '0'}</Text>
              </View>
              <View style={styles.markItem}>
                <Text style={styles.markLabel}>Final</Text>
                <Text style={styles.markValue}>{res.final || '0'}</Text>
              </View>
            </View>

            {/* Progressive Total for this subject */}
            <View style={styles.progressiveContainer}>
              <Text style={styles.progressiveTitle}>Progressive Subject Totals</Text>
              <View style={styles.progressiveRow}>
                <View style={styles.progItem}>
                  <Text style={styles.progLabel}>After M1</Text>
                  <Text style={styles.progValue}>{res.monthly1 || 0}</Text>
                </View>
                <View style={styles.progItem}>
                  <Text style={styles.progLabel}>After Mid</Text>
                  <Text style={styles.progValue}>{(res.monthly1 || 0) + (res.midterm || 0)}</Text>
                </View>
                <View style={styles.progItem}>
                  <Text style={styles.progLabel}>After M2</Text>
                  <Text style={styles.progValue}>{(res.monthly1 || 0) + (res.midterm || 0) + (res.monthly2 || 0)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const getTitle = () => {
    if (viewMode === 'transcript') return 'Academic Summary';
    if (viewMode === 'detailed') return 'Detailed Results';
    return 'Examination';
  };

  const handleBack = () => {
    if (viewMode !== 'selection') {
      setViewMode('selection');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {viewMode === 'selection' && renderSelection()}
      {viewMode === 'transcript' && renderTranscript()}
      {viewMode === 'detailed' && renderDetailedView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  optionCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  optionSubtitle: {
    fontSize: 13,
    color: C.sub,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: C.infoBg,
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.infoBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.infoText,
    marginLeft: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: C.infoText,
    lineHeight: 18,
    opacity: 0.8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
    marginLeft: 4,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  countIconBox: {
    marginRight: 6,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  semesterBlock: {
    backgroundColor: C.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  semesterHeader: {
    backgroundColor: C.primaryMid,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  semHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  semHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  table: {
    padding: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.rowBorder,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.rowBorder,
  },
  tableCell: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.rowBorder,
  },
  profileLabel: {
    fontSize: 14,
    color: C.sub,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  rankProgression: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.rowBorder,
  },
  rankProgTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 12,
  },
  rankItem: {
    alignItems: 'center',
    flex: 1,
  },
  rankLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.sub,
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.primary,
  },
  markCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  markCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  markIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryMid,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  markHeaderTextContainer: {
    flex: 1,
  },
  markSubjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  markSubjectCode: {
    fontSize: 12,
    color: C.sub,
    marginTop: 1,
  },
  totalBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  totalBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.accent,
  },
  markGrid: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 12,
  },
  markItem: {
    flex: 1,
    alignItems: 'center',
  },
  markLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.sub,
    marginBottom: 4,
  },
  markValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  progressiveContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: C.rowBorder,
  },
  progressiveTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  progressiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progItem: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  progLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.sub,
    marginBottom: 2,
  },
  progValue: {
    fontSize: 13,
    fontWeight: '800',
    color: C.accent,
  },
  maxMarkText: {
    fontSize: 10,
    color: C.sub,
    fontWeight: '600',
    marginLeft: 2,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedCard: {
    backgroundColor: C.white,
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  lockIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: 12,
  },
  lockedMessage: {
    fontSize: 16,
    color: C.sub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  dueContainer: {
    width: '100%',
    backgroundColor: C.bg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  dueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dueHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.warning,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dueLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  dueValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.danger,
  },
  unpaidMonthsContainer: {
    width: '100%',
  },
  unpaidMonthsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.sub,
    marginBottom: 12,
  },
  monthsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthBadge: {
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
  },
  payButton: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    marginLeft: 10,
  },
});

export default StudentResults;

