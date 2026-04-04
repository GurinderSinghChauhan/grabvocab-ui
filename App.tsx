import AsyncStorage from '@react-native-async-storage/async-storage';
import words from 'an-array-of-english-words';
import didYouMean from 'didyoumean';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useFonts } from 'expo-font';

import { api, type BackendWord } from './src/config/api';
import { examOptions, gradeOptions, subjectOptions } from './src/data/sampleWords';

type ThemeMode = 'light' | 'dark';
type DropdownKey = 'Subject' | 'Grades' | 'Exam' | null;

type RouteState =
  | { page: 'home' }
  | { page: 'dictionary' }
  | { page: 'word'; word: string }
  | { page: 'about' }
  | { page: 'share' }
  | { page: 'quiz' }
  | { page: 'subject'; value: string }
  | { page: 'grade'; value: string }
  | { page: 'exam'; value: string }
  | { page: 'auth' };

type ThemeColors = {
  backgroundGradient: string;
  backgroundColor: string;
  accentColor: string;
  primaryText: string;
  secondaryText: string;
  borderColor: string;
  headerColor: string;
  buttonBg: string;
  chipBg: string;
  chipText: string;
  overlay: string;
  dropdownHover: string;
  spotlightBg: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
};

type WordData = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciation: string;
  wordForms: string[];
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  memoryTrick: string;
  origin: string;
  imageURL?: string;
  date?: string;
};

type SpeechVoice = {
  identifier?: string;
  language?: string;
  name?: string;
  quality?: string;
};

WebBrowser.maybeCompleteAuthSession();

const logo = require('./assets/grabvocab.png');
const dictionaryWords = words;
const STORAGE_KEY = 'grabvocab_frontend_user';
const THEME_STORAGE_KEY = 'grabvocab_frontend_theme';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const navItems = [
  { label: 'Subject', dropdown: subjectOptions },
  { label: 'Grades', dropdown: gradeOptions },
  { label: 'Exam', dropdown: examOptions },
  { label: 'Quiz' },
  { label: 'Dictionary A-Z' },
] as const;

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

