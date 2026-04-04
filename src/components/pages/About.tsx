import { Text, View } from 'react-native';
import type { ThemeColors } from '../../types/app';
import { styles } from '../../styles/appStyles';

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
