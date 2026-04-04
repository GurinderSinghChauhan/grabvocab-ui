export type ThemeMode = 'light' | 'dark';
export type DropdownKey = 'Subject' | 'Grades' | 'Exam' | null;

export type RouteState =
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

type ColorMap = {
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

export type ThemeColors = ColorMap;

export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
};

export type WordData = {
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

export type SpeechVoice = {
  identifier?: string;
  language?: string;
  name?: string;
  quality?: string;
};

export type NavDropdown = { label: string; value: string };
export type NavItem = { label: string; dropdown?: NavDropdown[] };
