import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Newspaper, Calendar, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '../../src/theme';
import { useGetPublicEventsQuery } from '../../src/store/mobileApiSlice';
import { useTenant } from '../../src/tenant';

const NewsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { tenant } = useTenant();
  const { selectedSchool } = useSelector((state) => state.school);

  const { data: events, isLoading } = useGetPublicEventsQuery(selectedSchool?._id, {
    skip: !selectedSchool?._id,
  });

  const noticeItems = (tenant?.notices || []).map((n, i) => ({
    id: n.id || `notice-${i}`,
    title: n.title,
    date: n.date ? new Date(n.date).toLocaleDateString() : '',
    category: 'Notice',
  }));

  const eventItems = (events || []).map((e) => ({
    id: e._id || e.id,
    title: e.title,
    date: e.date ? new Date(e.date).toLocaleDateString() : '',
    category: 'Event',
  }));

  const newsItems = [...noticeItems, ...eventItems];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '15' }]}>
        <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category}</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.subText} />
          <Text style={[styles.date, { color: theme.subText }]}>{item.date}</Text>
        </View>
        <ArrowRight size={18} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>News & Events</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : newsItems.length === 0 ? (
        <View style={styles.center}>
          <Newspaper size={48} color={theme.subText} />
          <Text style={[styles.empty, { color: theme.subText }]}>No news or events yet</Text>
        </View>
      ) : (
        <FlatList
          data={newsItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  list: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { marginTop: 12, fontSize: 15 },
});

export default NewsScreen;
