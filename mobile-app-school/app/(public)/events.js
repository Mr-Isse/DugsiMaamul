import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTheme } from '../../src/theme';
import { getImageUri } from '../../src/utils/imageUtils';
import { useGetPublicEventsQuery } from '../../src/store/mobileApiSlice';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react-native';

const EventsPage = () => {
  const { theme, dark } = useTheme();
  const { selectedSchool } = useSelector((state) => state.school);
  
  const { data: events, isLoading, refetch } = useGetPublicEventsQuery(selectedSchool?._id, {
    skip: !selectedSchool?._id
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderEvent = ({ item }) => (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      activeOpacity={0.7}
    >
      {getImageUri(item.image) && (
        <Image 
          source={{ uri: getImageUri(item.image) }} 
          style={styles.eventImage} 
        />
      )}
      <View style={styles.eventContent}>
        <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.typeText, { color: theme.primary }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.eventDesc, { color: theme.subText }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.footerItem}>
            <Calendar size={14} color={theme.subText} />
            <Text style={[styles.footerText, { color: theme.subText }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          {item.location && (
            <View style={styles.footerItem}>
              <MapPin size={14} color={theme.subText} />
              <Text style={[styles.footerText, { color: theme.subText }]}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>School Events</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>
          Stay updated with our latest activities
        </Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={theme.subText} style={{ marginBottom: 16 }} />
            <Text style={{ color: theme.subText, fontSize: 16 }}>No upcoming events</Text>
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
  },
  listContent: {
    padding: 24,
    paddingBottom: 120,
  },
  eventCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  eventDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  }
});

export default EventsPage;

