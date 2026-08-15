import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  TextInput
} from 'react-native';
import { useGetAssignedClassesQuery, useGetTaughtSubjectsQuery } from '../../src/store/mobileApiSlice';
import { 
  BookOpen, 
  ChevronRight, 
  Users, 
  Search,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

const ClassesAndSubjects = () => {
  const { theme } = useTheme();
  const T = theme;
  const { data: classes, isLoading: classesLoading } = useGetAssignedClassesQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetTaughtSubjectsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { initialClassId } = useLocalSearchParams();
  const flatListRef = React.useRef(null);

  useEffect(() => {
    if (initialClassId && classes && !classesLoading) {
      // Logic to highlight or scroll to the class if needed
      // For now, we'll just keep the filtered search logic simple
    }
  }, [initialClassId, classes, classesLoading]);

  if (classesLoading || subjectsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubjectsForClass = (classId) => {
    return subjects?.filter(s => s.class?._id === classId || s.class === classId) || [];
  };

  const renderClassItem = ({ item }) => {
    const classSubjects = getSubjectsForClass(item._id);
    const isHighlighted = initialClassId === item._id;
    
    return (
      <View style={[
        styles.classCard, 
        { backgroundColor: T.card, borderColor: isHighlighted ? T.primary : T.border },
        isHighlighted && { borderWidth: 2, shadowColor: T.primary, shadowOpacity: 0.2 }
      ]}>
        <View style={styles.cardHeader}>
          <View style={styles.classInfo}>
            <View style={[styles.classIcon, { backgroundColor: T.primary }]}>
              <Text style={styles.classIconText}>{item.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={[styles.className, { color: T.text }]}>{item.name}</Text>
              <Text style={[styles.classSection, { color: T.subText }]}>Section {item.section}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.subjectsTitle, { color: T.text }]}>Your Subjects in this Class:</Text>
          <View style={styles.subjectList}>
            {classSubjects.map((sub, idx) => (
              <TouchableOpacity 
                key={sub._id || idx} 
                style={[styles.subjectItem, { backgroundColor: T.bg, borderColor: T.border }]}
                onPress={() => router.push({
                  pathname: '/(teacher)/students/[classId]',
                  params: { 
                    classId: item._id, 
                    className: item.name, 
                    section: item.section,
                    subjectId: sub._id,
                    subjectName: sub.name
                  }
                })}
              >
                <View style={styles.subjectInfo}>
                  <BookOpen size={16} color={T.primary} />
                  <Text style={[styles.subjectNameText, { color: T.text }]}>{sub.name}</Text>
                </View>
                <ChevronRight size={18} color={T.subText} />
              </TouchableOpacity>
            ))}
            {classSubjects.length === 0 && (
              <Text style={[styles.noSubjectsText, { color: T.subText }]}>No subjects assigned to you for this class.</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: T.card, borderColor: T.border }]}>
          <Search size={20} color={T.subText} />
          <TextInput
            style={[styles.searchInput, { color: T.text }]}
            placeholder="Search classes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={T.subText}
          />
        </View>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: T.card }]}>
          <Filter size={20} color={T.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color={T.subText} />
            <Text style={[styles.emptyText, { color: T.subText }]}>No classes found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  classCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  classIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  className: {
    fontSize: 17,
    fontWeight: '800',
  },
  classSection: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 14,
  },
  subjectsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.8,
  },
  subjectList: {
    gap: 10,
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noSubjectsText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default ClassesAndSubjects;


