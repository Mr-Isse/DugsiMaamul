import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Users, GraduationCap, Megaphone, Calendar, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useGetParentChildrenQuery, useGetParentAnnouncementsQuery } from '../../src/store/mobileApiSlice';

const ParentHome = () => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: childrenData, isLoading, error, refetch } = useGetParentChildrenQuery();
  const { data: announcementsData, refetch: refetchAnnouncements } = useGetParentAnnouncementsQuery();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const T = theme;

  const children = childrenData?.data || [];
  const announcements = announcementsData?.data || [];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchAnnouncements()]);
    setRefreshing(false);
  }, []);

  const handleChildSelect = (studentId) => {
    router.push(`/(parent)/${studentId}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: T.text }]}>Failed to load children</Text>
          <TouchableOpacity onPress={refetch} style={[styles.retryButton, { backgroundColor: T.primary }]}>
            <Text style={[styles.retryText, { color: '#fff' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.appBar }]}>
        <Text style={styles.headerTitle}>Parent Portal</Text>
        <Text style={styles.headerSubtitle}>{userInfo?.name || 'Welcome'}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >
        <Text style={[styles.sectionTitle, { color: T.text }]}>My Children</Text>
        
        {children.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: T.card, borderColor: T.border }]}>
            <Users size={40} color={T.subText} />
            <Text style={[styles.emptyText, { color: T.subText, marginTop: 12 }]}>No children linked to your account</Text>
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity
              key={child._id}
              style={[styles.childCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => handleChildSelect(child._id)}
              activeOpacity={0.7}
            >
              <View style={[styles.childIconWrapper, { backgroundColor: T.primary + '15' }]}>
                <GraduationCap size={28} color={T.primary} />
              </View>
              <View style={styles.childInfo}>
                <Text style={[styles.childName, { color: T.text }]}>{child.name}</Text>
                <Text style={[styles.childClass, { color: T.subText }]}>
                  {child.class ? `${child.class.name}${child.class.section ? ` — ${child.class.section}` : ''}` : 'Class not assigned'}
                </Text>
                {child.customId && (
                  <Text style={[styles.childId, { color: T.subText }]}>ID: {child.customId}</Text>
                )}
              </View>
              <ChevronRight size={20} color={T.subText} />
            </TouchableOpacity>
          ))
        )}

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text, marginTop: 32 }]}>
              <Megaphone size={16} color={T.primary} /> Announcements
            </Text>
            {announcements.slice(0, 5).map((a) => (
              <View
                key={a._id}
                style={[styles.announcementCard, { backgroundColor: T.card, borderColor: T.border }]}
              >
                <View style={styles.announcementHeader}>
                  <Text style={[styles.announcementTitle, { color: T.text }]} numberOfLines={1}>{a.title}</Text>
                  <View style={[styles.audienceBadge, { backgroundColor: T.primary + '15' }]}>
                    <Text style={[styles.audienceText, { color: T.primary }]}>{a.audience}</Text>
                  </View>
                </View>
                <Text style={[styles.announcementMessage, { color: T.subText }]} numberOfLines={2}>
                  {a.message || a.content}
                </Text>
                <Text style={[styles.announcementDate, { color: T.subText }]}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  childIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  childClass: {
    fontSize: 13,
    marginBottom: 2,
  },
  childId: {
    fontSize: 11,
    fontWeight: '600',
  },
  announcementCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  audienceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  audienceText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  announcementMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  announcementDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ParentHome;
