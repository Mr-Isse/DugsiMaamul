import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '../../src/theme';
import { useGetPublicContentQuery, useGetPublicEventsQuery } from '../../src/store/mobileApiSlice';
import { School, Users, Calendar, Settings, ChevronRight, Info, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getImageUri } from '../../src/utils/imageUtils';

import { SCHOOL_CONFIG } from '../../config';

const HomePage = () => {
  const router = useRouter();
  const { theme, dark } = useTheme();
  const { selectedSchool } = useSelector((state) => state.school);
  
  const { data, isLoading, error } = useGetPublicContentQuery(selectedSchool?._id, {
    skip: !selectedSchool?._id
  });
  const { data: events, isLoading: eventsLoading } = useGetPublicEventsQuery(selectedSchool?._id, {
    skip: !selectedSchool?._id
  });

  const homeContent = data?.home || {
    heroTitle: 'Welcome to Our School',
    heroSubtitle: 'Providing quality education for everyone'
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Dynamic Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.miniLogoContainer, { backgroundColor: theme.primary + '15' }]}>
              {getImageUri(selectedSchool?.logo) ? (
                <Image 
                  source={{ uri: getImageUri(selectedSchool.logo) }} 
                  style={styles.miniLogo} 
                  resizeMode="contain" 
                />
              ) : (
                <School size={20} color={theme.primary} />
              )}
            </View>
            <View>
              <Text style={[styles.schoolNameText, { color: theme.text }]}>
                {selectedSchool?.name || SCHOOL_CONFIG.appName}
              </Text>
              {homeContent.motto ? (
                <Text style={[styles.mottoText, { color: theme.primary }]}>{homeContent.motto}</Text>
              ) : (
                <Text style={[styles.dateText, { color: theme.subText }]}>{today}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.profileIcon, { backgroundColor: theme.primary + '15' }]}
            onPress={() => router.push('/(auth)/role-selection')}
          >
            <Users size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Hero Section with Character */}
        <View style={styles.heroWrapper}>
          <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {getImageUri(homeContent.heroImage) ? (
              <Image 
                source={{ uri: getImageUri(homeContent.heroImage) }} 
                style={styles.heroBgImage} 
              />
            ) : (
              <View style={[styles.heroPlaceholder, { backgroundColor: theme.primary }]} />
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroBadge}>
                <Sparkles size={12} color="#FFF" />
                <Text style={styles.heroBadgeText}>OFFICIAL PORTAL</Text>
              </View>
              <Text style={styles.heroTitleText}>{homeContent.heroTitle}</Text>
              <View style={styles.heroSubtitleContainer}>
                <View style={[styles.heroAccentBar, { backgroundColor: theme.primary }]} />
                <Text style={styles.heroSubtitleText}>{homeContent.heroSubtitle}</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeLabel, { color: theme.primary }]}>WELCOME</Text>
          <Text style={[styles.welcomeMsg, { color: theme.text }]}>
            {homeContent.welcomeText || `Welcome to ${selectedSchool?.name || SCHOOL_CONFIG.appName} with Open Hands`}
          </Text>
          {selectedSchool?.subdomain ? (
            <Text style={[styles.tenantHint, { color: theme.subText }]}>
              Portal tenant: {selectedSchool.subdomain}
            </Text>
          ) : null}
        </View>

        {/* Dynamic Events Preview */}
        {events && events.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => router.push('/(public)/events')}>
                <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsScroll}>
              {events.slice(0, 5).map((event, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.eventPreviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => router.push('/(public)/events')}
                >
                  <Image 
                    source={getImageUri(event.image) ? { uri: getImageUri(event.image) } : require('../../assets/images/icon.png')} 
                    style={styles.eventPreviewImage} 
                  />
                  <View style={styles.eventPreviewContent}>
                    <Text style={[styles.eventPreviewTitle, { color: theme.text }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View style={styles.eventPreviewDate}>
                      <Calendar size={12} color={theme.subText} />
                      <Text style={[styles.eventPreviewDateText, { color: theme.subText }]}>
                        {new Date(event.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Content (if any) */}
        {getImageUri(homeContent.featuredImage) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Featured</Text>
            <Image 
              source={{ uri: getImageUri(homeContent.featuredImage) }} 
              style={styles.featuredImageLarge} 
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniLogo: {
    width: '100%',
    height: '100%',
  },
  schoolNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  mottoText: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    marginTop: -2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  heroWrapper: {
    padding: 20,
  },
  heroCard: {
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroAccentBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  heroSubtitleText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  welcomeMsg: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  tenantHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventsScroll: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  eventPreviewCard: {
    width: 220,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 16,
    overflow: 'hidden',
  },
  eventPreviewImage: {
    width: '100%',
    height: 120,
  },
  eventPreviewContent: {
    padding: 12,
  },
  eventPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  eventPreviewDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventPreviewDateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  featuredImageLarge: {
    width: '90%',
    height: 180,
    borderRadius: 20,
    alignSelf: 'center',
  }
});

export default HomePage;

