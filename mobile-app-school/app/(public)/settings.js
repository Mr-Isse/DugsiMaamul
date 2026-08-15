import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../src/theme';
import { saveSelectedSchool } from '../../src/store/schoolSlice';
import { getImageUri } from '../../src/utils/imageUtils';
import { 
  School, 
  Moon, 
  Sun, 
  UserCircle, 
  GraduationCap, 
  Users,
  RefreshCcw, 
  ChevronRight,
  Code2 
} from 'lucide-react-native';

import { SCHOOL_CONFIG, TENANT_ID } from '../../config';

const SettingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, dark, toggleTheme } = useTheme();
  const { selectedSchool } = useSelector((state) => state.school);

  const handleAboutDeveloper = () => {
    router.push('/(public)/developer');
  };

  const handleChangeSchool = async () => {
    await dispatch(saveSelectedSchool(null));
    router.replace('/school-selection');
  };

  const SettingItem = ({ icon: Icon, title, value, onValueChange, type = 'toggle', onPress }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: dark ? '#1E293B' : '#F1F5F9' }]}>
          <Icon size={20} color={theme.primary} />
        </View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#CBD5E1', true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <ChevronRight size={20} color={theme.subText} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        </View>

        {/* School Info Section */}
        <View style={[styles.schoolSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.schoolLogoContainer, { backgroundColor: dark ? '#1E293B' : '#F1F5F9' }]}>
            {getImageUri(selectedSchool?.logo) ? (
              <Image 
                source={{ uri: getImageUri(selectedSchool.logo) }} 
                style={styles.schoolLogo} 
                resizeMode="contain" 
              />
            ) : (
              <School size={40} color={theme.primary} />
            )}
          </View>
          <View style={styles.schoolInfo}>
            <Text style={[styles.schoolName, { color: theme.text }]}>{selectedSchool?.name || SCHOOL_CONFIG.appName}</Text>
            {/* <Text style={[styles.schoolCode, { color: theme.subText }]}>ID: {selectedSchool?.code || TENANT_ID}</Text> */}
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>APPEARANCE</Text>
          <SettingItem 
            icon={dark ? Moon : Sun} 
            title="Dark Mode" 
            value={dark} 
            onValueChange={toggleTheme} 
          />
          {/* <SettingItem 
            icon={RefreshCcw} 
            title="Change School" 
            type="link"
            onPress={handleChangeSchool}
          /> */}
          <SettingItem 
            icon={Code2} 
            title="About Developer" 
            type="link"
            onPress={handleAboutDeveloper}
          />
        </View>

        {/* Login Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>LOGIN AS</Text>
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'student' } })}
          >
            <GraduationCap size={24} color="#FFF" />
            <Text style={styles.loginBtnText}>Student Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: '#10B981' }]}
            onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'teacher' } })}
          >
            <UserCircle size={24} color="#FFF" />
            <Text style={styles.loginBtnText}>Teacher Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'parent' } })}
          >
            <Users size={24} color="#FFF" />
            <Text style={styles.loginBtnText}>Parent Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.subText }]}>Version 2.0.0</Text>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  schoolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  schoolLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  schoolLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  schoolCode: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SettingsPage;
