import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSchoolsQuery } from '../src/store/mobileApiSlice';
import { saveSelectedSchool } from '../src/store/schoolSlice';
import { useTheme } from '../src/theme';
import { getImageUri } from '../src/utils/imageUtils';
import { School, ChevronRight, Search } from 'lucide-react-native';
import Skeleton from '../src/components/Skeleton';

const SchoolSelection = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, isDark } = useTheme();
  const T = theme;

  const { data: schools, isLoading, error, refetch } = useGetSchoolsQuery();
  const { selectedSchool } = useSelector((state) => state.school);

  const handleSchoolSelect = async (school) => {
    await dispatch(saveSelectedSchool(school));
    router.replace('/(public)');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={styles.header}>
          <Skeleton width={200} height={32} style={{ marginBottom: 12 }} />
          <Skeleton width={250} height={18} />
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.schoolCard, { backgroundColor: T.card, borderColor: T.border, opacity: 0.6 }]}>
              <View style={styles.schoolInfo}>
                <Skeleton width={60} height={60} borderRadius={16} style={{ marginRight: 16 }} />
                <View>
                  <Skeleton width={150} height={20} style={{ marginBottom: 8 }} />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: T.bg }]}>
        <Text style={[styles.errorText, { color: '#EF4444' }]}>Failed to load schools</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: T.primary }]} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSchoolItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.schoolCard, { backgroundColor: T.card, borderColor: T.border }]}
      onPress={() => handleSchoolSelect(item)}
    >
      <View style={styles.schoolInfo}>
        <View style={[styles.logoContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          {getImageUri(item.logo) ? (
            <Image 
              source={{ uri: getImageUri(item.logo) }} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          ) : (
            <School size={32} color={T.primary} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.schoolName, { color: T.text }]}>{item.name}</Text>
          <Text style={[styles.schoolCode, { color: T.subText }]}>
            {[item.code, item.subdomain].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={T.subText} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.text }]}>Select Your School</Text>
        <Text style={[styles.subtitle, { color: T.subText }]}>
          Choose your institution to continue
        </Text>
      </View>

      <FlatList
        data={schools}
        renderItem={renderSchoolItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <School size={64} color={T.border} />
            <Text style={[styles.emptyText, { color: T.subText }]}>No schools found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logo: {
    width: 44,
    height: 44,
  },
  textContainer: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  schoolCode: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SchoolSelection;


