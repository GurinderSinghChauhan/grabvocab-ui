import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import type { ThemeColors, WordData } from '../../types/app';
import { WordDefinitionCard } from './Word';

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
  cardVariant = 'compact',
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
  cardVariant?: 'compact' | 'word';
}) {
  return (
    <View style={styles.pageWrap}>
      <Text style={[styles.listPageTitle, { color: colors.primaryText }]}>{title}</Text>
      <View
        style={[
          styles.wordListStack,
          cardVariant === 'word' && styles.dictionaryWordList,
          cardVariant === 'word' && isWide && styles.dictionaryWordListWide,
        ]}
      >
        {loading ? (
          <Text style={[styles.emptyState, { color: colors.primaryText }]}>Loading words...</Text>
        ) : words.length > 0 ? (
          words.map((word) =>
            cardVariant === 'word' ? (
              <DictionaryWordCard
                key={word.word}
                word={word}
                colors={colors}
                onSpeak={onSpeak}
                isWide={isWide}
              />
            ) : (
              <SubjectWordCard
                key={word.word}
                word={word}
                colors={colors}
                onSpeak={onSpeak}
                isWide={isWide}
              />
            )
          )
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

function DictionaryWordCard({
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
  return <WordDefinitionCard colors={colors} word={word} onSpeak={onSpeak} isWide={isWide} />;
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
