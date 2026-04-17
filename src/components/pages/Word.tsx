import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import type { ThemeColors, WordData } from '../../types/app';

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

  return <WordDefinitionCard colors={colors} word={word} onSpeak={onSpeak} isWide={isWide} />;
}

export function WordDefinitionCard({
  colors,
  word,
  onSpeak,
  isWide,
}: {
  colors: ThemeColors;
  word: WordData;
  onSpeak: (word: string) => void;
  isWide: boolean;
}) {
  return (
    <View
      style={[
        styles.wordDetailCard,
        { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor },
      ]}
    >
      <View style={[styles.wordDetailLayout, isWide && styles.wordDetailLayoutWide]}>
        {word.imageURL ? (
          <View
            style={[
              styles.wordImageWrap,
              isWide && styles.wordImageWrapWide,
              { borderColor: colors.borderColor, backgroundColor: colors.buttonBg },
            ]}
          >
            <Image source={{ uri: word.imageURL }} style={styles.wordImage} resizeMode="cover" />
          </View>
        ) : null}

        <View
          style={[
            styles.wordDetailContent,
            isWide && word.imageURL && styles.wordDetailContentWithImage,
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
              <InfoBlock
                title="Origin"
                value={word.origin || 'No origin available.'}
                colors={colors}
              />
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
      </View>
    </View>
  );
}

function InfoBlock({
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
