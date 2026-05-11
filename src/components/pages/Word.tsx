import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import type { ThemeColors, WordData } from '../../types/app';

function formatContextLabel(contextType?: string, contextKey?: string) {
  if (!contextType || contextType === 'generic') return 'Generic';
  const label = contextKey
    ? contextKey
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

  if (contextType === 'subject') return label || 'Subject';
  if (contextType === 'grade') return label || 'Grade';
  if (contextType === 'exam') return label ? label.toUpperCase() : 'Exam';
  return label || contextType;
}

function normalizeMeaning(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getContextualMeaningGroups(senses: NonNullable<WordData['senses']>) {
  const groups = new Map<string, { labels: string[]; meaning: string }>();

  senses.forEach((sense) => {
    const key = normalizeMeaning(sense.meaning);
    const label = formatContextLabel(sense.contextType, sense.contextKey);
    const existing = groups.get(key);

    if (existing) {
      if (!existing.labels.includes(label)) {
        existing.labels.push(label);
      }
      return;
    }

    groups.set(key, {
      labels: [label],
      meaning: sense.meaning,
    });
  });

  return Array.from(groups.values());
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

  return <WordDefinitionCard colors={colors} word={word} onSpeak={onSpeak} isWide={isWide} />;
}

export function WordDefinitionCard({
  colors,
  word,
  onSpeak,
  onOpenWord,
  isWide,
}: {
  colors: ThemeColors;
  word: WordData;
  onSpeak: (word: string) => void;
  onOpenWord?: (word: string) => void;
  isWide: boolean;
}) {
  const contextualMeaningGroups =
    word.senses && word.senses.length > 1 ? getContextualMeaningGroups(word.senses) : [];

  const card = (
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
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onSpeak(word.word);
              }}
              hitSlop={8}
            >
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
              {contextualMeaningGroups.length > 1 ? (
                <View style={styles.contextSenseList}>
                  <Text style={[styles.infoTitle, { color: colors.primaryText }]}>
                    Contextual Meanings
                  </Text>
                  {contextualMeaningGroups.map((group) => (
                    <View
                      key={`${group.labels.join('|')}-${group.meaning}`}
                      style={[styles.contextSenseItem, { borderColor: colors.borderColor }]}
                    >
                      <Text style={[styles.contextSenseLabel, { color: colors.primaryText }]}>
                        {group.labels.join(', ')}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.primaryText }]}>
                        {group.meaning}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
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

  if (!onOpenWord) {
    return card;
  }

  return <Pressable onPress={() => onOpenWord(word.word)}>{card}</Pressable>;
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
