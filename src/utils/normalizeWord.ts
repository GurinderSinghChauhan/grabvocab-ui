import type { BackendWord } from '../config/api';
import type { WordData } from '../types/app';

/**
 * Convert backend word response to normalized WordData format
 */
export function normalizeWord(word: Partial<BackendWord> & { word: string; meaning: string }): WordData {
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
