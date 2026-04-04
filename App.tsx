import AsyncStorage from '@react-native-async-storage/async-storage';
import words from 'an-array-of-english-words';
import didYouMean from 'didyoumean';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';

import { DesktopHeader, MobileHeader } from './src/components/Header';
import { AboutPage, AuthPage, HomePage, QuizPage, SharePage, WordListPage, WordPage } from './src/components/pages';
import { api, type BackendWord } from './src/config/api';
import { examOptions, gradeOptions, subjectOptions } from './src/data/sampleWords';
import { ReduxProvider } from './src/store/ReduxProvider';
import { styles } from './src/styles/appStyles';
import type {
  DropdownKey,
  NavItem,
  RouteState,
  SpeechVoice,
  ThemeColors,
  ThemeMode,
  User,
  WordData,
} from './src/types/app';

WebBrowser.maybeCompleteAuthSession();

const dictionaryWords = words;
const STORAGE_KEY = 'grabvocab_frontend_user';
const THEME_STORAGE_KEY = 'grabvocab_frontend_theme';
const navItems: NavItem[] = [
  { label: 'Subject', dropdown: subjectOptions },
  { label: 'Grades', dropdown: gradeOptions },
  { label: 'Exam', dropdown: examOptions },
  { label: 'Quiz' },
  { label: 'Dictionary A-Z' },
];

const themeMap: Record<ThemeMode, ThemeColors> = {
  light: {
    backgroundGradient: '#f5f5f5',
    backgroundColor: 'transparent',
    accentColor: '#000000',
    primaryText: '#1a1a1a',
    secondaryText: '#555555',
    borderColor: '#cbcbce',
    headerColor: '#e5e3e3',
    buttonBg: '#ffffff',
    chipBg: '#e6f4ff',
    chipText: '#4dabf7',
    overlay: 'rgba(0,0,0,0.4)',
    dropdownHover: '#ffbaba',
    spotlightBg: '#dcfce7',
  },
  dark: {
    backgroundGradient: '#1f1f1f',
    backgroundColor: 'transparent',
    accentColor: '#ffffff',
    primaryText: '#fafafa',
    secondaryText: '#a3a3a3',
    borderColor: '#8c8989',
    headerColor: '#454545',
    buttonBg: '#222222',
    chipBg: '#2d3d4d',
    chipText: '#8ec5ff',
    overlay: 'rgba(0,0,0,0.55)',
    dropdownHover: '#6b4b4b',
    spotlightBg: '#204533',
  },
};

function normalizeWord(word: Partial<BackendWord> & { word: string; meaning: string }): WordData {
  return {
    word: word.word,
    meaning: word.meaning,
    partOfSpeech: word.partOfSpeech ?? '',
    pronunciation: word.pronunciation ?? '',
    wordForms: word.wordForms ?? [],
    exampleSentence: word.exampleSentence ?? '',
    synonyms: word.synonyms ?? [],
    antonyms: word.antonyms ?? [],
    memoryTrick: word.memoryTrick ?? '',
    origin: word.origin ?? '',
    imageURL: word.imageURL,
  };
}