export default function App() {
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

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#1a1a1a', fontFamily: 'Courier', fontWeight: '700' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

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

  const colors = themeMap[theme];
  const topButtons = ['Social Media', 'About Us', authUser ? 'Logout' : 'Login / Signup'] as const;

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

function DesktopHeader({
  colors,
  openDropdown,
  setOpenDropdown,
  onToggleTheme,
  theme,
  query,
  setQuery,
  suggestions,
  onSuggestionPress,
  onSearch,
  onHeaderButton,
  onDropdownSelect,
  currentUser,
  isActive,
  onHome,
  topButtons,
}: {
  colors: ThemeColors;
  openDropdown: DropdownKey;
  setOpenDropdown: (value: DropdownKey) => void;
  onToggleTheme: () => void;
  theme: ThemeMode;
  query: string;
  setQuery: (value: string) => void;
  suggestions: string[];
  onSuggestionPress: (word: string) => void;
  onSearch: () => void;
  onHeaderButton: (label: string) => void | Promise<void>;
  onDropdownSelect: (group: 'Subject' | 'Grades' | 'Exam', value: string) => void;
  currentUser: User | null;
  isActive: (label: string) => boolean;
  onHome: () => void;
  topButtons: string[];
}) {
  return (
    <View style={[styles.header, { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor }]}>
      <View style={styles.desktopTopBar}>
        <Pressable onPress={onHome} style={styles.logoWrap}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.logoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </Pressable>

        <View style={styles.desktopButtonRow}>
          {topButtons.map((label) => (
            <HeaderButton key={label} active={isActive(label)} label={label} colors={colors} onPress={() => void onHeaderButton(label)} />
          ))}

          {currentUser ? (
            <View style={[styles.userPill, { borderColor: colors.borderColor, backgroundColor: colors.chipBg }]}>
              <FontAwesome name="user-circle" size={14} color={colors.chipText} />
              <Text style={[styles.userPillText, { color: colors.chipText }]}>{currentUser.username || currentUser.email}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onToggleTheme}
            style={[styles.themeButton, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}
          >
            {theme === 'light' ? <Feather name="moon" size={18} color={colors.primaryText} /> : <Feather name="sun" size={18} color={colors.primaryText} />}
          </Pressable>
        </View>
      </View>

      <View style={styles.desktopNavRow}>
        <View style={styles.navWrap}>
          {navItems.map((item) =>
            'dropdown' in item ? (
              <View key={item.label} style={styles.dropdownContainer}>
                <Pressable onPress={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}>
                  <HeaderButton active={isActive(item.label) || openDropdown === item.label} label={item.label} colors={colors} onPress={() => setOpenDropdown(openDropdown === item.label ? null : item.label)} />
                </Pressable>
                {openDropdown === item.label && (
                  <View style={[styles.dropdownMenu, { borderColor: colors.borderColor, backgroundColor: colors.buttonBg }]}>
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() => onDropdownSelect(item.label, subItem.value)}
                        style={({ pressed }) => [styles.dropdownItem, pressed && { backgroundColor: colors.dropdownHover }]}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.primaryText }]}>{subItem.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <HeaderButton key={item.label} active={isActive(item.label)} label={item.label} colors={colors} onPress={() => void onHeaderButton(item.label)} />
            )
          )}
        </View>

        <View style={styles.searchBlock}>
          <View style={styles.searchFieldWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSearch}
              placeholder="Search words..."
              placeholderTextColor={colors.secondaryText}
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.backgroundColor || colors.buttonBg,
                  color: colors.primaryText,
                  borderColor: colors.borderColor,
                },
              ]}
            />
            <Pressable onPress={onSearch} style={styles.searchIcon}>
              <Feather name="search" size={18} color={colors.primaryText} />
            </Pressable>
            {suggestions.length > 0 && (
              <View style={[styles.suggestionsBox, { backgroundColor: colors.buttonBg, borderColor: colors.borderColor }]}>
                {suggestions.map((word) => (
                  <Pressable key={word} onPress={() => onSuggestionPress(word)} style={styles.suggestionItem}>
                    <Text style={[styles.suggestionText, { color: colors.primaryText }]}>{word}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function MobileHeader({
  colors,
  drawerOpen,
  onClose,
  onOpen,
  onToggleTheme,
  theme,
  query,
  setQuery,
  suggestions,
  onSuggestionPress,
  onSearch,
  onHeaderButton,
  onDropdownSelect,
  isActive,
  topButtons,
}: {
  colors: ThemeColors;
  drawerOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onToggleTheme: () => void;
  theme: ThemeMode;
  query: string;
  setQuery: (value: string) => void;
  suggestions: string[];
  onSuggestionPress: (word: string) => void;
  onSearch: () => void;
  onHeaderButton: (label: string) => void | Promise<void>;
  onDropdownSelect: (group: 'Subject' | 'Grades' | 'Exam', value: string) => void;
  isActive: (label: string) => boolean;
  topButtons: string[];
}) {
  return (
    <View style={[styles.header, { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor }]}>
      <View style={styles.mobileTopRow}>
        <View style={styles.mobileBrandRow}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.mobileLogoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </View>
        <View style={styles.mobileActions}>
          <Pressable
            onPress={onToggleTheme}
            style={[styles.mobileThemeButton, { backgroundColor: colors.backgroundColor || colors.buttonBg, borderColor: colors.borderColor }]}
          >
            {theme === 'light' ? <Feather name="moon" size={18} color={colors.accentColor} /> : <Feather name="sun" size={18} color={colors.accentColor} />}
          </Pressable>
          <Pressable onPress={onOpen} style={styles.mobileMenuButton}>
            <Feather name="menu" size={22} color={colors.accentColor} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mobileSearchWrap}>
        <View style={styles.searchFieldWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            placeholder="Search words..."
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.backgroundColor || colors.buttonBg,
                color: colors.primaryText,
                borderColor: colors.borderColor,
              },
            ]}
          />
          <Pressable onPress={onSearch} style={styles.searchIcon}>
            <Feather name="search" size={18} color={colors.primaryText} />
          </Pressable>
          {suggestions.length > 0 && (
            <View style={[styles.suggestionsBox, { backgroundColor: colors.buttonBg, borderColor: colors.borderColor }]}>
              {suggestions.map((word) => (
                <Pressable key={word} onPress={() => onSuggestionPress(word)} style={styles.suggestionItem}>
                  <Text style={[styles.suggestionText, { color: colors.primaryText }]}>{word}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={[styles.drawerOverlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
          <Pressable style={[styles.drawerPanel, { backgroundColor: colors.headerColor, borderLeftColor: colors.borderColor }]} onPress={() => {}}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.accentColor }]}>Menu</Text>
              <Pressable onPress={onClose} style={styles.drawerCloseButton}>
                <Feather name="x" size={20} color={colors.accentColor} />
              </Pressable>
            </View>

            <View style={styles.drawerSection}>
              {topButtons.map((label) => (
                <MobileDrawerButton key={label} active={isActive(label)} label={label} colors={colors} onPress={() => void onHeaderButton(label)} />
              ))}
            </View>

            <View style={styles.drawerSection}>
              {navItems.map((item) =>
                'dropdown' in item ? (
                  <View key={item.label} style={styles.drawerGroup}>
                    <Text style={[styles.drawerGroupTitle, { color: colors.accentColor }]}>{item.label}</Text>
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() => onDropdownSelect(item.label, subItem.value)}
                        style={[styles.drawerSubButton, { backgroundColor: colors.backgroundColor || colors.buttonBg }]}
                      >
                        <Text style={[styles.drawerSubButtonText, { color: colors.primaryText }]}>{subItem.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <MobileDrawerButton key={item.label} active={isActive(item.label)} label={item.label} colors={colors} onPress={() => void onHeaderButton(item.label)} />
                )
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function HeaderButton({ label, active, colors, onPress }: { label: string; active?: boolean; colors: ThemeColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.headerButton,
        {
          backgroundColor: active ? colors.chipBg : colors.backgroundColor || colors.buttonBg,
          borderColor: active ? colors.chipText : colors.borderColor,
        },
      ]}
    >
      <View style={styles.headerButtonInner}>
        <HeaderIcon label={label} color={active ? colors.chipText : colors.primaryText} />
        <Text style={[styles.headerButtonText, { color: active ? colors.chipText : colors.primaryText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function MobileDrawerButton({ label, active, colors, onPress }: { label: string; active?: boolean; colors: ThemeColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.mobileDrawerButton,
        {
          backgroundColor: active ? colors.chipBg : colors.backgroundColor || colors.buttonBg,
          borderColor: active ? colors.chipText : colors.borderColor,
        },
      ]}
    >
      <View style={styles.headerButtonInner}>
        <HeaderIcon label={label} color={active ? colors.chipText : colors.primaryText} />
        <Text style={[styles.headerButtonText, { color: active ? colors.chipText : colors.primaryText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function HomePage({
  colors,
  word,
  onSpeak,
  onOpenWord,
  backendError,
}: {
  colors: ThemeColors;
  word: WordData | null;
  onSpeak: (word: string) => void;
  onOpenWord: (word: string) => void;
  backendError: string | null;
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={styles.homePageStack}>
      <View style={[styles.heroGrid, !isWide && styles.stackedGrid]}>
        <View style={[styles.heroPanel, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Vocabulary Platform</Text>
          <Text style={[styles.heroTitle, { color: colors.primaryText }]}>
            Production-ready vocabulary learning for students, exams, and everyday curiosity.
          </Text>
          <Text style={[styles.heroCopy, { color: colors.secondaryText }]}>
            GrabVocab combines dictionary lookup, curated academic word sets, subject and grade filtering,
            quizzes, and word-of-the-day discovery in one frontend backed by your live MongoDB content.
          </Text>
        </View>

        <View style={styles.homeSideStack}>
          <InfoCard colors={colors} title="Dictionary Search" copy="Fast lookup with pronunciation, examples, synonyms, antonyms, and memory tricks." />
          <InfoCard colors={colors} title="Structured Learning" copy="Browse by subject, grade, and exam without leaving the same frontend system." />
          <InfoCard colors={colors} title="Reusable APIs" copy="The UI stays aligned with the current production API routes and database model." />
        </View>
      </View>

      <View style={[styles.featureLinks, !isWide && styles.stackedGrid]}>
        <FeatureCard colors={colors} title="Dictionary" copy="Explore the complete A-Z collection." />
        <FeatureCard colors={colors} title="Quiz Paths" copy="Start a random quiz or narrow by topic." />
        <FeatureCard colors={colors} title="Platform Story" copy="See how the product is positioned for learners." />
      </View>

      <View style={[styles.contentGrid, !isWide && styles.stackedGrid]}>
        <View style={[styles.wordCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <View style={styles.wordCardHeader}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Word of the Day</Text>
              <Text style={[styles.wordDate, { color: colors.secondaryText }]}>{formatDate(word?.date)}</Text>
            </View>
            {word ? (
              <Pressable style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]} onPress={() => onSpeak(word.word)}>
                <Feather name="volume-2" size={16} color={colors.primaryText} />
                <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Listen</Text>
              </Pressable>
            ) : null}
          </View>
          {word ? (
            <>
              <Text style={[styles.wordCardWord, { color: colors.primaryText }]}>{word.word}</Text>
              <Text style={[styles.wordCardMeaning, { color: colors.secondaryText }]}>{word.meaning}</Text>
              <View style={styles.ctaRow}>
                <Pressable onPress={() => onOpenWord(word.word)} style={[styles.primaryActionButton, { backgroundColor: '#3b82f6' }]}>
                  <Text style={styles.primaryActionText}>See Full Definition</Text>
                  <Feather name="arrow-right" size={16} color="#ffffff" />
                </Pressable>
              </View>
            </>
          ) : (
            <Text style={[styles.wordCardMeaning, { color: colors.secondaryText }]}>{backendError || 'Word of the day unavailable.'}</Text>
          )}
        </View>

        <View style={styles.homeSideStack}>
          <InfoCard colors={colors} title="Built For Production" copy="This frontend runs on the live backend routes and keeps the same vocabulary product model intact." />
          <InfoCard colors={colors} title="Learning Paths" copy="Use subject collections for classroom study, grade lists for age-targeted practice, and exam filters for focused prep." />
        </View>
      </View>
    </View>
  );
}

function WordPage({
  colors,
  word,
  onSpeak,
  isWide,
  loading,
  backendError,
}: {
  colors: ThemeColors;
  word: WordData | null;
  onSpeak: (word: string) => void;
  isWide: boolean;
  loading: boolean;
  backendError: string | null;
}) {
  if (loading) {
    return (
      <View style={styles.textPage}>
        <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>Loading word details...</Text>
      </View>
    );
  }

  if (!word) {
    return (
      <View style={styles.textPage}>
        <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>{backendError || 'Word not found.'}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wordDetailCard,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        },
      ]}
    >
      <View style={styles.wordTitleRow}>
        <Text style={styles.detailWordTitle}>{word.word}</Text>
        <Pressable onPress={() => onSpeak(word.word)}>
          <Feather name="volume-2" size={24} color={colors.primaryText} />
        </Pressable>
      </View>
      <Text style={[styles.pronunciation, { color: colors.primaryText }]}>/{word.pronunciation || word.word}/</Text>

      <View style={[styles.wordDetailGrid, isWide && styles.wordDetailGridWide]}>
        <View style={styles.wordDetailColumn}>
          <InfoBlock title="Meaning" value={word.meaning} colors={colors} />
          <InfoBlock title="Example" value={word.exampleSentence || 'No example available.'} colors={colors} />
          <InfoBlock title="Memory Trick" value={word.memoryTrick || 'No memory trick available.'} colors={colors} />
          <InfoBlock title="Origin" value={word.origin || 'No origin available.'} colors={colors} />
        </View>
        <View style={styles.wordDetailColumn}>
          <InfoBlock title="Part of Speech" value={word.partOfSpeech || 'Unknown'} colors={colors} />
          <InfoBlock title="Word Forms" value={word.wordForms.join(', ') || 'Not available'} colors={colors} />
          <InfoBlock title="Synonyms" value={word.synonyms.join(', ') || 'Not available'} colors={colors} />
          <InfoBlock title="Antonyms" value={word.antonyms.join(', ') || 'Not available'} colors={colors} />
        </View>
      </View>
    </View>
  );
}

function WordListPage({
  colors,
  title,
  words,
  limit,
  onSpeak,
  page,
  totalPages,
  onPageChange,
  onLimitChange,
  isWide,
  loading,
  backendError,
}: {
  colors: ThemeColors;
  title: string;
  words: WordData[];
  limit: number;
  onSpeak: (word: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (value: number) => void;
  isWide: boolean;
  loading: boolean;
  backendError: string | null;
}) {
  return (
    <View style={styles.pageWrap}>
      <Text style={[styles.listPageTitle, { color: colors.primaryText }]}>{title}</Text>
      <View style={styles.wordListStack}>
        {loading ? (
          <Text style={[styles.emptyState, { color: colors.primaryText }]}>Loading words...</Text>
        ) : words.length > 0 ? (
          words.map((word) => <SubjectWordCard key={word.word} word={word} colors={colors} onSpeak={onSpeak} isWide={isWide} />)
        ) : (
          <Text style={[styles.emptyState, { color: colors.primaryText }]}>{backendError || 'No words found.'}</Text>
        )}
      </View>
      {words.length > 0 && (
        <View style={[styles.paginationBar, { borderColor: colors.borderColor }]}>
          <View style={[styles.rowsPill, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
            <Text style={[styles.rowsLabel, { color: colors.primaryText }]}>Rows</Text>
            {[5, 10, 20, 50].map((value) => (
              <Pressable key={value} onPress={() => onLimitChange(value)} style={styles.rowsOption}>
                <Text style={[styles.rowsOptionText, { color: limit === value ? '#3b82f6' : colors.primaryText }]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.paginationActions}>
            <Pressable onPress={() => onPageChange(Math.max(page - 1, 1))} disabled={page === 1} style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}>
              <Feather name="arrow-left" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Prev</Text>
            </Pressable>
            <View style={[styles.pagePill, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
              <Text style={[styles.paginationText, { color: colors.primaryText }]}>{page} of {totalPages}</Text>
            </View>
            <Pressable onPress={() => onPageChange(Math.min(page + 1, totalPages))} disabled={page === totalPages} style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}>
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Next</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function SubjectWordCard({
  word,
  colors,
  onSpeak,
  isWide,
}: {
  word: WordData;
  colors: ThemeColors;
  onSpeak: (word: string) => void;
  isWide: boolean;
}) {
  return (
    <View
      style={[
        styles.subjectCard,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        },
      ]}
    >
      <View style={styles.wordTitleRow}>
        <Text style={styles.detailWordTitle}>{word.word}</Text>
        <Pressable onPress={() => onSpeak(word.word)}>
          <Feather name="volume-2" size={24} color={colors.primaryText} />
        </Pressable>
      </View>
      <Text style={[styles.pronunciationSmall, { color: colors.primaryText }]}>/{word.pronunciation || word.word}/</Text>

      <View style={[styles.wordDetailGrid, isWide && styles.wordDetailGridWide]}>
        <View style={styles.wordDetailColumn}>
          <InfoBlock title="Meaning" value={word.meaning} colors={colors} />
          <InfoBlock title="Example" value={word.exampleSentence || 'No example available.'} colors={colors} />
          <InfoBlock title="Memory Trick" value={word.memoryTrick || 'No memory trick available.'} colors={colors} />
          <InfoBlock title="Origin" value={word.origin || 'No origin available.'} colors={colors} />
        </View>
        <View style={styles.wordDetailColumn}>
          <InfoBlock title="Part of Speech" value={word.partOfSpeech || 'Unknown'} colors={colors} />
          <InfoBlock title="Word Forms" value={word.wordForms.join(', ') || 'Not available'} colors={colors} />
          <InfoBlock title="Synonyms" value={word.synonyms.join(', ') || 'Not available'} colors={colors} />
          <InfoBlock title="Antonyms" value={word.antonyms.join(', ') || 'Not available'} colors={colors} />
        </View>
      </View>
    </View>
  );
}

function AboutPage({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.textPage}>
      <Text style={[styles.aboutTitle, { color: colors.accentColor }]}>About Grab Vocab</Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        Welcome to <Text style={{ color: colors.accentColor }}>Grab Vocab</Text> — your dedicated space to grow your vocabulary and strengthen your language skills. Words are powerful, and we&apos;re here to help you master them.
      </Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        At Grab Vocab, we believe learning should be smart, visual, and enjoyable. That&apos;s why we blend beautifully crafted word definitions, example sentences, memory tricks, and quizzes to help you remember and apply what you learn.
      </Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        Whether you&apos;re preparing for competitive exams, enhancing your academic language, or just feeding your curiosity, Grab Vocab adapts to your journey.
      </Text>
    </View>
  );
}

function SharePage({ colors, word }: { colors: ThemeColors; word: WordData | null }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [shareWord, setShareWord] = useState(word?.word || 'anachronism');
  const [shareMeaning, setShareMeaning] = useState(word?.meaning || 'A thing belonging to a period other than that in which it exists.');
  const shareText = `Today I learned: ${shareWord}\n\n${shareMeaning}\n\nvia GrabVocab.com`;

  useEffect(() => {
    if (word?.word) setShareWord(word.word);
    if (word?.meaning) setShareMeaning(word.meaning);
  }, [word]);

  return (
    <View style={styles.pageStack}>
      <View style={[styles.pageCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Share</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Turn vocabulary learning into something worth sharing.</Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>Prepare a shareable word card and distribute it across social platforms or direct links.</Text>
      </View>

      <View style={[styles.contentGrid, !isWide && styles.stackedGrid]}>
        <View style={[styles.shareCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <TextInput
            value={shareWord}
            onChangeText={setShareWord}
            style={[styles.authInput, { borderColor: colors.borderColor, color: colors.primaryText }]}
          />
          <TextInput
            multiline
            numberOfLines={6}
            value={shareMeaning}
            onChangeText={setShareMeaning}
            style={[styles.shareTextArea, { borderColor: colors.borderColor, color: colors.primaryText, backgroundColor: colors.backgroundColor || colors.buttonBg }]}
          />
        </View>

        <View style={[styles.shareCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <Text style={[styles.detailWordTitle, { color: colors.primaryText }]}>{shareWord}</Text>
          <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>{shareMeaning}</Text>
          <View style={styles.shareIcons}>
            <FontAwesome name="facebook" size={24} color="#1877F2" />
            <FontAwesome name="twitter" size={24} color="#1DA1F2" />
            <FontAwesome name="whatsapp" size={24} color="#25D366" />
            <Pressable
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
              onPress={async () => {
                try {
                  await Share.share({ message: shareText });
                } catch {
                  if (Platform.OS === 'web') Alert.alert('Share failed', 'Unable to open share dialog.');
                }
              }}
            >
              <Feather name="link" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Copy</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function QuizPage({
  colors,
  onSelectExam,
  onSelectGrade,
  onSelectRandom,
  onSelectSubject,
}: {
  colors: ThemeColors;
  onSelectExam: (value: string) => void;
  onSelectGrade: (value: string) => void;
  onSelectRandom: () => void;
  onSelectSubject: (value: string) => void;
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const subjects = [
    'english-literature',
    'history',
    'geography',
    'biology',
    'chemistry',
    'physics',
    'political-science',
    'sociology',
    'psychology',
  ];
  const grades = Array.from({ length: 12 }, (_, index) => `grade-${index + 1}`);
  const exams = ['pcat', 'act', 'sat', 'psat', 'mcat', 'cpa', 'ged', 'toefl'];

  return (
    <View style={styles.pageStack}>
      <View style={[styles.pageCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Quiz</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Choose how you want to practice.</Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>Start a random quiz or narrow the question set by subject, grade, or exam.</Text>
      </View>

      <View style={[styles.featureLinks, !isWide && styles.stackedGrid]}>
        <Pressable onPress={onSelectRandom} style={{ flex: 1 }}>
          <View style={[styles.quizCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <MaterialCommunityIcons name="shuffle-variant" size={24} color={colors.primaryText} />
          <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>Random Quiz</Text>
          <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>Pull a mixed set from the main quiz API.</Text>
          </View>
        </Pressable>

        <View style={[styles.quizCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <View style={styles.quizHeadingRow}>
            <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Subject</Text>
          </View>
          {subjects.map((subject) => (
            <Pressable key={subject} onPress={() => onSelectSubject(subject)} style={[styles.secondaryActionButton, styles.quizAction, { borderColor: colors.borderColor }]}>
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>{subject.replaceAll('-', ' ')}</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.quizCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
          <View style={styles.quizHeadingRow}>
            <MaterialIcons name="school" size={18} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Grade</Text>
          </View>
          {grades.slice(0, 6).map((grade) => (
            <Pressable key={grade} onPress={() => onSelectGrade(grade)} style={[styles.secondaryActionButton, styles.quizAction, { borderColor: colors.borderColor }]}>
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>{grade.replace('-', ' ')}</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
          <View style={styles.quizHeadingRow}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Exam</Text>
          </View>
          {exams.slice(0, 4).map((exam) => (
            <Pressable key={exam} onPress={() => onSelectExam(exam)} style={[styles.secondaryActionButton, styles.quizAction, { borderColor: colors.borderColor }]}>
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>{exam.toUpperCase()}</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function AuthPage({
  colors,
  loading,
  message,
  onGoogleAuth,
  onSubmit,
}: {
  colors: ThemeColors;
  loading: boolean;
  message: string;
  onGoogleAuth: (idToken: string) => void;
  onSubmit: (payload: { mode: 'login' | 'register'; username: string; email: string; password: string }) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'grabvocab' });
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri,
  });

  useEffect(() => {
    const idToken = response?.type === 'success' ? response.params?.id_token : undefined;
    if (idToken) {
      onGoogleAuth(idToken);
    }
  }, [onGoogleAuth, response]);

  const googleEnabled = Boolean(
    GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID
  );

  return (
    <View style={[styles.contentGrid, styles.authGrid, !isWide && styles.stackedGrid]}>
      <View style={[styles.pageCard, styles.authIntroCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Account</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Sign in to save progress and keep your vocabulary workflow consistent.</Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>Use local authentication or social providers already wired through NextAuth.</Text>
      </View>

      <View style={[styles.authCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
        <View style={styles.pageStack}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>Access quizzes, saved activity, and the shared learning experience.</Text>
          </View>
          {mode === 'register' && (
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Full name"
              placeholderTextColor={colors.secondaryText}
              style={[styles.authInput, { borderColor: colors.borderColor, color: colors.primaryText }]}
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            autoCapitalize="none"
            style={[styles.authInput, { borderColor: colors.borderColor, color: colors.primaryText }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            style={[styles.authInput, { borderColor: colors.borderColor, color: colors.primaryText }]}
          />
          <Pressable
            onPress={() => onSubmit({ mode, username, email, password })}
            disabled={loading}
            style={[styles.primaryActionButton, { backgroundColor: '#3b82f6', opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={styles.primaryActionText}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</Text>
          </Pressable>
          <View style={styles.ctaRow}>
            <Pressable
              disabled={loading || !request || !googleEnabled}
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor, opacity: loading || !googleEnabled ? 0.6 : 1 }]}
              onPress={() => {
                if (!googleEnabled) {
                  Alert.alert('Google login unavailable', 'Set the Google client IDs in frontend-app/.env and backend env first.');
                  return;
                }
                void promptAsync();
              }}
            >
              <FontAwesome name="google" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Google</Text>
            </Pressable>
            <Pressable style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]} onPress={() => Alert.alert('Unavailable', 'Social auth is not wired in this app yet.')}>
              <FontAwesome name="facebook" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Facebook</Text>
            </Pressable>
          </View>
          {message ? <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>{message}</Text> : null}
          <Pressable style={[styles.secondaryActionButton, styles.authSwitchButton, { borderColor: colors.borderColor }]} onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}>
            <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>{mode === 'login' ? 'Need an account?' : 'Already registered?'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function InfoBlock({ title, value, colors }: { title: string; value: string; colors: ThemeColors }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={[styles.infoTitle, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: colors.primaryText }]}>{value}</Text>
    </View>
  );
}

function InfoCard({ colors, title, copy }: { colors: ThemeColors; title: string; copy: string }) {
  return (
    <View style={[styles.infoCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
      <Text style={[styles.infoCardTitle, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoCardCopy, { color: colors.primaryText }]}>{copy}</Text>
    </View>
  );
}

function FeatureCard({ colors, title, copy }: { colors: ThemeColors; title: string; copy: string }) {
  return (
    <View style={[styles.featureCard, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}>
      <Text style={[styles.infoCardTitle, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoCardCopy, { color: colors.primaryText }]}>{copy}</Text>
    </View>
  );
}

function HeaderIcon({ label, color }: { label: string; color: string }) {
  if (label === 'Social Media') return <Entypo name="share" size={14} color={color} />;
  if (label === 'Login / Signup' || label === 'Logout') return <FontAwesome name="user-circle" size={14} color={color} />;
  if (label === 'About Us') return <AntDesign name="info-circle" size={14} color={color} />;
  if (label === 'Dictionary A-Z') return <MaterialCommunityIcons name="book-open-variant" size={14} color={color} />;
  if (label === 'Quiz') return <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={color} />;
  if (label === 'Grades') return <MaterialIcons name="grade" size={14} color={color} />;
  if (label === 'Exam') return <MaterialCommunityIcons name="bookmark-multiple-outline" size={14} color={color} />;
  if (label === 'Subject') return <FontAwesome5 name="book-reader" size={14} color={color} />;
  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 100,
    elevation: 20,
  },
  desktopTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  desktopButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userPillText: {
    fontSize: 13,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopNavRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 110,
  },
  navWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 120,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    left: 0,
    width: 220,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
    zIndex: 130,
    elevation: 30,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'Courier',
  },
  headerButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontFamily: 'Courier',
  },
  searchBlock: {
    width: 320,
  },
  searchFieldWrap: {
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 44,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Courier',
  },
  searchIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 6,
    zIndex: 30,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionText: {
    fontFamily: 'Courier',
    fontSize: 14,
  },
  mobileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogoText: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  mobileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileThemeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileSearchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  drawerOverlay: {
    flex: 1,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,
    borderLeftWidth: 1,
    padding: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 28,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  drawerCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerSection: {
    gap: 12,
    marginBottom: 20,
  },
  drawerGroup: {
    gap: 10,
  },
  drawerGroupTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  drawerSubButton: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  drawerSubButtonText: {
    fontSize: 14,
    fontFamily: 'Courier',
  },
  mobileDrawerButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    padding: 24,
    zIndex: 0,
    gap: 24,
  },
  pageStack: {
    gap: 24,
  },
  homePageStack: {
    gap: 24,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  stackedGrid: {
    flexDirection: 'column',
  },
  heroPanel: {
    flex: 1.4,
    borderWidth: 1,
    borderRadius: 28,
    padding: 28,
  },
  heroEyebrow: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Courier',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  heroCopy: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Courier',
  },
  homeSideStack: {
    flex: 1,
    gap: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  infoCardTitle: {
    marginBottom: 6,
    fontSize: 15,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  infoCardCopy: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Courier',
  },
  featureLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  pageCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  wordCard: {
    flex: 1.2,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  wordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  wordDate: {
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  wordCardWord: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'Courier',
    textTransform: 'capitalize',
  },
  wordCardMeaning: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Courier',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  wordDetailCard: {
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailWordTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#3b82f6',
    fontFamily: 'Courier',
    textTransform: 'capitalize',
  },
  pronunciation: {
    marginBottom: 14,
    fontFamily: 'Courier',
    fontSize: 18,
  },
  pronunciationSmall: {
    marginBottom: 12,
    fontFamily: 'Courier',
    fontSize: 16,
  },
  wordDetailGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  wordDetailGridWide: {
    flexDirection: 'row',
  },
  wordDetailColumn: {
    flex: 1,
    gap: 12,
  },
  infoBlock: {
    gap: 4,
  },
  infoTitle: {
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Courier',
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Courier',
  },
  pageWrap: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  listPageTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 16,
  },
  wordListStack: {
    gap: 16,
  },
  subjectCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  emptyState: {
    fontSize: 18,
    fontFamily: 'Courier',
    textAlign: 'center',
    marginVertical: 40,
  },
  paginationBar: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  rowsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowsLabel: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  rowsOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowsOptionText: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  paginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  pagePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paginationText: {
    fontSize: 16,
    fontFamily: 'Courier',
  },
  sectionTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  sectionCopy: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Courier',
  },
  textPage: {
    maxWidth: 980,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },
  aboutTitle: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  aboutParagraph: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Courier',
  },
  shareCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  shareTextArea: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Courier',
    textAlignVertical: 'top',
  },
  shareIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 18,
  },
  quizCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  quizCardTitle: {
    fontSize: 18,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  quizHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizAction: {
    justifyContent: 'space-between',
  },
  authGrid: {
    alignItems: 'stretch',
  },
  authIntroCard: {
    maxWidth: 420,
  },
  authCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  authInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Courier',
  },
  authSubmit: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authSubmitText: {
    fontFamily: 'Courier',
    fontSize: 15,
    fontWeight: '700',
  },
  authSwitch: {
    fontFamily: 'Courier',
    fontSize: 15,
    fontWeight: '700',
  },
  authSwitchButton: {
    alignSelf: 'flex-start',
  },
  hiddenTitle: {
    position: 'absolute',
    opacity: 0,
    fontSize: 1,
  },
});
