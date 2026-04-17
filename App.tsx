import words from 'an-array-of-english-words';
import didYouMean from 'didyoumean';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useAppDispatch, useAppSelector } from './src/store/hooks';

import { DesktopHeader, MobileHeader } from './src/components/Header';
import {
  AboutPage,
  AuthPage,
  HomePage,
  QuizPage,
  SharePage,
  WordListPage,
  WordPage,
} from './src/components/pages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { api } from './src/config/api';
import { themeMap } from './src/config/themes';
import { examOptions, gradeOptions, subjectOptions } from './src/data/sampleWords';
import { ReduxProvider } from './src/store/ReduxProvider';
import { styles } from './src/styles/appStyles';
import type { NavItem } from './src/types/app';
import {
  setRoute,
  setPage,
  setAuthMessage,
  setAuthUser,
  setAuthLoading,
  closeDropdown,
  closeDrawer,
  setCurrentWord,
  toggleTheme,
  logout,
  setQuery,
  setDrawerOpen,
  setOpenDropdown,
} from './src/store/slices';
import { loadRouteData } from './src/store/thunks';

WebBrowser.maybeCompleteAuthSession();

const dictionaryWords = words;
const navItems: NavItem[] = [
  { label: 'Subject', dropdown: subjectOptions },
  { label: 'Grades', dropdown: gradeOptions },
  { label: 'Exam', dropdown: examOptions },
  { label: 'Quiz' },
  { label: 'Dictionary A-Z' },
];

