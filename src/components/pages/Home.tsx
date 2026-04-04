import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import { formatDate } from '../../utils/formatDate';
import type { ThemeColors, WordData } from '../../types/app';

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