function formatDate(date?: string) {
  return date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function AppComponent() {
  const [fontsLoaded] = useFonts({
    AntDesign: require('./assets/fonts/AntDesign.ttf'),
    Entypo: require('./assets/fonts/Entypo.ttf'),
    Feather: require('./assets/fonts/Feather.ttf'),
    FontAwesome: require('./assets/fonts/FontAwesome.ttf'),
    'FontAwesome5Free-Solid': require('./assets/fonts/FontAwesome5_Solid.ttf'),
    'FontAwesome5Free-Regular': require('./assets/fonts/FontAwesome5_Regular.ttf'),
    'FontAwesome5Free-Light': require('./assets/fonts/FontAwesome5_Regular.ttf'),
    'FontAwesome5Free-Brand': require('./assets/fonts/FontAwesome5_Brands.ttf'),
    MaterialCommunityIcons: require('./assets/fonts/MaterialCommunityIcons.ttf'),
    MaterialIcons: require('./assets/fonts/MaterialIcons.ttf'),
  });

  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTabletUp = width >= 768;

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [route, setRoute] = useState<RouteState>({ page: 'home' });
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [preferredVoice, setPreferredVoice] = useState<string | undefined>(undefined);

  const [wordOfTheDay, setWordOfTheDay] = useState<WordData | null>(null);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [collectionWords, setCollectionWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as { token: string; user: User };
        const response = await api.me(parsed.token);
        const session = { token: parsed.token, user: response.user };
        setAuthUser(response.user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setAuthUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
    })();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    const loadPreferredVoice = async () => {
      try {
        const voices = (await Speech.getAvailableVoicesAsync()) as SpeechVoice[];
        if (!active || !voices.length) return;

        const englishVoices = voices.filter((voice) => voice.language?.toLowerCase().startsWith('en'));
        const rankedVoice =
          englishVoices.find((voice) => voice.quality?.toLowerCase() === 'enhanced') ??
          englishVoices.find((voice) => /siri|samantha|ava|premium|natural|enhanced/i.test(voice.name ?? '')) ??
          englishVoices.find((voice) => voice.language?.toLowerCase() === 'en-us') ??
          englishVoices[0];

        if (rankedVoice?.identifier) {
          setPreferredVoice(rankedVoice.identifier);
        }
      } catch {
        setPreferredVoice(undefined);
      }
    };

    void loadPreferredVoice();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query.trim())}`);
        const data = (await response.json()) as Array<{ word: string }>;
        if (active) setSuggestions(data.slice(0, 5).map((item) => item.word));
      } catch {
        if (active) setSuggestions([]);
      }
    };

    void loadSuggestions();

    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    let active = true;

    const loadWordOfTheDay = async () => {
      try {
        const data = await api.wordOfDay();
        if (!active) return;
        setWordOfTheDay({
          ...normalizeWord(data),
          date: data.date,
        });
      } catch (error: any) {
        if (!active) return;
        setWordOfTheDay(null);
        setBackendError(error.message || 'Backend unavailable');
      }
    };

    void loadWordOfTheDay();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void loadRouteData(route, page);
  }, [route, page]);

  const filteredWords = useMemo(
    () => collectionWords.slice((page - 1) * limit, page * limit),
    [collectionWords, page, limit]
  );

  const totalPages = Math.max(1, Math.ceil(collectionWords.length / limit));

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#1a1a1a', fontFamily: 'Courier', fontWeight: '700' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const colors = themeMap[theme];
  const topButtons = ['Social Media', 'About Us', authUser ? 'Logout' : 'Login / Signup'] as const;

  const navigate = (next: RouteState) => {
    setRoute(next);
    setOpenDropdown(null);
    setDrawerOpen(false);
    setPage(1);
    setAuthMessage('');
    if (next.page !== 'word') setCurrentWord(null);
  };

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      voice: preferredVoice,
      pitch: 1.0,
      rate: Platform.OS === 'web' ? 0.9 : 0.82,
    });
  };

  async function loadRouteData(nextRoute: RouteState, nextPage: number) {
    if (nextRoute.page === 'home' || nextRoute.page === 'about' || nextRoute.page === 'share' || nextRoute.page === 'quiz' || nextRoute.page === 'auth') {
      return;
    }

    setLoading(true);
    setBackendError(null);

    try {
      if (nextRoute.page === 'word') {
        const data = await api.define(nextRoute.word);
        setCurrentWord(normalizeWord(data.result));
      } else if (nextRoute.page === 'dictionary') {
        const data = await api.dictionary(1, 50, '');
        setCollectionWords(data.words.map(normalizeWord));
      } else if (nextRoute.page === 'subject') {
        const data = await api.subject(nextRoute.value, 1, 50);
        setCollectionWords(data.words.map(normalizeWord));
      } else if (nextRoute.page === 'grade') {
        const data = await api.grade(nextRoute.value, 1, 50);
        setCollectionWords(data.words.map(normalizeWord));
      } else if (nextRoute.page === 'exam') {
        const data = await api.exam(nextRoute.value, 1, 50);
        setCollectionWords(data.words.map(normalizeWord));
      }
    } catch (error: any) {
      if (nextRoute.page === 'word') setCurrentWord(null);
      else setCollectionWords([]);
      setBackendError(error.message || 'Backend unavailable');
    } finally {
      setLoading(false);
    }
  }

  const handleHeaderButton = async (label: string) => {
    if (label === 'Dictionary A-Z') navigate({ page: 'dictionary' });
    else if (label === 'Quiz') navigate({ page: 'quiz' });
    else if (label === 'Social Media') navigate({ page: 'share' });
    else if (label === 'About Us') navigate({ page: 'about' });
    else if (label === 'Login / Signup') navigate({ page: 'auth' });
    else if (label === 'Logout') {
      setAuthUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
      navigate({ page: 'home' });
    }
  };

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    const corrected = didYouMean(trimmed, dictionaryWords);
    const target = typeof corrected === 'string' ? corrected : trimmed;
    navigate({ page: 'word', word: target });
    setQuery('');
    setSuggestions([]);
  };

  const isActive = (label: string) => {
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

  const formattedFilterTitle = () => {
    if (route.page === 'subject') {
      return subjectOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'grade') {
      return gradeOptions.find((item) => item.value === route.value)?.label ?? route.value;
    }
    if (route.page === 'exam') {
      return (examOptions.find((item) => item.value === route.value)?.label ?? route.value).toUpperCase();
    }
    return '';
  };

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
            onClose={() => setDrawerOpen(false)}
            onOpen={() => setDrawerOpen(true)}
            onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            theme={theme}
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            onSuggestionPress={(word) => {
              navigate({ page: 'word', word });
              setQuery('');
              setSuggestions([]);
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
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            theme={theme}
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            onSuggestionPress={(word) => {
              navigate({ page: 'word', word });
              setQuery('');
              setSuggestions([]);
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
                onPageChange={setPage}
                onLimitChange={setLimit}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
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
                onPageChange={setPage}
                onLimitChange={setLimit}
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
                onPageChange={setPage}
                onLimitChange={setLimit}
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
                onPageChange={setPage}
                onLimitChange={setLimit}
                isWide={isTabletUp}
                loading={loading}
                backendError={backendError}
              />
            )}

            {route.page === 'about' && <AboutPage colors={colors} />}
            {route.page === 'share' && <SharePage colors={colors} word={currentWord ?? wordOfTheDay} />}
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
                onGoogleAuth={async (idToken) => {
                  setAuthLoading(true);
                  setAuthMessage('');
                  try {
                    const data = await api.googleLogin(idToken);
                    setAuthUser(data.user);
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    navigate({ page: 'home' });
                  } catch (error: any) {
                    setAuthMessage(error.message || 'Google authentication failed.');
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                onSubmit={async ({ email, mode, password, username }) => {
                  setAuthLoading(true);
                  setAuthMessage('');
                  try {
                    if (mode === 'login') {
                      const data = await api.login(email, password);
                      setAuthUser(data.user);
                      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                      navigate({ page: 'home' });
                    } else {
                      const data = await api.register(username, email, password);
                      setAuthUser(data.user);
                      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                      navigate({ page: 'home' });
                    }
                  } catch (error: any) {
                    setAuthMessage(error.message || 'Authentication failed.');
                  } finally {
                    setAuthLoading(false);
                  }
                }}
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
