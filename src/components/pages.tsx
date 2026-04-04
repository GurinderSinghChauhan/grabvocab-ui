import { Alert, Pressable, Share, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { Feather, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import { styles } from '../styles/appStyles';
import { formatDate } from '../utils/formatDate';
import type { ThemeColors, WordData } from '../types/app';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

export function HomePage({
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
        <View
          style={[
            styles.heroPanel,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
          <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>
            Vocabulary Platform
          </Text>
          <Text style={[styles.heroTitle, { color: colors.primaryText }]}>
            Production-ready vocabulary learning for students, exams, and everyday curiosity.
          </Text>
          <Text style={[styles.heroCopy, { color: colors.secondaryText }]}>
            GrabVocab combines dictionary lookup, curated academic word sets, subject and grade
            filtering, quizzes, and word-of-the-day discovery in one frontend backed by your live
            MongoDB content.
          </Text>
        </View>

        <View style={styles.homeSideStack}>
          <InfoCard
            colors={colors}
            title="Dictionary Search"
            copy="Fast lookup with pronunciation, examples, synonyms, antonyms, and memory tricks."
          />
          <InfoCard
            colors={colors}
            title="Structured Learning"
            copy="Browse by subject, grade, and exam without leaving the same frontend system."
          />
          <InfoCard
            colors={colors}
            title="Reusable APIs"
            copy="The UI stays aligned with the current production API routes and database model."
          />
        </View>
      </View>

      <View style={[styles.featureLinks, !isWide && styles.stackedGrid]}>
        <FeatureCard
          colors={colors}
          title="Dictionary"
          copy="Explore the complete A-Z collection."
        />
        <FeatureCard
          colors={colors}
          title="Quiz Paths"
          copy="Start a random quiz or narrow by topic."
        />
        <FeatureCard
          colors={colors}
          title="Platform Story"
          copy="See how the product is positioned for learners."
        />
      </View>

      <View style={[styles.contentGrid, !isWide && styles.stackedGrid]}>
        <View
          style={[
            styles.wordCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
          <View style={styles.wordCardHeader}>
            <View>
              <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>
                Word of the Day
              </Text>
              <Text style={[styles.wordDate, { color: colors.secondaryText }]}>
                {formatDate(word?.date)}
              </Text>
            </View>
            {word ? (
              <Pressable
                style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
                onPress={() => onSpeak(word.word)}
              >
                <Feather name="volume-2" size={16} color={colors.primaryText} />
                <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                  Listen
                </Text>
              </Pressable>
            ) : null}
          </View>
          {word ? (
            <>
              <Text style={[styles.wordCardWord, { color: colors.primaryText }]}>{word.word}</Text>
              <Text style={[styles.wordCardMeaning, { color: colors.secondaryText }]}>
                {word.meaning}
              </Text>
              <View style={styles.ctaRow}>
                <Pressable
                  onPress={() => onOpenWord(word.word)}
                  style={[styles.primaryActionButton, { backgroundColor: '#3b82f6' }]}
                >
                  <Text style={styles.primaryActionText}>See Full Definition</Text>
                  <Feather name="arrow-right" size={16} color="#ffffff" />
                </Pressable>
              </View>
            </>
          ) : (
            <Text style={[styles.wordCardMeaning, { color: colors.secondaryText }]}>
              {backendError || 'Word of the day unavailable.'}
            </Text>
          )}
        </View>

        <View style={styles.homeSideStack}>
          <InfoCard
            colors={colors}
            title="Built For Production"
            copy="This frontend runs on the live backend routes and keeps the same vocabulary product model intact."
          />
          <InfoCard
            colors={colors}
            title="Learning Paths"
            copy="Use subject collections for classroom study, grade lists for age-targeted practice, and exam filters for focused prep."
          />
        </View>
      </View>
    </View>
  );
}

export function WordPage({
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
        <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
          Loading word details...
        </Text>
      </View>
    );
  }

  if (!word) {
    return (
      <View style={styles.textPage}>
        <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
          {backendError || 'Word not found.'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wordDetailCard,
        { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor },
      ]}
    >
      <View style={styles.wordTitleRow}>
        <Text style={styles.detailWordTitle}>{word.word}</Text>
        <Pressable onPress={() => onSpeak(word.word)}>
          <Feather name="volume-2" size={24} color={colors.primaryText} />
        </Pressable>
      </View>
      <Text style={[styles.pronunciation, { color: colors.primaryText }]}>
        /{word.pronunciation || word.word}/
      </Text>

      <View style={[styles.wordDetailGrid, isWide && styles.wordDetailGridWide]}>
        <View style={styles.wordDetailColumn}>
          <InfoBlock title="Meaning" value={word.meaning} colors={colors} />
          <InfoBlock
            title="Example"
            value={word.exampleSentence || 'No example available.'}
            colors={colors}
          />
          <InfoBlock
            title="Memory Trick"
            value={word.memoryTrick || 'No memory trick available.'}
            colors={colors}
          />
          <InfoBlock title="Origin" value={word.origin || 'No origin available.'} colors={colors} />
        </View>
        <View style={styles.wordDetailColumn}>
          <InfoBlock
            title="Part of Speech"
            value={word.partOfSpeech || 'Unknown'}
            colors={colors}
          />
          <InfoBlock
            title="Word Forms"
            value={word.wordForms.join(', ') || 'Not available'}
            colors={colors}
          />
          <InfoBlock
            title="Synonyms"
            value={word.synonyms.join(', ') || 'Not available'}
            colors={colors}
          />
          <InfoBlock
            title="Antonyms"
            value={word.antonyms.join(', ') || 'Not available'}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
}

export function WordListPage({
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
          words.map((word) => (
            <SubjectWordCard
              key={word.word}
              word={word}
              colors={colors}
              onSpeak={onSpeak}
              isWide={isWide}
            />
          ))
        ) : (
          <Text style={[styles.emptyState, { color: colors.primaryText }]}>
            {backendError || 'No words found.'}
          </Text>
        )}
      </View>
      {words.length > 0 && (
        <View style={[styles.paginationBar, { borderColor: colors.borderColor }]}>
          <View
            style={[
              styles.rowsPill,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor || colors.buttonBg,
              },
            ]}
          >
            <Text style={[styles.rowsLabel, { color: colors.primaryText }]}>Rows</Text>
            {[5, 10, 20, 50].map((value) => (
              <Pressable key={value} onPress={() => onLimitChange(value)} style={styles.rowsOption}>
                <Text
                  style={[
                    styles.rowsOptionText,
                    { color: limit === value ? '#3b82f6' : colors.primaryText },
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.paginationActions}>
            <Pressable
              onPress={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
            >
              <Feather name="arrow-left" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Prev</Text>
            </Pressable>
            <Text style={[styles.paginationText, { color: colors.primaryText }]}>
              {page} / {totalPages}
            </Text>
            <Pressable
              onPress={() => onPageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
            >
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>Next</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export function SubjectWordCard({
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
    <Pressable
      onPress={() => onSpeak(word.word)}
      style={[
        styles.subjectCard,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor || colors.buttonBg,
        },
      ]}
    >
      <View style={styles.wordTitleRow}>
        <Text style={[styles.detailWordTitle, { color: colors.primaryText }]}>{word.word}</Text>
        <Feather name="volume-2" size={16} color={colors.primaryText} />
      </View>
      <Text style={[styles.infoValue, { color: colors.primaryText }]}>{word.meaning}</Text>
      {isWide && (word.wordForms.length > 0 || word.synonyms.length > 0) && (
        <View style={styles.wordDetailGridWide}>
          <InfoBlock title="Forms" value={word.wordForms.join(', ') || '—'} colors={colors} />
          <InfoBlock title="Synonyms" value={word.synonyms.join(', ') || '—'} colors={colors} />
        </View>
      )}
    </Pressable>
  );
}

export function AboutPage({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.textPage}>
      <Text style={[styles.aboutTitle, { color: colors.accentColor }]}>About Grab Vocab</Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        Welcome to <Text style={{ color: colors.accentColor }}>Grab Vocab</Text> — your dedicated
        space to grow your vocabulary and strengthen your language skills. Words are powerful, and
        we&apos;re here to help you master them.
      </Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        At Grab Vocab, we believe learning should be smart, visual, and enjoyable. That&apos;s why
        we blend beautifully crafted word definitions, example sentences, memory tricks, and quizzes
        to help you remember and apply what you learn.
      </Text>
      <Text style={[styles.aboutParagraph, { color: colors.primaryText }]}>
        Whether you&apos;re preparing for competitive exams, enhancing your academic language, or
        just feeding your curiosity, Grab Vocab adapts to your journey.
      </Text>
    </View>
  );
}

export function SharePage({ colors, word }: { colors: ThemeColors; word: WordData | null }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [shareWord, setShareWord] = useState(word?.word || 'anachronism');
  const [shareMeaning, setShareMeaning] = useState(
    word?.meaning || 'A thing belonging to a period other than that in which it exists.'
  );
  const shareText = `Today I learned: ${shareWord}\n\n${shareMeaning}\n\nvia GrabVocab.com`;

  useEffect(() => {
    if (word?.word) setShareWord(word.word);
    if (word?.meaning) setShareMeaning(word.meaning);
  }, [word]);

  return (
    <View style={styles.pageStack}>
      <View
        style={[
          styles.pageCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Share</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          Turn vocabulary learning into something worth sharing.
        </Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
          Prepare a shareable word card and distribute it across social platforms or direct links.
        </Text>
      </View>

      <View style={[styles.contentGrid, !isWide && styles.stackedGrid]}>
        <View
          style={[
            styles.shareCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
          <TextInput
            value={shareWord}
            onChangeText={setShareWord}
            style={[
              styles.authInput,
              { borderColor: colors.borderColor, color: colors.primaryText },
            ]}
          />
          <TextInput
            multiline
            numberOfLines={6}
            value={shareMeaning}
            onChangeText={setShareMeaning}
            style={[
              styles.shareTextArea,
              {
                borderColor: colors.borderColor,
                color: colors.primaryText,
                backgroundColor: colors.backgroundColor || colors.buttonBg,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.shareCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
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
                  Alert.alert('Share failed', 'Unable to open share dialog.');
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

export function QuizPage({
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
      <View
        style={[
          styles.pageCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Quiz</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          Choose how you want to practice.
        </Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
          Start a random quiz or narrow the question set by subject, grade, or exam.
        </Text>
      </View>

      <View style={[styles.featureLinks, !isWide && styles.stackedGrid]}>
        <Pressable onPress={onSelectRandom} style={{ flex: 1 }}>
          <View
            style={[
              styles.quizCard,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor || colors.buttonBg,
              },
            ]}
          >
            <MaterialCommunityIcons name="shuffle-variant" size={24} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>Random Quiz</Text>
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
              Pull a mixed set from the main quiz API.
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.quizCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
          <View style={styles.quizHeadingRow}>
            <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Subject</Text>
          </View>
          {subjects.map((subject) => (
            <Pressable
              key={subject}
              onPress={() => onSelectSubject(subject)}
              style={[
                styles.secondaryActionButton,
                styles.quizAction,
                { borderColor: colors.borderColor },
              ]}
            >
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                {subject.replaceAll('-', ' ')}
              </Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.quizCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor || colors.buttonBg,
            },
          ]}
        >
          <View style={styles.quizHeadingRow}>
            <MaterialIcons name="school" size={18} color={colors.primaryText} />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Grade</Text>
          </View>
          {grades.slice(0, 6).map((grade) => (
            <Pressable
              key={grade}
              onPress={() => onSelectGrade(grade)}
              style={[
                styles.secondaryActionButton,
                styles.quizAction,
                { borderColor: colors.borderColor },
              ]}
            >
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                {grade.replace('-', ' ')}
              </Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
          <View style={styles.quizHeadingRow}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={18}
              color={colors.primaryText}
            />
            <Text style={[styles.quizCardTitle, { color: colors.primaryText }]}>By Exam</Text>
          </View>
          {exams.slice(0, 4).map((exam) => (
            <Pressable
              key={exam}
              onPress={() => onSelectExam(exam)}
              style={[
                styles.secondaryActionButton,
                styles.quizAction,
                { borderColor: colors.borderColor },
              ]}
            >
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                {exam.toUpperCase()}
              </Text>
              <Feather name="arrow-right" size={16} color={colors.primaryText} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export function AuthPage({
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
  onSubmit: (payload: {
    mode: 'login' | 'register';
    username: string;
    email: string;
    password: string;
  }) => void;
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
      <View
        style={[
          styles.pageCard,
          styles.authIntroCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Account</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          Sign in to save progress and keep your vocabulary workflow consistent.
        </Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
          Use local authentication or social providers already wired through NextAuth.
        </Text>
      </View>

      <View
        style={[
          styles.authCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <View style={styles.pageStack}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
              Access quizzes, saved activity, and the shared learning experience.
            </Text>
          </View>
          {mode === 'register' && (
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Full name"
              placeholderTextColor={colors.secondaryText}
              style={[
                styles.authInput,
                { borderColor: colors.borderColor, color: colors.primaryText },
              ]}
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            autoCapitalize="none"
            style={[
              styles.authInput,
              { borderColor: colors.borderColor, color: colors.primaryText },
            ]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            style={[
              styles.authInput,
              { borderColor: colors.borderColor, color: colors.primaryText },
            ]}
          />
          <Pressable
            onPress={() => onSubmit({ mode, username, email, password })}
            disabled={loading}
            style={[
              styles.primaryActionButton,
              { backgroundColor: '#3b82f6', opacity: loading ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.primaryActionText}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </Text>
          </Pressable>
          <View style={styles.ctaRow}>
            <Pressable
              disabled={loading || !request || !googleEnabled}
              style={[
                styles.secondaryActionButton,
                { borderColor: colors.borderColor, opacity: loading || !googleEnabled ? 0.6 : 1 },
              ]}
              onPress={() => {
                if (!googleEnabled) {
                  Alert.alert(
                    'Google login unavailable',
                    'Set the Google client IDs in frontend-app/.env and backend env first.'
                  );
                  return;
                }
                void promptAsync();
              }}
            >
              <FontAwesome name="google" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                Google
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
              onPress={() =>
                Alert.alert('Unavailable', 'Social auth is not wired in this app yet.')
              }
            >
              <FontAwesome name="facebook" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                Facebook
              </Text>
            </Pressable>
          </View>
          {message ? (
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>{message}</Text>
          ) : null}
          <Pressable
            style={[
              styles.secondaryActionButton,
              styles.authSwitchButton,
              { borderColor: colors.borderColor },
            ]}
            onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          >
            <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
              {mode === 'login' ? 'Need an account?' : 'Already registered?'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function InfoBlock({
  title,
  value,
  colors,
}: {
  title: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.infoBlock}>
      <Text style={[styles.infoTitle, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: colors.primaryText }]}>{value}</Text>
    </View>
  );
}

function InfoCard({ colors, title, copy }: { colors: ThemeColors; title: string; copy: string }) {
  return (
    <View
      style={[
        styles.infoCard,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor || colors.buttonBg,
        },
      ]}
    >
      <Text style={[styles.infoCardTitle, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoCardCopy, { color: colors.primaryText }]}>{copy}</Text>
    </View>
  );
}

function FeatureCard({
  colors,
  title,
  copy,
}: {
  colors: ThemeColors;
  title: string;
  copy: string;
}) {
  return (
    <View
      style={[
        styles.featureCard,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor || colors.buttonBg,
        },
      ]}
    >
      <Text style={[styles.infoCardTitle, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoCardCopy, { color: colors.primaryText }]}>{copy}</Text>
    </View>
  );
}