function AppComponent() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const [fontsLoaded] = useFonts({
    AntDesign: require('./assets/fonts/AntDesign.ttf') as never,
    Entypo: require('./assets/fonts/Entypo.ttf') as never,
    Feather: require('./assets/fonts/Feather.ttf') as never,
    FontAwesome: require('./assets/fonts/FontAwesome.ttf') as never,
    'FontAwesome5Free-Solid': require('./assets/fonts/FontAwesome5_Solid.ttf') as never,
    'FontAwesome5Free-Regular': require('./assets/fonts/FontAwesome5_Regular.ttf') as never,
    'FontAwesome5Free-Light': require('./assets/fonts/FontAwesome5_Regular.ttf') as never,
    'FontAwesome5Free-Brand': require('./assets/fonts/FontAwesome5_Brands.ttf') as never,
    MaterialCommunityIcons: require('./assets/fonts/MaterialCommunityIcons.ttf') as never,
    MaterialIcons: require('./assets/fonts/MaterialIcons.ttf') as never,
  });

  // Redux selectors - all state now comes from Redux
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTabletUp = width >= 768;

  // Theme
  const theme = useAppSelector((state) => state.theme.mode);

  // Routing
  const route = useAppSelector((state) => state.routing.route);
  const page = useAppSelector((state) => state.routing.page);
  const limit = useAppSelector((state) => state.routing.limit);

  // Search/Query
  const query = useAppSelector((state) => state.ui.query);
  const suggestions = useAppSelector((state) => state.ui.suggestions);

  // UI State
  const drawerOpen = useAppSelector((state) => state.ui.drawerOpen);
  const openDropdown = useAppSelector((state) => state.ui.openDropdown);

  // Auth
  const authUser = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authMessage = useAppSelector((state) => state.auth.message);

  // Speech
  const preferredVoice = useAppSelector((state) => state.speech.preferredVoice);

  // Words/Content
  const wordOfTheDay = useAppSelector((state) => state.words.wordOfTheDay);
  const currentWord = useAppSelector((state) => state.words.currentWord);
  const collectionWords = useAppSelector((state) => state.words.collectionWords);
  const loading = useAppSelector((state) => state.words.loading);
  const backendError = useAppSelector((state) => state.words.backendError);

  const filteredWords = useMemo(
    () => collectionWords.slice((page - 1) * limit, page * limit),
    [collectionWords, page, limit]
  );

  const totalPages = Math.max(1, Math.ceil(collectionWords.length / limit));

  useEffect(() => {
    void dispatch(loadRouteData(route));
  }, [dispatch, route]);

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#1a1a1a', fontFamily: 'Courier', fontWeight: '700' }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const colors = themeMap[theme];
  const topButtons = ['Social Media', 'About Us', authUser ? 'Logout' : 'Login / Signup'] as const;

  // Navigation dispatcher
  const navigate = (next: typeof route) => {
    dispatch(setRoute(next));
    dispatch(closeDropdown());
    dispatch(closeDrawer());
    dispatch(setPage(1));
    dispatch(setAuthMessage(''));
    if (next.page !== 'word') dispatch(setCurrentWord(null));
  };

  // Handle header button clicks
  const handleHeaderButton = (label: string) => {
    if (label === 'Dictionary A-Z') navigate({ page: 'dictionary' });
    else if (label === 'Quiz') navigate({ page: 'quiz' });
    else if (label === 'Social Media') navigate({ page: 'share' });
    else if (label === 'About Us') navigate({ page: 'about' });
    else if (label === 'Login / Signup') navigate({ page: 'auth' });
    else if (label === 'Logout') {
      dispatch(logout());
      navigate({ page: 'home' });
    }
  };

  // Handle search submission
  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    const corrected = didYouMean(trimmed, dictionaryWords);
    const target = typeof corrected === 'string' ? corrected : trimmed;
    navigate({ page: 'word', word: target });
  };

  // Check if navigation item is active
  const isActive = (label: string): boolean => {
    if (label === 'Dictionary A-Z') return route.page === 'dictionary';
    if (label === 'Quiz') return route.page === 'quiz';
    if (label === 'Subject') return route.page === 'subject';
    if (label === 'Grades') return route.page === 'grade';
    if (label === 'Exam') return route.page === 'exam';
    if (label === 'About Us') return route.page === 'about';
    if (label === 'Login / Signup') return route.page === 'auth';
    if (label === 'Social Media') return route.page === 'share';
    return false;
  };

  // Get filter title for current route
  const formattedFilterTitle = (): string => {
    if (route.page === 'subject') {
      return subjectOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'grade') {
      return gradeOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'exam') {
      return (
        examOptions.find((item) => item.value === route.value)?.label ?? route.value
      ).toUpperCase();
    }
    return '';
  };

  // Get page title for current route
  const pageTitle = (): string => {
    switch (route.page) {
      case 'home':
        return 'home';
      case 'dictionary':
        return 'dictionary';
      case 'word':
        return currentWord?.word || route.word;
      case 'about':
        return 'about';
      case 'share':
        return 'share';
      case 'quiz':
        return 'quiz';
      case 'subject':
        return 'subject';
      case 'grade':
        return 'grade';
      case 'exam':
        return 'exam';
      case 'auth':
        return 'auth';
      default:
        return 'grabvocab';
    }
  };

  // Speech handler
  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      voice: preferredVoice,
      pitch: 1.0,
      rate: Platform.OS === 'web' ? 0.9 : 0.82,
    });
  };

  // Auth handlers with Redux dispatch
  const handleGoogleAuth = async (idToken: string) => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthMessage(''));
    try {
      const data = await api.googleLogin(idToken);
      dispatch(setAuthUser(data.user));
      await AsyncStorage.setItem('grabvocab_frontend_user', JSON.stringify(data));
      navigate({ page: 'home' });
    } catch (error: any) {
      dispatch(setAuthMessage(error.message || 'Google authentication failed.'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleAuthSubmit = async ({ email, mode, password, username }: any) => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthMessage(''));
    try {
      let data;
      if (mode === 'login') {
        data = await api.login(email, password);
      } else {
        data = await api.register(username, email, password);
      }
      dispatch(setAuthUser(data.user));
      await AsyncStorage.setItem('grabvocab_frontend_user', JSON.stringify(data));
      navigate({ page: 'home' });
    } catch (error: any) {
      dispatch(setAuthMessage(error.message || 'Authentication failed.'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundGradient }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.root}>
        {isMobile ? (
          <MobileHeader
            colors={colors}
            drawerOpen={drawerOpen}
            onClose={() => dispatch(closeDrawer())}
            onOpen={() => dispatch(setDrawerOpen(true))}
            onToggleTheme={() => dispatch(toggleTheme())}
            theme={theme}
            query={query}
            setQuery={(q) => dispatch(setQuery(q))}
            suggestions={suggestions}
            onSuggestionPress={(word) => {
              navigate({ page: 'word', word });
            }}
            onSearch={handleSearch}
            onHeaderButton={handleHeaderButton}
            onDropdownSelect={(group, value) => {
              if (group === 'Subject') navigate({ page: 'subject', value });
              if (group === 'Grades') navigate({ page: 'grade', value });
              if (group === 'Exam') navigate({ page: 'exam', value });
            }}
            isActive={isActive}
            topButtons={[...topButtons]}
            navItems={navItems}
          />
        ) : (
          <DesktopHeader
            colors={colors}
            openDropdown={openDropdown as any}
            setOpenDropdown={(d) => dispatch(d ? setOpenDropdown(d) : closeDropdown())}
            onToggleTheme={() => dispatch(toggleTheme())}
            theme={theme}
            query={query}
            setQuery={(q) => dispatch(setQuery(q))}
            suggestions={suggestions}
            onSuggestionPress={(word) => {
              navigate({ page: 'word', word });
            }}
            onSearch={handleSearch}
            onHeaderButton={handleHeaderButton}
            onDropdownSelect={(group, value) => {
              if (group === 'Subject') navigate({ page: 'subject', value });
              if (group === 'Grades') navigate({ page: 'grade', value });
              if (group === 'Exam') navigate({ page: 'exam', value });
            }}
            currentUser={authUser}
            isActive={isActive}
            onHome={() => navigate({ page: 'home' })}
            topButtons={[...topButtons]}
            navItems={navItems}
          />
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainContainer}>
            {route.page === 'home' && (
              <HomePage
                colors={colors}
                word={wordOfTheDay}
                onSpeak={speak}
                onOpenWord={(word) => navigate({ page: 'word', word })}
                backendError={backendError}
              />
            )}

            {route.page === 'word' && (
              <WordPage
                colors={colors}
                word={currentWord}
                onSpeak={speak}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
              />
            )}

            {route.page === 'dictionary' && (
              <WordListPage
                colors={colors}
                title="Dictionary Words (A-Z)"
                words={filteredWords}
                limit={limit}
                onSpeak={speak}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={() => {}}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
                cardVariant="word"
              />
            )}

            {route.page === 'subject' && (
              <WordListPage
                colors={colors}
                title={`Words for: ${formattedFilterTitle()}`}
                words={filteredWords}
                limit={limit}
                onSpeak={speak}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={() => {}}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
              />
            )}

            {route.page === 'grade' && (
              <WordListPage
                colors={colors}
                title={`Words for: ${formattedFilterTitle()}`}
                words={filteredWords}
                limit={limit}
                onSpeak={speak}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={() => {}}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
              />
            )}

            {route.page === 'exam' && (
              <WordListPage
                colors={colors}
                title={`Words for: ${formattedFilterTitle()}`}
                words={filteredWords}
                limit={limit}
                onSpeak={speak}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={() => {}}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
              />
            )}

            {route.page === 'about' && <AboutPage colors={colors} />}
            {route.page === 'share' && (
              <SharePage colors={colors} word={currentWord ?? wordOfTheDay} />
            )}
            {route.page === 'quiz' && (
              <QuizPage
                colors={colors}
                onSelectExam={(value) => navigate({ page: 'exam', value })}
                onSelectGrade={(value) => navigate({ page: 'grade', value })}
                onSelectRandom={() => navigate({ page: 'dictionary' })}
                onSelectSubject={(value) => navigate({ page: 'subject', value })}
              />
            )}
            {route.page === 'auth' && (
              <AuthPage
                colors={colors}
                loading={authLoading}
                message={authMessage}
                onGoogleAuth={handleGoogleAuth}
                onSubmit={handleAuthSubmit}
              />
            )}
          </View>
        </ScrollView>
      </View>
      <Text style={[styles.hiddenTitle, { color: colors.backgroundGradient }]}>{pageTitle()}</Text>
    </SafeAreaView>
  );
}

function AppWrapper() {
  return (
    <ReduxProvider>
      <AppComponent />
    </ReduxProvider>
  );
}

export default AppWrapper;
