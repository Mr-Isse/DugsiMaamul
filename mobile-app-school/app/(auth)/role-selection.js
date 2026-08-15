import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { 
  LayoutDashboard, 
  UserSquare2, 
  GraduationCap, 
  ChevronRight,
  School,
  ChevronLeft,
  User
} from 'lucide-react-native';

import { useSelector } from 'react-redux';
import { SCHOOL_CONFIG } from '../../config';

const RoleSelection = () => {
  const router = useRouter();
  const { selectedSchool } = useSelector((state) => state.school);

  // Use the app's own theme context (respects the in-app dark mode toggle)
  const { dark, theme } = useTheme();

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage schools, students, teachers & reports',
      icon: LayoutDashboard,
      color: theme.primary,
      bg: dark ? theme.primary + '33' : theme.primary + '10',
      iconColor: theme.primary,
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Take attendance, submit marks, manage classes',
      icon: UserSquare2,
      color: '#10B981',
      bg: dark ? '#0d2e24' : '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      id: 'student',
      title: 'Student',
      description: 'View schedule, attendance, exams & fees',
      icon: GraduationCap,
      color: '#0EA5E9',
      bg: dark ? '#0c2233' : '#F0F9FF',
      iconColor: '#0EA5E9',
    },
    {
      id: 'parent',
      title: 'Parent',
      description: 'View your children\'s attendance, exams & fees',
      icon: User,
      color: '#8B5CF6',
      bg: dark ? '#2e1f55' : '#F5F3FF',
      iconColor: '#8B5CF6',
    },
    {
      id: 'branchmanager',
      title: 'Branch Manager',
      description: 'Manage specific branch operations',
      icon: LayoutDashboard,
      color: '#F59E0B',
      bg: dark ? '#3d2907' : '#FEF3C7',
      iconColor: '#F59E0B',
    },
  ];

  const handleRoleSelect = (roleId) => {
    router.push({ pathname: '/(auth)/login', params: { role: roleId } });
  };

  const appName = selectedSchool?.name || SCHOOL_CONFIG.appName;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.replace('/(public)')}
      >
        <ChevronLeft size={22} color={theme.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.card }]}>
            <School size={40} color={theme.primary} />
          </View>
          <Text style={[styles.welcomeText, { color: theme.subText }]}>Welcome to</Text>
          <Text style={[styles.appName, { color: theme.primary }]}>{appName}</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Select your role to continue</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: role.color,
                },
              ]}
              onPress={() => handleRoleSelect(role.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrapper, { backgroundColor: role.bg }]}>
                <role.icon size={30} color={role.iconColor} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleTitle, { color: theme.text }]}>{role.title}</Text>
                <Text style={[styles.roleDescription, { color: theme.subText }]}>{role.description}</Text>
              </View>
              <View style={[styles.chevronWrapper, { backgroundColor: theme.bg }]}>
                <ChevronRight size={18} color={theme.subText} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subText }]}>
            Powered by {appName} System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    elevation: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: 18,
    marginRight: 8,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: '500',
  },
  chevronWrapper: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 44,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default RoleSelection;

