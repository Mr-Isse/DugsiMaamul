import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from '../src/store/store';
import { loadUserInfo, logout } from '../src/store/authSlice';
import {
  loadSelectedSchool,
  bootstrapTenantSchool,
  clearSelectedSchool,
} from '../src/store/schoolSlice';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { ThemeProvider } from '../src/theme';
import { TenantProvider } from '../src/tenant';
import { SCHOOL_CONFIG, IS_WHITELABEL_SCHOOL } from '../config';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AuthGuard = ({ children }) => {
  const { userInfo, loading: authLoading } = useSelector((state) => state.auth);
  const {
    selectedSchool,
    loading: schoolLoading,
    bootstrapStatus,
    bootstrapError,
  } = useSelector((state) => state.school);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (IS_WHITELABEL_SCHOOL) {
      dispatch(bootstrapTenantSchool());
    } else {
      dispatch(loadSelectedSchool());
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadUserInfo());
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo?.school?.subdomain || !selectedSchool?.subdomain) return;
    if (
      userInfo.school.subdomain.toLowerCase() !==
      selectedSchool.subdomain.toLowerCase()
    ) {
      dispatch(logout());
      dispatch(clearSelectedSchool());
    }
  }, [userInfo, selectedSchool, dispatch]);

  useEffect(() => {
    if (authLoading || schoolLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    const inSelectionPage = segments[0] === 'school-selection';

    const isSchoolSelected = !!selectedSchool;

    if (IS_WHITELABEL_SCHOOL) {
      if (bootstrapStatus === 'failed' && !isSchoolSelected) {
        return;
      }
    } else if (!isSchoolSelected && !inSelectionPage) {
      router.replace('/school-selection');
      return;
    }

    if (isSchoolSelected && inSelectionPage && !IS_WHITELABEL_SCHOOL) {
      router.replace('/(public)');
      return;
    }

    if (isSchoolSelected && !userInfo && !inAuthGroup && !inPublicGroup && !inSelectionPage) {
      router.replace('/(public)');
    } else if (userInfo) {
      // Handle cross-role navigation
      if (userInfo.role === 'student' && (segments[0] === '(teacher)' || segments[0] === '(parent)')) {
        if (segments[0] !== '(student)') {
          router.replace('/(student)');
        }
        return;
      }
      if (userInfo.role === 'teacher' && (segments[0] === '(student)' || segments[0] === '(parent)')) {
        if (segments[0] !== '(teacher)') {
          router.replace('/(teacher)');
        }
        return;
      }
      if (userInfo.role === 'parent' && (segments[0] === '(student)' || segments[0] === '(teacher)')) {
        if (segments[0] !== '(parent)') {
          router.replace('/(parent)');
        }
        return;
      }

      if (inAuthGroup || segments[0] === '(public)') {
        if (userInfo.role === 'student') {
          router.replace('/(student)');
        } else if (userInfo.role === 'teacher') {
          router.replace('/(teacher)');
        } else if (userInfo.role === 'parent') {
          router.replace('/(parent)');
        }
      }
    }
  }, [userInfo, segments, authLoading, schoolLoading, selectedSchool, bootstrapStatus]);

  if (authLoading || schoolLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={SCHOOL_CONFIG.primaryColor} />
      </View>
    );
  }

  if (IS_WHITELABEL_SCHOOL && bootstrapStatus === 'failed') {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ textAlign: 'center', marginBottom: 12, fontWeight: '700' }}>
          Could not load school
        </Text>
        <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 20 }}>
          {String(bootstrapError)}
        </Text>
        <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, marginBottom: 16 }}>
          Check TENANT_ID and API_URL in .env. Backend needs ALLOW_DEV_TENANT_HEADER=true (local)
          or ALLOW_MOBILE_TENANT_HEADER=true so x-tenant-id is accepted.
        </Text>
        <TouchableOpacity
          onPress={() => dispatch(bootstrapTenantSchool())}
          style={{
            backgroundColor: SCHOOL_CONFIG.primaryColor,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {children}
    </>
  );
};

const RootLayoutNav = () => {
  return (
    <Provider store={store}>
      <TenantProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(public)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(student)" />
                <Stack.Screen name="(teacher)" />
                <Stack.Screen name="(parent)" />
                <Stack.Screen name="school-selection" />
              </Stack>
            </AuthGuard>
          </GestureHandlerRootView>
        </ThemeProvider>
      </TenantProvider>
    </Provider>
  );
};

export default RootLayoutNav;

