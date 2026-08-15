import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTheme } from '../../src/theme';
import { getImageUri } from '../../src/utils/imageUtils';
import { useGetPublicContentQuery } from '../../src/store/mobileApiSlice';
import { Target, Eye, ShieldCheck, User } from 'lucide-react-native';

const AboutPage = () => {
  const { theme, dark } = useTheme();
  const { selectedSchool } = useSelector((state) => state.school);
  
  const { data, isLoading } = useGetPublicContentQuery(selectedSchool?._id, {
    skip: !selectedSchool?._id
  });

  const aboutContent = data?.about || {
    history: 'Our school has a long history of academic excellence.',
    mission: 'To provide quality education to all students.',
    vision: 'To be a leading educational institution in the region.',
    values: ['Integrity', 'Excellence', 'Respect', 'Innovation']
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const Section = ({ icon: Icon, title, content }) => (
    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: dark ? '#1E293B' : '#F1F5F9' }]}>
          <Icon size={24} color={theme.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionText, { color: theme.subText }]}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>About Our School</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            Building futures, one student at a time
          </Text>
        </View>

        {aboutContent.principalMessage && (
          <View style={[styles.principalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.principalInfo}>
              {getImageUri(aboutContent.principalImage) ? (
                <Image 
                  source={{ uri: getImageUri(aboutContent.principalImage) }} 
                  style={styles.principalImage} 
                />
              ) : (
                <View style={[styles.principalPlaceholder, { backgroundColor: dark ? '#1E293B' : '#F1F5F9' }]}>
                  <User size={40} color={theme.primary} />
                </View>
              )}
              <View>
                <Text style={[styles.principalName, { color: theme.text }]}>Principal's Message</Text>
                <Text style={[styles.principalTitle, { color: theme.subText }]}>Leading with Excellence</Text>
              </View>
            </View>
            <Text style={[styles.principalText, { color: theme.subText }]}>
              "{aboutContent.principalMessage}"
            </Text>
          </View>
        )}

        <Section icon={ShieldCheck} title="Our History" content={aboutContent.history} />
        <Section icon={Target} title="Our Mission" content={aboutContent.mission} />
        <Section icon={Eye} title="Our Vision" content={aboutContent.vision} />

        {aboutContent.values && aboutContent.values.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>Core Values</Text>
            <View style={styles.valuesGrid}>
              {aboutContent.values.map((value, index) => (
                <View key={index} style={[styles.valueTag, { backgroundColor: dark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.valueText, { color: theme.primary }]}>{value}</Text>
                </View>
              ))}
            </View>
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
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  principalCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  principalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  principalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  principalPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  principalName: {
    fontSize: 17,
    fontWeight: '700',
  },
  principalTitle: {
    fontSize: 14,
  },
  principalText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  valueText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AboutPage;

