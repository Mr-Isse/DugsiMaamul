import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { Phone, Mail, MapPin, Clock } from 'lucide-react-native';

const ContactPage = () => {
  const { dark: isDark } = useTheme();

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+252 61 XXX XXXX', action: () => Linking.openURL('tel:+252610000000') },
    { icon: Mail, label: 'Email', value: 'info@school.edu', action: () => Linking.openURL('mailto:info@school.edu') },
    { icon: MapPin, label: 'Address', value: 'Mogadishu, Somalia', action: null },
    { icon: Clock, label: 'Office Hours', value: 'Mon-Fri: 8:00 AM - 4:00 PM', action: null },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.content}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Contact Us</Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            Get in touch with us
          </Text>
        </View>

        <View style={styles.section}>
          {contactInfo.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.contactCard, isDark && styles.contactCardDark]}
              onPress={item.action}
              disabled={!item.action}
            >
              <View style={styles.contactLeft}>
                <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
                  <item.icon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </View>
                <View>
                  <Text style={[styles.contactLabel, isDark && styles.contactLabelDark]}>{item.label}</Text>
                  <Text style={[styles.contactValue, isDark && styles.contactValueDark]}>{item.value}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  headerTitleDark: {
    color: '#F1F5F9',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  headerSubtitleDark: {
    color: '#94A3B8',
  },
  section: {
    padding: 20,
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDark: {
    backgroundColor: '#1E3A8A',
  },
  contactLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  contactLabelDark: {
    color: '#94A3B8',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  contactValueDark: {
    color: '#F1F5F9',
  },
});

export default ContactPage;

