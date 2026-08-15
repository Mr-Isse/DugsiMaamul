import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../src/store/authSlice';
import { 
  useLoginMutation, 
  useStudentLoginMutation, 
  useTeacherLoginMutation, 
  useAdminLoginMutation,
  useParentLoginMutation,
  useBranchLoginMutation,
  useGetPublicBranchesQuery
} from '../../src/store/mobileApiSlice';
import { useTheme } from '../../src/theme';
import { getImageUri } from '../../src/utils/imageUtils';
import { 
  School, 
  User, 
  Lock, 
  ChevronLeft,
  Eye,
  EyeOff,
  Building
} from 'lucide-react-native';

import { SCHOOL_CONFIG } from '../../config';

const Login = () => {
  const { role } = useLocalSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Use the app's own theme context (respects the in-app dark mode toggle)
  const { dark, theme } = useTheme();

  const [loginGeneric,  { isLoading: isGenericLoading  }] = useLoginMutation();
  const [loginStudent,  { isLoading: isStudentLoading  }] = useStudentLoginMutation();
  const [loginTeacher,  { isLoading: isTeacherLoading  }] = useTeacherLoginMutation();
  const [loginAdmin,    { isLoading: isAdminLoading    }] = useAdminLoginMutation();
  const [loginParent,   { isLoading: isParentLoading   }] = useParentLoginMutation();
  const [loginBranch,   { isLoading: isBranchLoading   }] = useBranchLoginMutation();

  const isLoading = isGenericLoading || isStudentLoading || isTeacherLoading || isAdminLoading || isParentLoading || isBranchLoading;

  // School name for the subtitle
  const { selectedSchool } = useSelector((state) => state.school);
  const schoolName = selectedSchool?.name || SCHOOL_CONFIG.appName;
  const tenantSubdomain = SCHOOL_CONFIG.tenantSubdomain;

  const { data: branches = [] } = useGetPublicBranchesQuery(selectedSchool?._id, { skip: !selectedSchool?._id });
  
  const isLoginDisabled = isLoading || !identifier.trim() || !password.trim() || (branches.length > 0 && selectedBranchId === null);
  
  useEffect(() => {
    if (branches.length === 1 && selectedBranchId === null) {
      setSelectedBranchId(branches[0]._id);
    }
  }, [branches]);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      alert('Please enter your ID');
      return;
    }
    if (!password.trim()) {
      alert('Please enter your password');
      return;
    }
    if (branches.length > 0 && selectedBranchId === null) {
      alert('Please select a branch');
      return;
    }

    try {
      console.log(`[Login] Attempting login for role: ${role}, ID: ${identifier.trim()}, Tenant: ${tenantSubdomain}, Branch: ${selectedBranchId}`);
      const res = await (
        role === 'student' ? loginStudent({ customId: identifier.trim(), password, branchId: selectedBranchId }).unwrap() :
        role === 'teacher' ? loginTeacher({ customId: identifier.trim(), password, branchId: selectedBranchId }).unwrap() :
        role === 'admin'   ? loginAdmin({ email: identifier.trim(), password, branchId: selectedBranchId }).unwrap() :
        role === 'branchmanager' ? loginBranch({ email: identifier.trim(), password, tenantId: tenantSubdomain }).unwrap() :
        role === 'parent'  ? loginParent(
          identifier.includes('@')
            ? { email: identifier.trim().toLowerCase(), password, branchId: selectedBranchId }
            : { phone: identifier.trim(), password, branchId: selectedBranchId }
        ).unwrap() :
        loginGeneric(
          identifier.includes('@')
            ? { email: identifier.trim(), password, branchId: selectedBranchId }
            : { customId: identifier.trim(), password, branchId: selectedBranchId }
        ).unwrap()
      );
      
      if (!res.role) throw new Error('User role not found in response');
      
      const userSchoolId = res.school?._id || res.school;
      const expected = tenantSubdomain;

      if (expected && expected !== 'default') {
        const schoolSubdomain = res.school?.subdomain;
        if (
          schoolSubdomain &&
          schoolSubdomain.toLowerCase() !== expected.toLowerCase()
        ) {
          throw new Error(
            `This account belongs to ${res.school?.name || 'another school'}. Install this school's app build (tenant: ${schoolSubdomain}).`
          );
        }
      }

      dispatch(setCredentials(res));
      
      if (res.role === 'student') {
        router.replace('/(student)');
      } else if (res.role === 'teacher') {
        router.replace('/(teacher)');
      } else if (res.role === 'parent') {
        router.replace('/(parent)');
      } else if (res.role === 'admin' || res.role === 'branch_manager' || res.role === 'branchmanager' || role === 'branchmanager') {
        alert('Branch/Admin access requires the Web Portal for full functionality.');
      }
    } catch (err) {
      console.error(`[Login] Login failed:`, err);
      const msg = err?.data?.userMessage || err?.data?.message || err?.message || 'Login failed';
      alert(msg);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/role-selection')}
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sign In</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo + Welcome */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {getImageUri(selectedSchool?.logo) ? (
              <Image
                source={{ uri: getImageUri(selectedSchool.logo) }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <School size={56} color={theme.primary} />
            )}
          </View>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome Back</Text>
          {/* Show selected school name and tenant ID */}
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            Sign in to continue to {schoolName}
          </Text>
          {tenantSubdomain && tenantSubdomain !== 'default' && (
            <View style={[styles.tenantBadge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.tenantBadgeText, { color: theme.primary }]}>
                Tenant: {tenantSubdomain}
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Branch Selection */}
          {branches.length > 0 && role !== 'branchmanager' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.subText, backgroundColor: theme.bg }]}>Branch (Optional)</Text>
              <TouchableOpacity 
                style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}
                onPress={() => setShowBranchDropdown(!showBranchDropdown)}
              >
                <Building size={20} color={theme.subText} style={styles.inputIcon} />
                <Text style={[styles.input, { color: selectedBranchId ? theme.text : theme.subText }]}>
                  {selectedBranchId ? branches.find(b => b._id === selectedBranchId)?.name : 'Select a branch...'}
                </Text>
              </TouchableOpacity>
              {showBranchDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                    onPress={() => { setSelectedBranchId(null); setShowBranchDropdown(false); }}
                  >
                    <Text style={{ color: theme.text }}>All Branches</Text>
                  </TouchableOpacity>
                  {branches.map(b => (
                    <TouchableOpacity
                      key={b._id}
                      style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                      onPress={() => { setSelectedBranchId(b._id); setShowBranchDropdown(false); }}
                    >
                      <Text style={{ color: theme.text }}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* User ID */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.subText, backgroundColor: theme.bg }]}>
              {role === 'admin' || role === 'branchmanager' ? 'Email' : (role === 'parent' ? 'Phone or Email' : 'User ID')}
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <User size={20} color={theme.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={role === 'admin' ? 'Enter your email' : (role === 'parent' ? 'Enter parent phone or email' : 'Enter your ID')}
                placeholderTextColor={theme.subText}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance={dark ? 'dark' : 'light'}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.subText, backgroundColor: theme.bg }]}>PIN / Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Lock size={20} color={theme.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your PIN"
                placeholderTextColor={theme.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                keyboardAppearance={dark ? 'dark' : 'light'}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={20} color={theme.subText} />
                  : <Eye size={20} color={theme.subText} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.helpLink}>
            <Text style={[styles.helpText, { color: theme.primary }]}>Need help?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.primary }, isLoginDisabled && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoginDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  tenantBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  tenantBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    position: 'absolute',
    top: -9,
    left: 14,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 16,
    maxHeight: 200,
    zIndex: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  helpLink: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#548235',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#548235',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default Login;
