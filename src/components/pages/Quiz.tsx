import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import type { ThemeColors } from '../../types/app';

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
