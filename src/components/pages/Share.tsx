import { Alert, Pressable, Share, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';

import { styles } from '../../styles/appStyles';
import type { ThemeColors, WordData } from '../../types/app';

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
